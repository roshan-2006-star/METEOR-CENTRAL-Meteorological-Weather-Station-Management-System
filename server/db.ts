/**
 * In-memory & file-backed MongoDB/Mongoose-like store for Meteorological Station System
 * Supports full CRUD, automated scheduling, alert evaluation, and audit logging.
 */

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'meteorologist' | 'operator';
  ward: string;
  avatar?: string;
}

export interface IWeatherStation {
  _id: string;
  stationCode: string;
  stationName: string;
  region: string;
  location: string;
  elevation: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'Online' | 'Degraded' | 'Offline' | 'Calibrating';
  lastSeen: string;
  batteryLevel: number;
  solarStatus: 'Normal' | 'Degraded' | 'Offline';
  installationDate: string;
  firmwareVersion: string;
  contactPerson: string;
}

export interface ISensor {
  _id: string;
  stationId: string;
  sensorType: 'Thermometer' | 'Barometer' | 'Hygrometer' | 'Anemometer' | 'Rain Gauge' | 'Solar Radiation';
  model: string;
  unit: string;
  status: 'Normal' | 'Drift Detected' | 'Faulty' | 'Calibration Due';
  lastCalibrationDate: string;
  nextCalibrationDueDate: string;
  toleranceMin: number;
  toleranceMax: number;
  currentReading: number;
  healthScore: number;
}

export interface IWeatherReading {
  _id: string;
  stationId: string;
  sensorId: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  status: 'Normal' | 'Warning' | 'Critical';
  qualityFlag: 'Good' | 'Suspect' | 'Erroneous';
}

export interface IMaintenanceTask {
  _id: string;
  title: string;
  description: string;
  stationId: string;
  sensorId?: string;
  type: 'Calibration' | 'Sensor Repair' | 'Routine Inspection' | 'Anemometer Cleaning' | 'Rain Gauge Desilting' | 'Offline Investigation';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
  assignedTo: string;
  assignedRole: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  resolutionNotes?: string;
  complianceCertId?: string;
}

export interface IMaintenanceRecord {
  _id: string;
  stationId: string;
  sensorId?: string;
  engineerId: string;
  engineerName: string;
  date: string;
  type: string;
  workDetails: string;
  checklist: { item: string; status: 'pass' | 'fail' | 'adjusted' }[];
  readingsBefore?: { parameter: string; value: number; unit: string };
  readingsAfter?: { parameter: string; value: number; unit: string };
  certificateNo?: string;
  standardUsed: string; // e.g. WMO-No. 8 / BIS IS 4967
  isWmoCompliant: boolean;
  notes?: string;
}

