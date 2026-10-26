export type UserRole = 'admin' | 'meteorologist' | 'operator';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  ward: string;
  avatar?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type StationStatus = 'Online' | 'Degraded' | 'Offline' | 'Calibrating';

export interface WeatherStation {
  _id: string;
  stationCode: string;
  stationName: string;
  region: string;
  location: string;
  elevation: number;
  coordinates: Coordinates;
  status: StationStatus;
  lastSeen: string;
  batteryLevel: number;
  solarStatus: 'Normal' | 'Degraded' | 'Offline';
  installationDate: string;
  firmwareVersion: string;
  contactPerson: string;
  sensorCount?: number;
  alertCount?: number;
  sensors?: Sensor[];
  latestReadings?: WeatherReading[];
}

export type SensorType = 'Thermometer' | 'Barometer' | 'Hygrometer' | 'Anemometer' | 'Rain Gauge' | 'Solar Radiation';
export type SensorStatus = 'Normal' | 'Drift Detected' | 'Faulty' | 'Calibration Due';

export interface Sensor {
  _id: string;
  stationId: string;
  stationName?: string;
  stationCode?: string;
  sensorType: SensorType;
  model: string;
  unit: string;
  status: SensorStatus;
  lastCalibrationDate: string;
  nextCalibrationDueDate: string;
  toleranceMin: number;
  toleranceMax: number;
  currentReading: number;
  healthScore: number;
}

export interface WeatherReading {
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

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Pending' | 'In Progress' | 'Under Review' | 'Completed';

export interface MaintenanceTask {
  _id: string;
  title: string;
  description: string;
  stationId: string;
  stationName?: string;
  stationCode?: string;
  sensorId?: string;
  sensorType?: string;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  assignedRole: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  resolutionNotes?: string;
  complianceCertId?: string;
}

export interface MaintenanceRecord {
  _id: string;
  stationId: string;
  stationName?: string;
  stationCode?: string;
  sensorId?: string;
  sensorType?: string;
  engineerId: string;
  engineerName: string;
  date: string;
  type: string;
  workDetails: string;
  checklist: { item: string; status: 'pass' | 'fail' | 'adjusted' }[];
  readingsBefore?: { parameter: string; value: number; unit: string };
  readingsAfter?: { parameter: string; value: number; unit: string };
  certificateNo?: string;
  standardUsed: string;
  isWmoCompliant: boolean;
  notes?: string;
}

export interface Alert {
  _id: string;
  stationId: string;
  stationName?: string;
  stationCode?: string;
  sensorId?: string;
  sensorType?: string;
  type: 'Abnormal Reading' | 'Sensor Drift' | 'Offline Station' | 'Overdue Calibration' | 'Low Battery';
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

export interface AnalyticsData {
  stations: {
    total: number;
    online: number;
    degraded: number;
    offline: number;
    calibrating: number;
    uptimePercentage: number;
  };
  sensors: {
    total: number;
    normal: number;
    drift: number;
    dueCalibration: number;
    faulty: number;
    complianceRate: number;
  };
  alerts: {
    activeTotal: number;
    critical: number;
    warning: number;
  };
  tasks: {
    pending: number;
    completed: number;
  };
  networkAverages: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  wmoStandard: string;
  lastEvaluated: string;
}
