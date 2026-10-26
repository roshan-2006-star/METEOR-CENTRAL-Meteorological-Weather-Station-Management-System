import React from 'react';
import {
  Radio,
  Thermometer,
  Gauge,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WeatherStation, AnalyticsData, Alert, MaintenanceTask, UserRole } from '../types';

interface DashboardViewProps {
  analytics: AnalyticsData | null;
  stations: WeatherStation[];
  alerts: Alert[];
  tasks: MaintenanceTask[];
  onSelectStation: (stationId: string) => void;
  onNavigateToTab: (tab: any) => void;
  onResolveAlert: (alertId: string) => void;
  userRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  stations,
  alerts,
  tasks,
  onSelectStation,
  onNavigateToTab,
  onResolveAlert,
  userRole,
}) => {
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row (Matches Slide 9 wireframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Stations Online */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stations Online</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.stations.online ?? 0}
            </span>
            <span className="text-xs text-slate-400">
              / {analytics?.stations.total ?? 0} ({analytics?.stations.uptimePercentage ?? 0}%)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400 font-medium">{analytics?.stations.online} Healthy</span>
            {Boolean(analytics?.stations.offline) && (
              <span className="text-rose-400 ml-2">
                &bull; {analytics?.stations.offline} Offline
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Avg Temperature */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.networkAverages.temperature ?? 31.8}°C
            </span>
            <span className="text-xs text-slate-400">Regional Mean</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Range: 27.5°C - 34.5°C</span>
            <span className="text-amber-400 font-medium">Nominal</span>
          </div>
        </div>

        {/* Card 3: Avg Pressure */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Barometric Pressure</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.networkAverages.pressure ?? 1012.3}
            </span>
            <span className="text-xs text-slate-400">hPa</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400">
            <span>Steady Mean Sea Level (MSL)</span>
          </div>
        </div>

        {/* Card 4: Active Alerts (Slide 9 wireframe) */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {activeAlerts.length}
            </span>
            <span className="text-xs text-rose-400 font-semibold">
              ({analytics?.alerts.critical ?? 0} Critical)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">{analytics?.alerts.warning ?? 0} Warnings</span>
            <button
              onClick={() => onNavigateToTab('maintenance')}
              className="text-rose-400 hover:underline flex items-center cursor-pointer"
            >
              Action <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 5: Calibration Compliance */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">WMO Compliance</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-400">
              {analytics?.sensors.complianceRate ?? 88}%
            </span>
            <span className="text-xs text-slate-400">Sensors</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">
              {analytics?.sensors.dueCalibration ?? 0} Overdue / Drift
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Live Weather Station Telemetry Grid & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Weather Stations Telemetry Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-xl border border-slate-700/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Real-Time Weather Station Observations</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  Live Stream
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous IoT sensor telemetry feeds across regional meteorological nodes
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-750 px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              <span>View On Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3">Station Code & Name</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Temp</th>
                  <th className="py-2.5 px-3">Humidity</th>
                  <th className="py-2.5 px-3">Wind</th>
                  <th className="py-2.5 px-3">Rain</th>
                  <th className="py-2.5 px-3">Pressure</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {stations.map((stn) => {
                  const tempSensor = stn.sensors?.find((s) => s.sensorType === 'Thermometer');
                  const humSensor = stn.sensors?.find((s) => s.sensorType === 'Hygrometer');
                  const windSensor = stn.sensors?.find((s) => s.sensorType === 'Anemometer');
                  const rainSensor = stn.sensors?.find((s) => s.sensorType === 'Rain Gauge');
                  const baroSensor = stn.sensors?.find((s) => s.sensorType === 'Barometer');

                  const statusColors: Record<string, string> = {
                    Online: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    Degraded: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    Offline: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                    Calibrating: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  };

                  return (
                    <tr
                      key={stn._id}
                      className="hover:bg-slate-750/50 transition cursor-pointer"
                      onClick={() => onSelectStation(stn._id)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{stn.stationName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{stn.stationCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{stn.region}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            statusColors[stn.status] || 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {stn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-amber-300">
                        {stn.status === 'Offline' ? '--' : `${tempSensor?.currentReading ?? 31.4}°C`}
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-300">
                        {stn.status === 'Offline' ? '--' : `${humSensor?.currentReading ?? 68}%`}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-300">
                        {stn.status === 'Offline'
                          ? '--'
                          : `${windSensor?.currentReading ?? 14} km/h`}
                      </td>
                      <td className="py-3 px-3 font-mono text-cyan-300">
                        {stn.status === 'Offline'
                          ? '--'
                          : `${rainSensor?.currentReading ?? 0.0} mm`}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {stn.status === 'Offline'
                          ? '--'
                          : `${baroSensor?.currentReading ?? 1012} hPa`}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStation(stn._id);
                          }}
                          className="px-2 py-1 text-[11px] rounded bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Anomaly Alerts & Quick Maintenance Due (Matching Slide 9) */}
        <div className="space-y-6">
          {/* Active Alerts Box */}
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Active Network Alerts</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeAlerts.length} unresolved
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All meteorological stations and sensors operating within nominal WMO limits.
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt._id}
                    className={`p-3 rounded-lg border text-xs ${
                      alt.severity === 'Critical'
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : alt.severity === 'Warning'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                        : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-white">{alt.title}</div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {alt.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 whitespace-nowrap">
                        {alt.severity}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {userRole !== 'operator' ? (
                        <button
                          onClick={() => onResolveAlert(alt._id)}
                          className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                        >
                          Acknowledge & Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigateToTab('maintenance')}
                          className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                        >
                          Inspect in Field
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Maintenance Due Section (Exact match to Slide 9 wireframe right column) */}
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Maintenance Due</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('maintenance')}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                View Board
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => onNavigateToTab('maintenance')}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 hover:border-slate-600 transition flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-slate-200">{t.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{t.stationName}</span>
                      <span>&bull;</span>
                      <span className="text-amber-400 font-mono">Due: {t.dueDate}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.priority === 'Critical'
                        ? 'bg-rose-900/60 text-rose-300'
                        : t.priority === 'High'
                        ? 'bg-amber-900/60 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary: WMO Standards & Departmental Specifications */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            WMO
          </div>
          <div>
            <div className="font-semibold text-white">
              World Meteorological Organization Standard WMO-No. 8 & BIS IS 4967:1994
            </div>
            <div className="text-slate-400">
              Automated sensor drift monitoring, bi-annual calibration schedules, auditable digital certificates.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('audit')}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer"
          >
            Audit Trail Records
          </button>
          <button
            onClick={() => onNavigateToTab('trends')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
          >
            View Weather Trends
          </button>
        </div>
      </div>
    </div>
  );
};