export interface IAlert {
  _id: string;
  stationId: string;
  sensorId?: string;
  type: 'Abnormal Reading' | 'Sensor Drift' | 'Offline Station' | 'Overdue Calibration' | 'Low Battery';
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface IAuditLog {
  _id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetType: 'Station' | 'Sensor' | 'Maintenance' | 'Task' | 'Alert' | 'System';
  targetId: string;
  details: string;
}

// Initial Mock Seed Data reflecting the presentation context (Easwari Engg / IMD Tamil Nadu regional network)
export const initialUsers: IUser[] = [
  {
    _id: 'usr_001',
    name: 'Rajesh V. Sharma',
    email: 'admin@meteor-central.gov.in',
    password: 'admin123',
    role: 'admin',
    ward: 'Regional Directorate & AWS Control Hub',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    _id: 'usr_002',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@meteor-central.gov.in',
    password: 'meteo123',
    role: 'meteorologist',
    ward: 'Climate Analysis & Forecast Division',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    _id: 'usr_003',
    name: 'Arun Prakash',
    email: 'arun.prakash@meteor-central.gov.in',
    password: 'field123',
    role: 'operator',
    ward: 'South Zone Field Instrumentation Unit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
];

export const initialStations: IWeatherStation[] = [
  {
    _id: 'stn_001',
    stationCode: 'AWS-CHE-001',
    stationName: 'Guindy Regional Observatory',
    region: 'Chennai Central',
    location: 'Guindy Institutional Zone, Chennai',
    elevation: 16,
    coordinates: { lat: 13.0067, lng: 80.2038 },
    status: 'Online',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    batteryLevel: 94,
    solarStatus: 'Normal',
    installationDate: '2021-03-15',
    firmwareVersion: 'v4.2.1-IoT-SEC',
    contactPerson: 'Rajesh V. Sharma (Lead Engineer)',
  },
  {
    _id: 'stn_002',
    stationCode: 'AWS-CHE-002',
    stationName: 'Meenambakkam Airport AWS',
    region: 'Chennai South',
    location: 'Airport Met Enclosure, Meenambakkam',
    elevation: 21,
    coordinates: { lat: 12.9941, lng: 80.1709 },
    status: 'Online',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    batteryLevel: 88,
    solarStatus: 'Normal',
    installationDate: '2020-08-10',
    firmwareVersion: 'v4.2.1-IoT-SEC',
    contactPerson: 'Arun Prakash (Field Tech Lead)',
  },
  {
    _id: 'stn_003',
    stationCode: 'AWS-CHE-003',
    stationName: 'Marina Coastal Meteorological Tower',
    region: 'Chennai East Coastal',
    location: 'Marina Beach Promenade, Triplicane',
    elevation: 6,
    coordinates: { lat: 13.0500, lng: 80.2824 },
    status: 'Degraded',
    lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    batteryLevel: 72,
    solarStatus: 'Normal',
    installationDate: '2022-01-20',
    firmwareVersion: 'v4.1.8',
    contactPerson: 'S. Basha (Coastal Officer)',
  },
  {
    _id: 'stn_004',
    stationCode: 'AWS-CHE-004',
    stationName: 'Ramapuram Tech Campus AWS',
    region: 'Chennai West',
    location: 'Easwari Campus Met Yard, Ramapuram',
    elevation: 18,
    coordinates: { lat: 13.0317, lng: 80.1788 },
    status: 'Online',
    lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    batteryLevel: 98,
    solarStatus: 'Normal',
    installationDate: '2023-05-12',
    firmwareVersion: 'v4.2.1-IoT-SEC',
    contactPerson: 'Dr. Ananya Iyer (Scientific Lead)',
  },
  {
    _id: 'stn_005',
    stationCode: 'AWS-CHE-005',
    stationName: 'Tambaram Foothill Meteorological Post',
    region: 'Kanchipuram Border',
    location: 'Tambaram Forest Enclosure, Tambaram',
    elevation: 32,
    coordinates: { lat: 12.9249, lng: 80.1000 },
    status: 'Offline',
    lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago -> triggers alert
    batteryLevel: 19,
    solarStatus: 'Offline',
    installationDate: '2019-11-04',
    firmwareVersion: 'v3.9.4',
    contactPerson: 'Arun Prakash (Field Tech Lead)',
  },
  {
    _id: 'stn_006',
    stationCode: 'AWS-CHE-006',
    stationName: 'Sriperumbudur Industrial Weather Hub',
    region: 'Kanchipuram Industrial',
    location: 'SIPCOT Industrial Zone, Sriperumbudur',
    elevation: 37,
    coordinates: { lat: 12.9719, lng: 79.9427 },
    status: 'Calibrating',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    batteryLevel: 85,
    solarStatus: 'Normal',
    installationDate: '2022-09-18',
    firmwareVersion: 'v4.2.0',
    contactPerson: 'P. Rao (Instrument Tech)',
  },
  {
    _id: 'stn_007',
    stationCode: 'AWS-CHE-007',
    stationName: 'Mahabalipuram Marine Agro-Met Post',
    region: 'Chengalpattu Coastal',
    location: 'Shore Sanctuary Buffer, Mahabalipuram',
    elevation: 8,
    coordinates: { lat: 12.6269, lng: 80.1928 },
    status: 'Online',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    batteryLevel: 91,
    solarStatus: 'Normal',
    installationDate: '2021-07-22',
    firmwareVersion: 'v4.2.1-IoT-SEC',
    contactPerson: 'S. Kumar (Marine Specialist)',
  },
];

export const initialSensors: ISensor[] = [
  // Guindy
  {
    _id: 'sns_001',
    stationId: 'stn_001',
    sensorType: 'Thermometer',
    model: 'Rotronic PT100 Precision RTD',
    unit: '°C',
    status: 'Normal',
    lastCalibrationDate: '2026-03-10',
    nextCalibrationDueDate: '2026-09-10',
    toleranceMin: -10,
    toleranceMax: 55,
    currentReading: 32.4,
    healthScore: 98,
  },
  {
    _id: 'sns_002',
    stationId: 'stn_001',
    sensorType: 'Hygrometer',
    model: 'Vaisala HMP155 Capacitive Polymer',
    unit: '%',
    status: 'Normal',
    lastCalibrationDate: '2026-04-12',
    nextCalibrationDueDate: '2026-10-12',
    toleranceMin: 5,
    toleranceMax: 100,
    currentReading: 68.2,
    healthScore: 96,
  },
  {
    _id: 'sns_003',
    stationId: 'stn_001',
    sensorType: 'Barometer',
    model: 'Setra 278 Piezoresistive',
    unit: 'hPa',
    status: 'Normal',
    lastCalibrationDate: '2026-02-18',
    nextCalibrationDueDate: '2026-08-18',
    toleranceMin: 850,
    toleranceMax: 1100,
    currentReading: 1012.3,
    healthScore: 99,
  },
  {
    _id: 'sns_004',
    stationId: 'stn_001',
    sensorType: 'Anemometer',
    model: 'Gill WindObserver II Ultrasonic',
    unit: 'km/h',
    status: 'Normal',
    lastCalibrationDate: '2026-01-20',
    nextCalibrationDueDate: '2026-07-20',
    toleranceMin: 0,
    toleranceMax: 160,
    currentReading: 14.8,
    healthScore: 94,
  },
  {
    _id: 'sns_005',
    stationId: 'stn_001',
    sensorType: 'Rain Gauge',
    model: 'Texas Electronics TR-525M Tipping Bucket',
    unit: 'mm/h',
    status: 'Normal',
    lastCalibrationDate: '2026-05-01',
    nextCalibrationDueDate: '2026-11-01',
    toleranceMin: 0,
    toleranceMax: 200,
    currentReading: 0.0,
    healthScore: 97,
  },

  // Meenambakkam
  {
    _id: 'sns_006',
    stationId: 'stn_002',
    sensorType: 'Thermometer',
    model: 'Rotronic PT100 Aviation Spec',
    unit: '°C',
    status: 'Normal',
    lastCalibrationDate: '2026-04-05',
    nextCalibrationDueDate: '2026-10-05',
    toleranceMin: -10,
    toleranceMax: 55,
    currentReading: 33.1,
    healthScore: 95,
  },
  {
    _id: 'sns_007',
    stationId: 'stn_002',
    sensorType: 'Barometer',
    model: 'Vaisala PTB330 Digital Barometer Class A',
    unit: 'hPa',
    status: 'Normal',
    lastCalibrationDate: '2026-03-15',
    nextCalibrationDueDate: '2026-09-15',
    toleranceMin: 850,
    toleranceMax: 1100,
    currentReading: 1011.8,
    healthScore: 99,
  },
  {
    _id: 'sns_008',
    stationId: 'stn_002',
    sensorType: 'Anemometer',
    model: 'Met One 010C Cup Anemometer',
    unit: 'km/h',
    status: 'Normal',
    lastCalibrationDate: '2026-02-10',
    nextCalibrationDueDate: '2026-08-10',
    toleranceMin: 0,
    toleranceMax: 160,
    currentReading: 19.5,
    healthScore: 92,
  },

  // Marina Coastal - Has Drift & Degraded Anemometer
  {
    _id: 'sns_009',
    stationId: 'stn_003',
    sensorType: 'Anemometer',
    model: 'Gill WindSonic 2D Ultrasonic',
    unit: 'km/h',
    status: 'Drift Detected', // PPT Slide 4: "anemometers wear out, barometers drift out of calibration"
    lastCalibrationDate: '2025-08-15',
    nextCalibrationDueDate: '2026-02-15', // Overdue!
    toleranceMin: 0,
    toleranceMax: 160,
    currentReading: 38.6,
    healthScore: 58,
  },
  {
    _id: 'sns_010',
    stationId: 'stn_003',
    sensorType: 'Hygrometer',
    model: 'Vaisala HMP155 Marine Coated',
    unit: '%',
    status: 'Normal',
    lastCalibrationDate: '2026-05-10',
    nextCalibrationDueDate: '2026-11-10',
    toleranceMin: 5,
    toleranceMax: 100,
    currentReading: 82.4,
    healthScore: 90,
  },
  {
    _id: 'sns_011',
    stationId: 'stn_003',
    sensorType: 'Rain Gauge',
    model: 'Hydro-Tech 0.2mm Siphoning Gauge',
    unit: 'mm/h',
    status: 'Normal',
    lastCalibrationDate: '2026-04-18',
    nextCalibrationDueDate: '2026-10-18',
    toleranceMin: 0,
    toleranceMax: 200,
    currentReading: 1.2,
    healthScore: 91,
  },

  // Ramapuram Tech Campus
  {
    _id: 'sns_012',
    stationId: 'stn_004',
    sensorType: 'Thermometer',
    model: 'Campbell Scientific 107-L Temp Probe',
    unit: '°C',
    status: 'Normal',
    lastCalibrationDate: '2026-06-01',
    nextCalibrationDueDate: '2026-12-01',
    toleranceMin: -10,
    toleranceMax: 55,
    currentReading: 31.8,
    healthScore: 98,
  },
  {
    _id: 'sns_013',
    stationId: 'stn_004',
    sensorType: 'Rain Gauge',
    model: 'Texas Electronics TR-525M',
    unit: 'mm/h',
    status: 'Calibration Due',
    lastCalibrationDate: '2025-09-25',
    nextCalibrationDueDate: '2026-03-25', // Overdue
    toleranceMin: 0,
    toleranceMax: 200,
    currentReading: 0.0,
    healthScore: 74,
  },

  // Tambaram - Offline station
  {
    _id: 'sns_014',
    stationId: 'stn_005',
    sensorType: 'Barometer',
    model: 'Setra 278 Piezoresistive',
    unit: 'hPa',
    status: 'Faulty',
    lastCalibrationDate: '2025-04-10',
    nextCalibrationDueDate: '2025-10-10',
    toleranceMin: 850,
    toleranceMax: 1100,
    currentReading: 0,
    healthScore: 15,
  },

  // Sriperumbudur
  {
    _id: 'sns_015',
    stationId: 'stn_006',
    sensorType: 'Thermometer',
    model: 'Rotronic PT100 RTD',
    unit: '°C',
    status: 'Calibration Due',
    lastCalibrationDate: '2025-09-01',
    nextCalibrationDueDate: '2026-03-01',
    toleranceMin: -10,
    toleranceMax: 55,
    currentReading: 34.2,
    healthScore: 80,
  },
  {
    _id: 'sns_016',
    stationId: 'stn_006',
    sensorType: 'Solar Radiation',
    model: 'Kipp & Zonen CMP11 Pyranometer',
    unit: 'W/m²',
    status: 'Normal',
    lastCalibrationDate: '2026-01-14',
    nextCalibrationDueDate: '2027-01-14',
    toleranceMin: 0,
    toleranceMax: 1500,
    currentReading: 780,
    healthScore: 95,
  },

  // Mahabalipuram
  {
    _id: 'sns_017',
    stationId: 'stn_007',
    sensorType: 'Anemometer',
    model: 'Gill WindObserver 65 Ultrasonic Marine',
    unit: 'km/h',
    status: 'Normal',
    lastCalibrationDate: '2026-03-12',
    nextCalibrationDueDate: '2026-09-12',
    toleranceMin: 0,
    toleranceMax: 180,
    currentReading: 22.4,
    healthScore: 94,
  },
  {
    _id: 'sns_018',
    stationId: 'stn_007',
    sensorType: 'Barometer',
    model: 'Vaisala PTB330 Digital Barometer',
    unit: 'hPa',
    status: 'Normal',
    lastCalibrationDate: '2026-02-28',
    nextCalibrationDueDate: '2026-08-28',
    toleranceMin: 850,
    toleranceMax: 1100,
    currentReading: 1013.1,
    healthScore: 97,
  },
];

// Helper to generate realistic historical 24-hour readings
export function generateInitialReadings(): IWeatherReading[] {
  const readings: IWeatherReading[] = [];
  const now = Date.now();

  initialSensors.forEach((s) => {
    // Generate past 24 hourly readings
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000).toISOString();
      let val = s.currentReading;
      const hour = new Date(time).getHours();

      if (s.sensorType === 'Thermometer') {
        // Diurnal curve
        val = 26 + 7 * Math.sin(((hour - 7) / 24) * 2 * Math.PI) + (Math.random() * 0.8 - 0.4);
        val = Number(val.toFixed(1));
      } else if (s.sensorType === 'Hygrometer') {
        // Inverse diurnal
        val = 85 - 25 * Math.sin(((hour - 7) / 24) * 2 * Math.PI) + (Math.random() * 2 - 1);
        val = Math.min(100, Math.max(20, Number(val.toFixed(1))));
      } else if (s.sensorType === 'Barometer') {
        val = 1012 + 2 * Math.cos(((hour - 10) / 12) * 2 * Math.PI) + (Math.random() * 0.4 - 0.2);
        val = Number(val.toFixed(1));
      } else if (s.sensorType === 'Anemometer') {
        val = 12 + 6 * Math.sin(((hour - 12) / 24) * 2 * Math.PI) + (Math.random() * 4 - 2);
        val = Math.max(1, Number(val.toFixed(1)));
        if (s._id === 'sns_009' && i < 6) {
          // Marina drift anomaly
          val = 42.5 + Math.random() * 5;
        }
      } else if (s.sensorType === 'Rain Gauge') {
        val = (hour > 14 && hour < 17 && (s.stationId === 'stn_003' || s.stationId === 'stn_007')) ? Number((Math.random() * 4.5).toFixed(1)) : 0.0;
      } else if (s.sensorType === 'Solar Radiation') {
        val = (hour >= 6 && hour <= 18) ? Math.sin(((hour - 6) / 12) * Math.PI) * 900 + Math.random() * 50 : 0;
        val = Math.max(0, Math.round(val));
      }

      const isWarning = val < s.toleranceMin || val > s.toleranceMax;

      readings.push({
        _id: `rdg_${s._id}_${i}`,
        stationId: s.stationId,
        sensorId: s._id,
        parameter: s.sensorType,
        value: val,
        unit: s.unit,
        timestamp: time,
        status: isWarning ? 'Warning' : 'Normal',
        qualityFlag: isWarning ? 'Suspect' : 'Good',
      });
    }
  });

