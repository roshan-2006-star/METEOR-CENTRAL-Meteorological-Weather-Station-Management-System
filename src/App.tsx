import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { StationMapView } from './components/StationMapView';
import { StationRegistryView } from './components/StationRegistryView';
import { WeatherTrendsView } from './components/WeatherTrendsView';
import { MaintenanceBoardView } from './components/MaintenanceBoardView';
import { AuditTrailView } from './components/AuditTrailView';
import { ArchitectureView } from './components/ArchitectureView';
import { IotSimulatorModal } from './components/IotSimulatorModal';
import { AlertsModal } from './components/AlertsModal';
import { LoginPage } from './components/LoginPage';
import {
  WeatherStation,
  Sensor,
  WeatherReading,
  MaintenanceTask,
  MaintenanceRecord,
  Alert,
  AuditLog,
  AnalyticsData,
  User,
  UserRole,
} from './types';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('meteor_token') !== null;
  });

  // Current logged in user (Default to Systems Administrator)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('meteor_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      _id: 'usr_001',
      name: 'Rajesh V. Sharma',
      email: 'admin@meteor-central.gov.in',
      role: 'admin',
      ward: 'Regional Directorate & AWS Control Hub',
    };
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Data Store States
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<WeatherReading[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // UI / Modal States
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Fetch all live data from Express backend
  const refreshAllData = useCallback(async () => {
    try {
      const [
        stnRes,
        snsRes,
        rdgRes,
        tskRes,
        mntRes,
        altRes,
        audRes,
        anaRes,
      ] = await Promise.all([
        fetch('/api/stations').then((r) => r.json()),
        fetch('/api/sensors').then((r) => r.json()),
        fetch('/api/readings?limit=250').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/maintenances').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
      ]);

      setStations(stnRes);
      setSensors(snsRes);
      setReadings(rdgRes);
      setTasks(tskRes);
      setMaintenances(mntRes);
      setAlerts(altRes);
      setAuditLogs(audRes);
      setAnalytics(anaRes);
    } catch (err) {
      console.error('Error fetching meteorological state:', err);
    }
  }, []);

  // Initial load & Polling interval
  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 8000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Login & Logout Handlers
  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem('meteor_token', token);
    localStorage.setItem('meteor_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome ${user.name}! Authorized as ${user.role.toUpperCase()}`);
    refreshAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem('meteor_token');
    localStorage.removeItem('meteor_user');
    setIsAuthenticated(false);
    showToast('Signed out of meteorological workstation session.');
  };

  // Role switching
  const handleSelectRole = (role: UserRole) => {
    const rolesMap: Record<UserRole, User> = {
      admin: {
        _id: 'usr_001',
        name: 'Rajesh V. Sharma',
        email: 'admin@meteor-central.gov.in',
        role: 'admin',
        ward: 'Regional Directorate & AWS Control Hub',
      },
      meteorologist: {
        _id: 'usr_002',
        name: 'Dr. Ananya Iyer',
        email: 'ananya.iyer@meteor-central.gov.in',
        role: 'meteorologist',
        ward: 'Climate Analysis & Forecast Division',
      },
      operator: {
        _id: 'usr_003',
        name: 'Arun Prakash',
        email: 'arun.prakash@meteor-central.gov.in',
        role: 'operator',
        ward: 'South Zone Field Instrumentation Unit',
      },
    };

    const newUsr = rolesMap[role];
    setCurrentUser(newUsr);
    localStorage.setItem('meteor_user', JSON.stringify(newUsr));
    showToast(`Switched active session to: ${newUsr.name} (${newUsr.role.toUpperCase()})`);
  };

  // Station Creation
  const handleCreateStation = async (stationData: any) => {
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationData),
      });
      if (res.ok) {
        showToast(`Commissioned new station: ${stationData.stationName}`);
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sensor Calibration
  const handleCalibrateSensor = async (sensorId: string, calibrationData: any) => {
    try {
      const res = await fetch(`/api/sensors/${sensorId}/calibrate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calibrationData),
      });
      if (res.ok) {
        showToast('Sensor recalibrated per WMO-No. 8 standards. Certificate generated.');
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Task Creation
  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        showToast('Maintenance task scheduled and dispatched.');
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Task Status Update
  const handleUpdateTask = async (taskId: string, updateData: any) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        showToast('Task updated in Maintenance Workflow.');
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Alert Resolution
  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy: currentUser.name }),
      });
      if (res.ok) {
        showToast('Alert resolved and recorded in audit ledger.');
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // IoT Multi-station Tick
  const handleTriggerTick = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/iot/tick', { method: 'POST' });
      await refreshAllData();
      showToast('Live telemetry cycle processed across all AWS nodes.');
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  // Inject Fault
  const handleInjectFault = async (faultType: string, stationId?: string) => {
    const res = await fetch('/api/iot/inject-fault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faultType, stationId }),
    });
    if (res.ok) {
      refreshAllData();
    }
  };

  // Push Reading
  const handlePushReading = async (reading: { stationId: string; parameter: string; value: number; unit: string }) => {
    const res = await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    });
    if (res.ok) {
      refreshAllData();
    }
  };

  const handleSelectStationFromList = (stationId: string) => {
    setSelectedStationId(stationId);
    setActiveTab('map');
  };

  // Render Login Page if user is not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />

        {notificationToast && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/80 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium text-emerald-300 flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{notificationToast}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/80 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium text-emerald-300 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        activeAlerts={alerts.filter((a) => !a.resolved)}
        onTriggerTick={handleTriggerTick}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        isSimulating={isSimulating}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingTasksCount={tasks.filter((t) => t.status !== 'Completed').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            analytics={analytics}
            stations={stations}
            alerts={alerts}
            tasks={tasks}
            onSelectStation={(id) => {
              setSelectedStationId(id);
              setActiveTab('map');
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onResolveAlert={handleResolveAlert}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'map' && (
          <StationMapView
            stations={stations}
            onSelectStation={(id) => setSelectedStationId(id)}
            selectedStationId={selectedStationId}
          />
        )}

        {activeTab === 'stations' && (
          <StationRegistryView
            stations={stations}
            sensors={sensors}
            onCreateStation={handleCreateStation}
            onCalibrateSensor={handleCalibrateSensor}
            userRole={currentUser.role}
            onSelectStationForMap={handleSelectStationFromList}
          />
        )}

        {activeTab === 'trends' && (
          <WeatherTrendsView
            stations={stations}
            readings={readings}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceBoardView
            tasks={tasks}
            stations={stations}
            sensors={sensors}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView
            auditLogs={auditLogs}
            maintenanceRecords={maintenances}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 text-xs text-slate-500 py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            &copy; 2026 Centralized Meteorological Weather Station System &bull; MERN Architecture
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>National Meteorological Department</span>
            <span>&bull;</span>
            <span>Automated Weather Station (AWS) Grid</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono">WMO-No. 8 Standard Certified</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <IotSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        stations={stations}
        onTriggerTick={handleTriggerTick}
        onInjectFault={handleInjectFault}
        onPushReading={handlePushReading}
      />

      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onResolveAlert={handleResolveAlert}
        userRole={currentUser.role}
        onNavigateToMaintenance={() => setActiveTab('maintenance')}
      />
    </div>
  );
}
