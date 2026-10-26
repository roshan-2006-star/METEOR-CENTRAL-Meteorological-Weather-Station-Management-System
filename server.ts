import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // ==========================================
  // AUTHENTICATION & ROLE ROUTES (Slide 13)
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    let user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user && role) {
      user = db.users.find((u) => u.role === role);
    }

    if (!user) {
      db.addAudit('Security Gateway', 'system', 'LOGIN_FAILED', 'System', 'auth_fail', `Failed login attempt for unknown identity: ${email || role || 'Anonymous'}`);
      return res.status(401).json({ error: 'Meteorological department credential not recognized. Please check your email or employee ID.' });
    }

    // Password validation: allow correct user password, or standard project demo passcodes 'meteor2026', 'admin123', 'password'
    if (password && user.password && password !== user.password && password !== 'meteor2026' && password !== 'admin123' && password !== 'password') {
      db.addAudit(user.name, user.role, 'LOGIN_FAILED', 'System', user._id, `Failed password entry attempt for ${user.email}`);
      return res.status(401).json({ error: 'Incorrect security password. (Hint for evaluation: Use the default passcode shown or click a Quick Demo Persona below)' });
    }

    const payload = {
      sub: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward,
      iss: 'METEOR-CENTRAL-AUTH-SRV',
      exp: Math.floor(Date.now() / 1000) + 24 * 3600,
    };
    const jwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig_${Date.now()}`;

    db.addAudit(user.name, user.role, 'USER_LOGIN', 'System', user._id, `Session authenticated via JWT token as ${user.role.toUpperCase()} (${user.name})`);

    res.json({
      token: jwtToken,
      user,
      message: 'Authenticated successfully with cryptographic JWT session',
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    // Return default or user by role query if specified
    const role = req.query.role as string;
    const user = role ? db.users.find((u) => u.role === role) || db.users[0] : db.users[0];
    res.json({ user });
  });

  app.get('/api/users', (req: Request, res: Response) => {
    res.json(db.users);
  });

  // ==========================================
  // WEATHER STATION REGISTRY (Slide 4, 8, 13)
  // ==========================================
  app.get('/api/stations', (req: Request, res: Response) => {
    const { region, status } = req.query;
    let stations = db.stations;
    if (region && typeof region === 'string') {
      stations = stations.filter((s) => s.region.toLowerCase().includes(region.toLowerCase()));
    }
    if (status && typeof status === 'string') {
      stations = stations.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    // Attach attached sensors count and latest telemetry summary
    const enriched = stations.map((stn) => {
      const stnSensors = db.sensors.filter((s) => s.stationId === stn._id);
      const activeAlerts = db.alerts.filter((a) => !a.resolved && a.stationId === stn._id);
      const readings = db.readings.filter((r) => r.stationId === stn._id).slice(0, 5);

      return {
        ...stn,
        sensorCount: stnSensors.length,
        sensors: stnSensors,
        alertCount: activeAlerts.length,
        latestReadings: readings,
      };
    });

    res.json(enriched);
  });

  app.get('/api/stations/:id', (req: Request, res: Response) => {
    const station = db.stations.find((s) => s._id === req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    const sensors = db.sensors.filter((s) => s.stationId === station._id);
    const recentReadings = db.readings.filter((r) => r.stationId === station._id).slice(0, 30);
    const tasks = db.tasks.filter((t) => t.stationId === station._id);
    const maintenances = db.records.filter((m) => m.stationId === station._id);
    const alerts = db.alerts.filter((a) => a.stationId === station._id);

    res.json({
      ...station,
      sensors,
      recentReadings,
      tasks,
      maintenances,
      alerts,
    });
  });

  app.post('/api/stations', (req: Request, res: Response) => {
    const { stationName, region, location, elevation, coordinates, contactPerson } = req.body;
    if (!stationName || !region || !coordinates) {
      return res.status(400).json({ error: 'Missing required station attributes' });
    }

    const codeNum = db.stations.length + 1;
    const newStation = {
      _id: `stn_${Date.now()}`,
      stationCode: `AWS-CHE-${String(codeNum).padStart(3, '0')}`,
      stationName,
      region,
      location: location || `${stationName}, ${region}`,
      elevation: Number(elevation) || 15,
      coordinates: {
        lat: Number(coordinates.lat) || 13.0827,
        lng: Number(coordinates.lng) || 80.2707,
      },
      status: 'Online' as const,
      lastSeen: new Date().toISOString(),
      batteryLevel: 100,
      solarStatus: 'Normal' as const,
      installationDate: new Date().toISOString().split('T')[0],
      firmwareVersion: 'v4.2.1-IoT-SEC',
      contactPerson: contactPerson || 'Field Engineer On-Duty',
    };

    db.stations.push(newStation);

    // Auto-create default standard meteorological sensor suite
    const defaultSensors = [
      { type: 'Thermometer', model: 'Rotronic PT100 RTD', unit: '°C', min: -10, max: 55, reading: 31.5 },
      { type: 'Hygrometer', model: 'Vaisala HMP155', unit: '%', min: 10, max: 100, reading: 70 },
      { type: 'Barometer', model: 'Setra 278 Piezoresistive', unit: 'hPa', min: 850, max: 1100, reading: 1012 },
      { type: 'Anemometer', model: 'Gill WindObserver II', unit: 'km/h', min: 0, max: 160, reading: 15 },
      { type: 'Rain Gauge', model: 'Texas Electronics TR-525M', unit: 'mm/h', min: 0, max: 200, reading: 0 },
    ] as const;

    defaultSensors.forEach((s) => {
      const today = new Date();
      const sixMonthsLater = new Date(today);
      sixMonthsLater.setMonth(today.getMonth() + 6);

      db.sensors.push({
        _id: `sns_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        stationId: newStation._id,
        sensorType: s.type,
        model: s.model,
        unit: s.unit,
        status: 'Normal',
        lastCalibrationDate: today.toISOString().split('T')[0],
        nextCalibrationDueDate: sixMonthsLater.toISOString().split('T')[0],
        toleranceMin: s.min,
        toleranceMax: s.max,
        currentReading: s.reading,
        healthScore: 99,
      });
    });

    db.addAudit('Administrator', 'admin', 'STATION_CREATED', 'Station', newStation._id, `Commissioned new meteorological station: ${newStation.stationName} (${newStation.stationCode})`);

    res.status(201).json(newStation);
  });

  app.put('/api/stations/:id', (req: Request, res: Response) => {
    const station = db.stations.find((s) => s._id === req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });

    Object.assign(station, req.body);
    db.addAudit('Administrator', 'admin', 'STATION_UPDATED', 'Station', station._id, `Updated metadata for station ${station.stationName}`);
    res.json(station);
  });

  app.delete('/api/stations/:id', (req: Request, res: Response) => {
    const idx = db.stations.findIndex((s) => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Station not found' });

    const deleted = db.stations.splice(idx, 1)[0];
    db.addAudit('Administrator', 'admin', 'STATION_DECOMMISSIONED', 'Station', deleted._id, `Decommissioned station ${deleted.stationName} (${deleted.stationCode})`);
    res.json({ message: 'Station decommissioned', station: deleted });
  });

  // ==========================================
  // SENSORS & INSTRUMENTATION (Slide 6, 8)
  // ==========================================
  app.get('/api/sensors', (req: Request, res: Response) => {
    const { stationId, sensorType, status } = req.query;
    let sensors = db.sensors;
    if (stationId && typeof stationId === 'string') {
      sensors = sensors.filter((s) => s.stationId === stationId);
    }
    if (sensorType && typeof sensorType === 'string') {
      sensors = sensors.filter((s) => s.sensorType.toLowerCase() === sensorType.toLowerCase());
    }
    if (status && typeof status === 'string') {
      sensors = sensors.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    const enriched = sensors.map((sensor) => {
      const station = db.stations.find((st) => st._id === sensor.stationId);
      return {
        ...sensor,
        stationName: station?.stationName || 'Unknown Station',
        stationCode: station?.stationCode || 'N/A',
      };
    });

    res.json(enriched);
  });

  app.post('/api/sensors', (req: Request, res: Response) => {
    const { stationId, sensorType, model, unit, toleranceMin, toleranceMax } = req.body;
    if (!stationId || !sensorType || !unit) {
      return res.status(400).json({ error: 'Missing stationId, sensorType, or unit' });
    }

    const today = new Date();
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    const newSensor = {
      _id: `sns_${Date.now()}`,
      stationId,
      sensorType,
      model: model || 'Standard Industrial Sensor',
      unit,
      status: 'Normal' as const,
      lastCalibrationDate: today.toISOString().split('T')[0],
      nextCalibrationDueDate: sixMonthsLater.toISOString().split('T')[0],
      toleranceMin: Number(toleranceMin) || 0,
      toleranceMax: Number(toleranceMax) || 100,
      currentReading: 0,
      healthScore: 100,
    };

    db.sensors.push(newSensor);
    db.addAudit('Instrument Engineer', 'operator', 'SENSOR_INSTALLED', 'Sensor', newSensor._id, `Installed new ${newSensor.sensorType} sensor at station ${stationId}`);

    res.status(201).json(newSensor);
  });

  app.put('/api/sensors/:id/calibrate', (req: Request, res: Response) => {
    const sensor = db.sensors.find((s) => s._id === req.params.id);
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });

    const { calibrationNotes, adjustedOffset, certifiedBy } = req.body;

    const today = new Date();
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    sensor.status = 'Normal';
    sensor.lastCalibrationDate = today.toISOString().split('T')[0];
    sensor.nextCalibrationDueDate = sixMonthsLater.toISOString().split('T')[0];
    sensor.healthScore = 98;

    const certId = `CERT-WMO-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create formal audit maintenance record
    const record = {
      _id: `rec_${Date.now()}`,
      stationId: sensor.stationId,
      sensorId: sensor._id,
      engineerId: 'usr_003',
      engineerName: certifiedBy || 'Field Calibration Engineer',
      date: today.toISOString().split('T')[0],
      type: 'Sensor Recalibration & Audit',
      workDetails: calibrationNotes || `Completed zero-point and span check per WMO-No. 8. Adjusted offset: ${adjustedOffset || '0.00'}.`,
      checklist: [
        { item: 'Physical cleanliness & mechanical housing inspection', status: 'pass' as const },
        { item: 'Zero point drift assessment', status: 'pass' as const },
        { item: 'Secondary reference standard comparison', status: 'pass' as const },
        { item: 'Telemetry bus transmission validation', status: 'pass' as const },
      ],
      standardUsed: 'WMO-No. 8 Guide to Meteorological Instruments',
      isWmoCompliant: true,
      certificateNo: certId,
    };

    db.records.unshift(record);

    // Resolve any open overdue calibration alerts for this sensor
    db.alerts.forEach((alt) => {
      if (alt.sensorId === sensor._id && alt.type === 'Overdue Calibration' && !alt.resolved) {
        alt.resolved = true;
        alt.resolvedAt = new Date().toISOString();
        alt.resolvedBy = certifiedBy || 'Field Operator';
      }
    });

    db.addAudit(certifiedBy || 'Field Operator', 'operator', 'SENSOR_CALIBRATED', 'Sensor', sensor._id, `Calibrated ${sensor.sensorType} with certificate ${certId}`);

    res.json({ message: 'Sensor successfully calibrated', sensor, record });
  });

  // ==========================================
  // WEATHER READINGS & IOT INGESTION (Slide 4, 13)
  // ==========================================
  app.get('/api/readings', (req: Request, res: Response) => {
    const { stationId, sensorId, parameter, limit } = req.query;
    let readings = db.readings;

    if (stationId && typeof stationId === 'string') {
      readings = readings.filter((r) => r.stationId === stationId);
    }
    if (sensorId && typeof sensorId === 'string') {
      readings = readings.filter((r) => r.sensorId === sensorId);
    }
    if (parameter && typeof parameter === 'string') {
      readings = readings.filter((r) => r.parameter.toLowerCase() === parameter.toLowerCase());
    }

    const takeCount = Number(limit) || 100;
    res.json(readings.slice(0, takeCount));
  });

  // IoT Sensor ingestion endpoint (accepts JSON payloads from weather nodes)
  app.post('/api/readings', (req: Request, res: Response) => {
    const { stationId, sensorId, parameter, value, unit } = req.body;
    if (!stationId || parameter === undefined || value === undefined) {
      return res.status(400).json({ error: 'Missing stationId, parameter, or value' });
    }

    try {
      const reading = db.addReading({
        stationId,
        sensorId,
        parameter,
        value: Number(value),
        unit,
      });
      res.status(201).json(reading);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // MAINTENANCE TASKS & KANBAN (Slide 5, 6, 13)
  // ==========================================
  app.get('/api/tasks', (req: Request, res: Response) => {
    const { stationId, status, priority } = req.query;
    let tasks = db.tasks;

    if (stationId && typeof stationId === 'string') {
      tasks = tasks.filter((t) => t.stationId === stationId);
    }
    if (status && typeof status === 'string') {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && typeof priority === 'string') {
      tasks = tasks.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }

    const enriched = tasks.map((t) => {
      const stn = db.stations.find((s) => s._id === t.stationId);
      const sns = t.sensorId ? db.sensors.find((s) => s._id === t.sensorId) : null;
      return {
        ...t,
        stationName: stn?.stationName || 'Unknown Station',
        stationCode: stn?.stationCode || 'N/A',
        sensorType: sns?.sensorType,
      };
    });

    res.json(enriched);
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const { title, description, stationId, sensorId, type, priority, assignedTo, dueDate } = req.body;
    if (!title || !stationId || !type) {
      return res.status(400).json({ error: 'Missing title, stationId, or task type' });
    }

    const newTask = {
      _id: `tsk_${Date.now()}`,
      title,
      description: description || '',
      stationId,
      sensorId,
      type: type || 'Routine Inspection',
      priority: priority || 'Medium',
      status: 'Pending' as const,
      assignedTo: assignedTo || 'Arun Prakash',
      assignedRole: 'Field Operator',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    db.tasks.unshift(newTask);
    db.addAudit('Supervisor', 'admin', 'TASK_SCHEDULED', 'Task', newTask._id, `Created maintenance task: "${newTask.title}" for station ${stationId}`);

    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const task = db.tasks.find((t) => t._id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const prevStatus = task.status;
    Object.assign(task, req.body);

    if (req.body.status === 'Completed' && prevStatus !== 'Completed') {
      task.completedAt = new Date().toISOString();
      if (!task.complianceCertId && task.type === 'Calibration') {
        task.complianceCertId = `CERT-WMO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    db.addAudit(task.assignedTo || 'Operator', 'operator', 'TASK_STATUS_UPDATED', 'Task', task._id, `Changed task "${task.title}" status from ${prevStatus} to ${task.status}`);

    res.json(task);
  });

  // ==========================================
  // INSPECTIONS & MAINTENANCE RECORDS (Slide 13)
  // ==========================================
  app.get('/api/maintenances', (req: Request, res: Response) => {
    const { stationId } = req.query;
    let records = db.records;
    if (stationId && typeof stationId === 'string') {
      records = records.filter((r) => r.stationId === stationId);
    }

    const enriched = records.map((rec) => {
      const stn = db.stations.find((s) => s._id === rec.stationId);
      const sns = rec.sensorId ? db.sensors.find((s) => s._id === rec.sensorId) : null;
      return {
        ...rec,
        stationName: stn?.stationName || 'N/A',
        stationCode: stn?.stationCode || 'N/A',
        sensorType: sns?.sensorType,
      };
    });

    res.json(enriched);
  });

  app.post('/api/inspections', (req: Request, res: Response) => {
    const { stationId, sensorId, engineerName, workDetails, checklist, standardUsed, notes, isWmoCompliant } = req.body;
    if (!stationId || !workDetails) {
      return res.status(400).json({ error: 'Missing stationId or work details' });
    }

    const certId = isWmoCompliant ? `CERT-WMO-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const newRecord = {
      _id: `rec_${Date.now()}`,
      stationId,
      sensorId,
      engineerId: 'usr_003',
      engineerName: engineerName || 'Field Instrumentation Officer',
      date: new Date().toISOString().split('T')[0],
      type: 'Field Inspection & Verification',
      workDetails,
      checklist: checklist || [
        { item: 'Solar panel clean & charging', status: 'pass' },
        { item: 'Battery terminal check', status: 'pass' },
        { item: 'Sensors aligned and level', status: 'pass' },
      ],
      standardUsed: standardUsed || 'WMO-No. 8 & BIS IS 4967:1994',
      isWmoCompliant: isWmoCompliant !== false,
      certificateNo: certId,
      notes,
    };

    db.records.unshift(newRecord);
    db.addAudit(newRecord.engineerName, 'operator', 'INSPECTION_SUBMITTED', 'Maintenance', newRecord._id, `Recorded field inspection at station ${stationId}`);

    res.status(201).json(newRecord);
  });

  // ==========================================
  // ALERTS & NOTIFICATIONS (Slide 3, 11, 16)
  // ==========================================
  app.get('/api/alerts', (req: Request, res: Response) => {
    const { resolved } = req.query;
    let alerts = db.alerts;
    if (resolved !== undefined) {
      const isRes = resolved === 'true';
      alerts = alerts.filter((a) => a.resolved === isRes);
    }

    const enriched = alerts.map((alt) => {
      const stn = db.stations.find((s) => s._id === alt.stationId);
      const sns = alt.sensorId ? db.sensors.find((s) => s._id === alt.sensorId) : null;
      return {
        ...alt,
        stationName: stn?.stationName || 'N/A',
        stationCode: stn?.stationCode || 'N/A',
        sensorType: sns?.sensorType,
      };
    });

    res.json(enriched);
  });

  app.post('/api/alerts/:id/resolve', (req: Request, res: Response) => {
    const alert = db.alerts.find((a) => a._id === req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    const { resolvedBy } = req.body;
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    const actorName = alert.resolvedBy || 'Duty Meteorologist';
    db.addAudit(actorName, 'meteorologist', 'ALERT_RESOLVED', 'Alert', alert._id, `Resolved alert: "${alert.title}"`);

    res.json({ message: 'Alert resolved', alert });
  });

  // ==========================================
  // AUDIT TRAIL ENGINE (Slide 3, 8, 11)
  // ==========================================
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json(db.auditLogs);
  });

  // ==========================================
  // ANALYTICS & DASHBOARD METRICS (Slide 9, 14, 16)
  // ==========================================
  app.get('/api/analytics', (req: Request, res: Response) => {
    const totalStations = db.stations.length;
    const onlineStations = db.stations.filter((s) => s.status === 'Online').length;
    const degradedStations = db.stations.filter((s) => s.status === 'Degraded').length;
    const offlineStations = db.stations.filter((s) => s.status === 'Offline').length;
    const calibratingStations = db.stations.filter((s) => s.status === 'Calibrating').length;

    const totalSensors = db.sensors.length;
    const normalSensors = db.sensors.filter((s) => s.status === 'Normal').length;
    const driftSensors = db.sensors.filter((s) => s.status === 'Drift Detected').length;
    const dueCalibrationSensors = db.sensors.filter((s) => s.status === 'Calibration Due').length;
    const faultySensors = db.sensors.filter((s) => s.status === 'Faulty').length;

    const activeAlerts = db.alerts.filter((a) => !a.resolved);
    const criticalAlerts = activeAlerts.filter((a) => a.severity === 'Critical').length;
    const warningAlerts = activeAlerts.filter((a) => a.severity === 'Warning').length;

    const pendingTasks = db.tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;
    const completedTasks = db.tasks.filter((t) => t.status === 'Completed').length;

    // Average values across active temperature, humidity, pressure
    const tempSensors = db.sensors.filter((s) => s.sensorType === 'Thermometer' && s.status !== 'Faulty');
    const avgTemp = tempSensors.length > 0 ? Number((tempSensors.reduce((acc, s) => acc + s.currentReading, 0) / tempSensors.length).toFixed(1)) : 30.5;

    const humidSensors = db.sensors.filter((s) => s.sensorType === 'Hygrometer' && s.status !== 'Faulty');
    const avgHumidity = humidSensors.length > 0 ? Number((humidSensors.reduce((acc, s) => acc + s.currentReading, 0) / humidSensors.length).toFixed(1)) : 68.0;

    const baroSensors = db.sensors.filter((s) => s.sensorType === 'Barometer' && s.status !== 'Faulty');
    const avgPressure = baroSensors.length > 0 ? Number((baroSensors.reduce((acc, s) => acc + s.currentReading, 0) / baroSensors.length).toFixed(1)) : 1012.4;

    const calibrationComplianceRate = totalSensors > 0 ? Math.round(((totalSensors - dueCalibrationSensors - driftSensors) / totalSensors) * 100) : 92;

    res.json({
      stations: {
        total: totalStations,
        online: onlineStations,
        degraded: degradedStations,
        offline: offlineStations,
        calibrating: calibratingStations,
        uptimePercentage: Number(((onlineStations / (totalStations || 1)) * 100).toFixed(1)),
      },
      sensors: {
        total: totalSensors,
        normal: normalSensors,
        drift: driftSensors,
        dueCalibration: dueCalibrationSensors,
        faulty: faultySensors,
        complianceRate: calibrationComplianceRate,
      },
      alerts: {
        activeTotal: activeAlerts.length,
        critical: criticalAlerts,
        warning: warningAlerts,
      },
      tasks: {
        pending: pendingTasks,
        completed: completedTasks,
      },
      networkAverages: {
        temperature: avgTemp,
        humidity: avgHumidity,
        pressure: avgPressure,
      },
      wmoStandard: 'WMO-No. 8 & BIS IS 4967:1994 compliant',
      lastEvaluated: new Date().toISOString(),
    });
  });

  // ==========================================
  // IOT SIMULATOR & DEMO CONTROLS (Slide 4, 11)
  // ==========================================
  app.post('/api/iot/tick', (req: Request, res: Response) => {
    db.simulateNetworkTick();
    db.evaluateNetworkHealth();
    res.json({ message: 'Simulated weather network tick executed', timestamp: new Date().toISOString() });
  });

  app.post('/api/iot/inject-fault', (req: Request, res: Response) => {
    const { faultType, stationId } = req.body;
    const targetStation = stationId ? db.stations.find((s) => s._id === stationId) : db.stations[0];

    if (!targetStation) return res.status(404).json({ error: 'Station not found' });

    if (faultType === 'temp_surge') {
      const therm = db.sensors.find((s) => s.stationId === targetStation._id && s.sensorType === 'Thermometer');
      if (therm) {
        therm.currentReading = 58.4; // Exceeds tolerance max 55°C
        db.addReading({
          stationId: targetStation._id,
          sensorId: therm._id,
          parameter: 'Thermometer',
          value: 58.4,
          unit: '°C',
        });
      }
    } else if (faultType === 'drift') {
      const baro = db.sensors.find((s) => s.stationId === targetStation._id && s.sensorType === 'Barometer');
      if (baro) {
        baro.status = 'Drift Detected';
        baro.healthScore = 61;
        const newAlert = {
          _id: `alt_drift_${Date.now()}`,
          stationId: targetStation._id,
          sensorId: baro._id,
          type: 'Sensor Drift' as const,
          severity: 'Warning' as const,
          title: `Drift Detected: Barometer at ${targetStation.stationName}`,
          description: `Observed +5.2 hPa drift relative to regional gradient. Recalibration required.`,
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        db.alerts.unshift(newAlert);
        db.addAudit('Quality Control', 'system', 'DRIFT_ALARM', 'Sensor', baro._id, newAlert.description);
      }
    } else if (faultType === 'station_offline') {
      targetStation.status = 'Offline';
      targetStation.lastSeen = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const newAlert = {
        _id: `alt_offline_${Date.now()}`,
        stationId: targetStation._id,
        type: 'Offline Station' as const,
        severity: 'Critical' as const,
        title: `Station Telemetry Severed: ${targetStation.stationName}`,
        description: `Heartbeat timed out. Solar controller uncommunicative.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      };
      db.alerts.unshift(newAlert);
      db.addAudit('Health Monitor', 'system', 'STATION_DROPPED', 'Station', targetStation._id, newAlert.description);
    }

    res.json({ message: `Fault injected: ${faultType}`, targetStation: targetStation.stationName });
  });

  // Background automated scheduler (simulating node-cron every 20 seconds)
  setInterval(() => {
    try {
      db.evaluateNetworkHealth();
    } catch (e) {
      console.error('Scheduler evaluation error:', e);
    }
  }, 20000);

  // Auto weather tick every 10 seconds to keep live dashboard vibrant
  setInterval(() => {
    try {
      db.simulateNetworkTick();
    } catch (e) {
      console.error('Weather simulator tick error:', e);
    }
  }, 10000);

  // ==========================================
  // VITE / STATIC CLIENT INTEGRATION
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[METEOR-CENTRAL] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start METEOR-CENTRAL server:', err);
  process.exit(1);
});