  return readings;
}

export const initialMaintenanceTasks: IMaintenanceTask[] = [
  {
    _id: 'tsk_001',
    title: 'Bi-Annual Ultrasonic Anemometer Recalibration',
    description: 'Marina Coastal Station (AWS-CHE-003) wind speed sensor showing +18% drift vs Meenambakkam radar. Perform zero-wind chamber audit per WMO-No. 8 standards.',
    stationId: 'stn_003',
    sensorId: 'sns_009',
    type: 'Calibration',
    priority: 'Critical',
    status: 'In Progress',
    assignedTo: 'Arun Prakash',
    assignedRole: 'Field Operator',
    dueDate: '2026-10-03',
    createdAt: '2026-09-28T09:30:00.000Z',
  },
  {
    _id: 'tsk_002',
    title: 'Rain Gauge Orifice & Siphon Desilting',
    description: 'Ramapuram Tech Campus (AWS-CHE-004) tipping bucket requires quarterly clean-out and volume droplet verification prior to Northeast Monsoon onset.',
    stationId: 'stn_004',
    sensorId: 'sns_013',
    type: 'Rain Gauge Desilting',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Arun Prakash',
    assignedRole: 'Field Operator',
    dueDate: '2026-10-05',
    createdAt: '2026-09-29T11:00:00.000Z',
  },
  {
    _id: 'tsk_003',
    title: 'Tambaram Foothill AWS Offline Diagnostic & Solar Battery Inspection',
    description: 'Station telemetry lost >45 mins. Battery reported 19% charge with solar controller faults. Physical field dispatch required.',
    stationId: 'stn_005',
    type: 'Offline Investigation',
    priority: 'Critical',
    status: 'Pending',
    assignedTo: 'Arun Prakash',
    assignedRole: 'Senior Field Tech',
    dueDate: '2026-10-01',
    createdAt: '2026-09-30T14:15:00.000Z',
  },
  {
    _id: 'tsk_004',
    title: 'Digital Barometer Secondary Transfer Standard Check',
    description: 'Sriperumbudur Hub (AWS-CHE-006) barometer verification using portable Druck DPI-142 reference standard.',
    stationId: 'stn_006',
    sensorId: 'sns_015',
    type: 'Calibration',
    priority: 'Medium',
    status: 'Under Review',
    assignedTo: 'Arun Prakash',
    assignedRole: 'Senior Field Tech',
    dueDate: '2026-10-10',
    createdAt: '2026-09-25T08:00:00.000Z',
    completedAt: '2026-09-30T10:00:00.000Z',
    complianceCertId: 'CERT-WMO-2026-0941',
  },
  {
    _id: 'tsk_005',
    title: 'Guindy Regional Observatory Routine Pre-Monsoon Audit',
    description: 'Annual tower grounding resistance check, mast verticality check, radiation shield cleaning.',
    stationId: 'stn_001',
    type: 'Routine Inspection',
    priority: 'Low',
    status: 'Completed',
    assignedTo: 'Rajesh V. Sharma',
    assignedRole: 'Lead Engineer',
    dueDate: '2026-09-25',
    createdAt: '2026-09-20T10:00:00.000Z',
    completedAt: '2026-09-24T16:00:00.000Z',
    resolutionNotes: 'All 5 sensor channels verified within +/- 0.2% tolerance. Grounding resistance measured 1.8 Ohms (compliant with BIS IS 4967).',
    complianceCertId: 'CERT-WMO-2026-0812',
  },
];

export const initialMaintenanceRecords: IMaintenanceRecord[] = [
  {
    _id: 'rec_001',
    stationId: 'stn_001',
    engineerId: 'usr_001',
    engineerName: 'Rajesh V. Sharma',
    date: '2026-09-24',
    type: 'Routine Inspection & Calibration',
    workDetails: 'Comprehensive multi-sensor audit conducted at Guindy Observatory. Cleaned Gill ultrasonic transducers and verified Rotronic PT100 RTD using ice-point 0.00°C calibration cell.',
    checklist: [
      { item: 'Radiation shield aspirated flow rate', status: 'pass' },
      { item: 'Mast vertical level & guying tension', status: 'pass' },
      { item: 'Earthing resistance (< 2 Ohms)', status: 'pass' },
      { item: 'Tipping bucket tipping accuracy (20 tips = 100ml)', status: 'pass' },
      { item: 'Telemetry modem signal RSSI > -75dBm', status: 'pass' },
    ],
    readingsBefore: { parameter: 'Temperature', value: 31.9, unit: '°C' },
    readingsAfter: { parameter: 'Temperature', value: 31.7, unit: '°C' },
    certificateNo: 'CERT-WMO-2026-0812',
    standardUsed: 'WMO-No. 8 & BIS IS 4967:1994',
    isWmoCompliant: true,
    notes: 'Audit passed with 100% compliance. Next mandatory calibration due in March 2027.',
  },
  {
    _id: 'rec_002',
    stationId: 'stn_006',
    sensorId: 'sns_015',
    engineerId: 'usr_003',
    engineerName: 'Arun Prakash',
    date: '2026-09-30',
    type: 'Sensor Calibration',
    workDetails: 'Calibrated industrial PT100 RTD at Sriperumbudur Hub. Replaced corroded weatherproof cable gland and performed 3-point temperature offset tuning.',
    checklist: [
      { item: 'Zero point offset verification', status: 'adjusted' },
      { item: 'Span slope verification (30°C to 45°C)', status: 'pass' },
      { item: 'Moisture ingress seal replacement', status: 'pass' },
      { item: 'Data logger channel linearity test', status: 'pass' },
    ],
    readingsBefore: { parameter: 'Temperature', value: 34.8, unit: '°C' },
    readingsAfter: { parameter: 'Temperature', value: 34.2, unit: '°C' },
    certificateNo: 'CERT-WMO-2026-0941',
    standardUsed: 'WMO-No. 8 Part I Chapter 2',
    isWmoCompliant: true,
    notes: 'Offset drift was +0.6°C due to resistance in lead wire; recalibrated and sealed.',
  },
];

export const initialAlerts: IAlert[] = [
  {
    _id: 'alt_001',
    stationId: 'stn_005',
    type: 'Offline Station',
    severity: 'Critical',
    title: 'Station Unresponsive: AWS-CHE-005 (Tambaram)',
    description: 'No telemetry heartbeat received for 45 minutes. Previous battery telemetry logged at 19% (solar charger fault).',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    _id: 'alt_002',
    stationId: 'stn_003',
    sensorId: 'sns_009',
    type: 'Sensor Drift',
    severity: 'Warning',
    title: 'Calibration Drift: Marina Coastal Anemometer',
    description: 'Wind sensor reading deviates +18% above regional mesh baseline. Calibration interval expired on 2026-02-15.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    _id: 'alt_003',
    stationId: 'stn_004',
    sensorId: 'sns_013',
    type: 'Overdue Calibration',
    severity: 'Warning',
    title: 'Overdue Calibration: Ramapuram Tipping Bucket',
    description: 'Scheduled semi-annual rain gauge verification is 6 days overdue. Potential debris in tipping funnel.',
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    _id: 'alt_004',
    stationId: 'stn_001',
    type: 'Abnormal Reading',
    severity: 'Info',
    title: 'Gust Event Detected: Guindy Regional Observatory',
    description: 'Peak 3-second gust reached 38.2 km/h during sea-breeze transition. Sensor response normal.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'Dr. Ananya Iyer',
  },
];

export const initialAuditLogs: IAuditLog[] = [
  {
    _id: 'aud_001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actor: 'Dr. Ananya Iyer',
    role: 'meteorologist',
    action: 'ALERT_RESOLVED',
    targetType: 'Alert',
    targetId: 'alt_004',
    details: 'Acknowledged normal gust behavior on Guindy AWS anemometer channel.',
  },
  {
    _id: 'aud_002',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    actor: 'Arun Prakash',
    role: 'operator',
    action: 'CALIBRATION_COMPLETED',
    targetType: 'Maintenance',
    targetId: 'rec_002',
    details: 'Submitted calibration record CERT-WMO-2026-0941 for Sriperumbudur Hub PT100 sensor.',
  },
  {
    _id: 'aud_003',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actor: 'Rajesh V. Sharma',
    role: 'admin',
    action: 'TASK_CREATED',
    targetType: 'Task',
    targetId: 'tsk_001',
    details: 'Dispatched emergency anemometer calibration task for Marina Coastal AWS.',
  },
  {
    _id: 'aud_004',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    actor: 'Rajesh V. Sharma',
    role: 'admin',
    action: 'STATION_COMMISSIONED',
    targetType: 'Station',
    targetId: 'stn_004',
    details: 'Commissioned Ramapuram Tech Campus AWS (AWS-CHE-004) with GPS 13.0317 N, 80.1788 E.',
  },
];

// Persistent Database State Class
class MeteorologicalDatabase {
  users: IUser[] = [...initialUsers];
  stations: IWeatherStation[] = [...initialStations];
  sensors: ISensor[] = [...initialSensors];
  readings: IWeatherReading[] = generateInitialReadings();
  tasks: IMaintenanceTask[] = [...initialMaintenanceTasks];
  records: IMaintenanceRecord[] = [...initialMaintenanceRecords];
  alerts: IAlert[] = [...initialAlerts];
  auditLogs: IAuditLog[] = [...initialAuditLogs];

  addAudit(actor: string, role: string, action: string, targetType: IAuditLog['targetType'], targetId: string, details: string) {
    const log: IAuditLog = {
      _id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      targetType,
      targetId,
      details,
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    return log;
  }

  // IoT sensor reading ingestion
  addReading(data: {
    stationId: string;
    sensorId?: string;
    parameter: string;
    value: number;
    unit?: string;
  }) {
    const station = this.stations.find((s) => s._id === data.stationId);
    if (!station) throw new Error('Station not found');

    station.lastSeen = new Date().toISOString();
    if (station.status === 'Offline') {
      station.status = 'Online';
      this.addAudit('IoT Gateway', 'system', 'STATION_RECONNECTED', 'Station', station._id, `Station ${station.stationName} resumed telemetry transmission.`);
    }

    // find or associate sensor
    let sensor = data.sensorId ? this.sensors.find((s) => s._id === data.sensorId) : null;
    if (!sensor) {
      sensor = this.sensors.find((s) => s.stationId === data.stationId && s.sensorType.toLowerCase() === data.parameter.toLowerCase());
    }

    const unit = data.unit || sensor?.unit || '';
    let status: IWeatherReading['status'] = 'Normal';
    let qualityFlag: IWeatherReading['qualityFlag'] = 'Good';

    if (sensor) {
      sensor.currentReading = data.value;
      if (data.value < sensor.toleranceMin || data.value > sensor.toleranceMax) {
        status = 'Warning';
        qualityFlag = 'Suspect';
        // Auto alert
        const existingAlert = this.alerts.find((a) => !a.resolved && a.stationId === station._id && a.sensorId === sensor?._id && a.type === 'Abnormal Reading');
        if (!existingAlert) {
          const newAlert: IAlert = {
            _id: `alt_${Date.now()}`,
            stationId: station._id,
            sensorId: sensor._id,
            type: 'Abnormal Reading',
            severity: 'Warning',
            title: `Abnormal ${sensor.sensorType} Reading: ${station.stationName}`,
            description: `Received ${data.value} ${unit}, which exceeds configured operational bounds (${sensor.toleranceMin} to ${sensor.toleranceMax} ${unit}).`,
            timestamp: new Date().toISOString(),
            resolved: false,
          };
          this.alerts.unshift(newAlert);
          this.addAudit('Alert Engine', 'system', 'ANOMALY_FLAGGED', 'Alert', newAlert._id, newAlert.description);
        }
      }
    }

    const newReading: IWeatherReading = {
      _id: `rdg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      stationId: station._id,
      sensorId: sensor?._id || 'sns_generic',
      parameter: data.parameter,
      value: data.value,
      unit,
      timestamp: new Date().toISOString(),
      status,
      qualityFlag,
    };

    this.readings.unshift(newReading);
    if (this.readings.length > 2500) this.readings.pop();

    return newReading;
  }

  // Background automated evaluation (node-cron style)
  evaluateNetworkHealth() {
    const now = Date.now();
    // 1. Check for offline stations (> 30 mins no contact)
    this.stations.forEach((stn) => {
      const lastSeenMs = new Date(stn.lastSeen).getTime();
      const minutesSinceContact = (now - lastSeenMs) / (1000 * 60);

      if (minutesSinceContact > 25 && stn.status !== 'Offline' && stn.status !== 'Calibrating') {
        stn.status = 'Offline';
        const existingAlert = this.alerts.find((a) => !a.resolved && a.stationId === stn._id && a.type === 'Offline Station');
        if (!existingAlert) {
          const newAlert: IAlert = {
            _id: `alt_off_${stn._id}_${Date.now()}`,
            stationId: stn._id,
            type: 'Offline Station',
            severity: 'Critical',
            title: `Station Telemetry Lost: ${stn.stationName}`,
            description: `No data packet received for ${Math.round(minutesSinceContact)} minutes from ${stn.stationCode}.`,
            timestamp: new Date().toISOString(),
            resolved: false,
          };
          this.alerts.unshift(newAlert);
          this.addAudit('Health Monitor', 'system', 'STATION_OFFLINE_DETECTED', 'Station', stn._id, newAlert.description);
        }
      }
    });

    // 2. Check for overdue calibrations
    const todayStr = new Date().toISOString().split('T')[0];
    this.sensors.forEach((sns) => {
      if (sns.nextCalibrationDueDate < todayStr && sns.status !== 'Calibration Due' && sns.status !== 'Faulty') {
        sns.status = 'Calibration Due';
        const stn = this.stations.find((s) => s._id === sns.stationId);
        const newAlert: IAlert = {
          _id: `alt_cal_${sns._id}_${Date.now()}`,
          stationId: sns.stationId,
          sensorId: sns._id,
          type: 'Overdue Calibration',
          severity: 'Warning',
          title: `Calibration Overdue: ${sns.sensorType} (${stn?.stationName || 'Station'})`,
          description: `Instrument calibration exceeded mandatory schedule (${sns.nextCalibrationDueDate}). Schedule recalibration per WMO guidelines.`,
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        this.alerts.unshift(newAlert);
        this.addAudit('Calibration Scheduler', 'system', 'CALIBRATION_ESCALATION', 'Sensor', sns._id, newAlert.description);
      }
    });
  }

  // Real-time tick to simulate ongoing weather dynamics across all stations
  simulateNetworkTick() {
    this.stations.forEach((stn) => {
      if (stn.status === 'Offline') return;

      const stnSensors = this.sensors.filter((s) => s.stationId === stn._id);
      stnSensors.forEach((s) => {
        let delta = 0;
        if (s.sensorType === 'Thermometer') {
          delta = (Math.random() - 0.5) * 0.4;
          s.currentReading = Number(Math.max(18, Math.min(45, s.currentReading + delta)).toFixed(1));
        } else if (s.sensorType === 'Hygrometer') {
          delta = (Math.random() - 0.5) * 1.2;
          s.currentReading = Number(Math.max(30, Math.min(99, s.currentReading + delta)).toFixed(1));
        } else if (s.sensorType === 'Barometer') {
          delta = (Math.random() - 0.5) * 0.2;
          s.currentReading = Number(Math.max(980, Math.min(1040, s.currentReading + delta)).toFixed(1));
        } else if (s.sensorType === 'Anemometer') {
          delta = (Math.random() - 0.5) * 2.5;
          s.currentReading = Number(Math.max(2, Math.min(65, s.currentReading + delta)).toFixed(1));
        } else if (s.sensorType === 'Rain Gauge') {
          // sporadic light rain for coastal stations
          if (stn.region.includes('Coastal') && Math.random() > 0.85) {
            s.currentReading = Number((Math.random() * 3.5).toFixed(1));
          } else {
            s.currentReading = 0.0;
          }
        } else if (s.sensorType === 'Solar Radiation') {
          delta = (Math.random() - 0.5) * 15;
          s.currentReading = Math.max(0, Math.min(1100, Math.round(s.currentReading + delta)));
        }

        // Push new reading record
        const reading: IWeatherReading = {
          _id: `rdg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          stationId: stn._id,
          sensorId: s._id,
          parameter: s.sensorType,
          value: s.currentReading,
          unit: s.unit,
          timestamp: new Date().toISOString(),
          status: (s.currentReading < s.toleranceMin || s.currentReading > s.toleranceMax) ? 'Warning' : 'Normal',
          qualityFlag: s.status === 'Drift Detected' ? 'Suspect' : 'Good',
        };
        this.readings.unshift(reading);
      });

      stn.lastSeen = new Date().toISOString();
    });

    if (this.readings.length > 2500) {
      this.readings = this.readings.slice(0, 2000);
    }
  }
}

export const db = new MeteorologicalDatabase();
