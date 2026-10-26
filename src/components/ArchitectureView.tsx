import React, { useState } from 'react';
import {
  Layers,
  Database,
  Server,
  Monitor,
  Users,
  GitBranch,
  BookOpen,
  Award,
  CheckCircle2,
  Cpu,
  Radio,
  FileCode,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'er' | 'usecase' | 'api' | 'survey'>('architecture');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
            Centralized Meteorological Weather Station Platform
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            System Architecture & Technical Specifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Full-Stack MERN Architecture &bull; Distributed IoT Sensor Ingestion &bull; WMO-No. 8 Regulatory Compliance
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center flex-wrap gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700 text-xs">
          {[
            { id: 'architecture', label: 'System Architecture' },
            { id: 'er', label: 'ER Diagram / DB' },
            { id: 'usecase', label: 'Use Case & Actors' },
            { id: 'api', label: 'REST API Specs' },
            { id: 'survey', label: 'Standards & Research' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeSection === item.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Detailed 3-Tier System Architecture */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>3-Tier MERN System Architecture</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Data pipeline flow: Station Registry &rarr; IoT Sensor Feeds &rarr; Storage Analytics &rarr; Calibration Scheduler &rarr; Maintenance Workflow &rarr; Audit Trail Engine
              </p>
            </div>

            {/* 3 Tier Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Tier */}
              <div className="bg-slate-900/90 rounded-xl border border-teal-500/40 p-5 space-y-3 relative overflow-hidden">
                <div className="w-1.5 h-full bg-teal-500 absolute left-0 top-0"></div>
                <div className="flex items-center justify-between text-teal-400 pl-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">CLIENT TIER</span>
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="pl-2 space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm">React.js Single Page App</h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Context API & State Management</li>
                    <li>Leaflet Interactive Geo-Map</li>
                    <li>Real-time Telemetry Dashboard</li>
                    <li>Trend Visualizer & Charts</li>
                    <li>Mobile-friendly Operator Forms</li>
                    <li>Tailwind CSS Design System</li>
                  </ul>
                </div>
              </div>

              {/* Application Tier */}
              <div className="bg-slate-900/90 rounded-xl border border-emerald-500/40 p-5 space-y-3 relative overflow-hidden">
                <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0"></div>
                <div className="flex items-center justify-between text-emerald-400 pl-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">APPLICATION TIER</span>
                  <Server className="w-5 h-5" />
                </div>
                <div className="pl-2 space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm">Node.js + Express.js REST API</h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Modular MVC Route Controllers</li>
                    <li>JWT Authentication & RBAC Middleware</li>
                    <li>node-cron Scheduled Health Monitor</li>
                    <li>Alert Engine & Threshold Evaluator</li>
                    <li>IoT Ingestion API (<code className="text-emerald-400 font-mono">/api/readings</code>)</li>
                    <li>Immutable Audit Trail Engine</li>
                  </ul>
                </div>
              </div>

              {/* Data Tier */}
              <div className="bg-slate-900/90 rounded-xl border border-cyan-500/40 p-5 space-y-3 relative overflow-hidden">
                <div className="w-1.5 h-full bg-cyan-500 absolute left-0 top-0"></div>
                <div className="flex items-center justify-between text-cyan-400 pl-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">DATA TIER</span>
                  <Database className="w-5 h-5" />
                </div>
                <div className="pl-2 space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm">MongoDB & Document Collections</h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li><strong className="text-white">WeatherStation:</strong> GPS, region, status</li>
                    <li><strong className="text-white">Sensor:</strong> Type, tolerance, calibration</li>
                    <li><strong className="text-white">WeatherReading:</strong> Time-series telemetry</li>
                    <li><strong className="text-white">MaintenanceTask:</strong> Workflow status</li>
                    <li><strong className="text-white">MaintenanceRecord:</strong> WMO certificates</li>
                    <li><strong className="text-white">User:</strong> Roles & department wards</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Architecture Pipeline Flow Diagram */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase mb-3 font-semibold">
                Telemetry & Workflow Pipeline:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                {[
                  { name: 'Station Registry', color: 'bg-blue-900/40 text-blue-300 border-blue-700/60' },
                  { name: 'IoT Sensor Feeds', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60' },
                  { name: 'Storage Analytics', color: 'bg-amber-900/40 text-amber-300 border-amber-700/60' },
                  { name: 'Calibration Scheduler', color: 'bg-orange-900/40 text-orange-300 border-orange-700/60' },
                  { name: 'Maintenance Workflow', color: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/60' },
                  { name: 'Audit Trail Engine', color: 'bg-teal-900/40 text-teal-300 border-teal-700/60' },
                ].map((step, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border font-semibold ${step.color}`}>
                    <div className="text-[10px] font-mono opacity-60">Step {idx + 1}</div>
                    <div className="mt-1">{step.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: ER Diagram */}
      {activeSection === 'er' && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Entity Relationship (ER) Diagram & Schema Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              6 collections linked by ObjectId references: WeatherStation 1:N Sensor, Sensor 1:N Reading, Maintenance, Task.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* User Collection */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-emerald-400 text-sm border-b border-slate-800 pb-1.5">
                User
              </div>
              <div className="text-slate-300 space-y-1">
                <div><span className="text-amber-400">_id</span> (PK, ObjectId)</div>
                <div>name: String</div>
                <div>email: String</div>
                <div>role: 'admin' | 'meteorologist' | 'operator'</div>
                <div>ward: String</div>
              </div>
            </div>

            {/* WeatherStation Collection */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-blue-400 text-sm border-b border-slate-800 pb-1.5">
                WeatherStation
              </div>
              <div className="text-slate-300 space-y-1">
                <div><span className="text-amber-400">_id</span> (PK, ObjectId)</div>
                <div>stationCode: String</div>
                <div>stationName: String</div>
                <div>location: String</div>
                <div>region: String</div>
                <div>elevation: Number (MSL)</div>
                <div>coordinates: &#123; lat, lng &#125;</div>
                <div>status: String</div>
                <div>lastSeen: ISODate</div>
              </div>
            </div>

            {/* Sensor Collection */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-teal-400 text-sm border-b border-slate-800 pb-1.5">
                Sensor
              </div>
              <div className="text-slate-300 space-y-1">
                <div><span className="text-amber-400">_id</span> (PK, ObjectId)</div>
                <div><span className="text-cyan-400">stationId</span> (FK &rarr; WeatherStation)</div>
                <div>sensorType: String</div>
                <div>unit: String</div>
                <div>toleranceMin, toleranceMax</div>
                <div>lastCalibrationDate: Date</div>
                <div>nextCalibrationDueDate: Date</div>
                <div>status: String</div>
              </div>
            </div>

            {/* WeatherReading Collection */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-1.5">
                WeatherReading
              </div>
              <div className="text-slate-300 space-y-1">
                <div><span className="text-amber-400">_id</span> (PK, ObjectId)</div>
                <div><span className="text-cyan-400">sensorId</span> (FK &rarr; Sensor)</div>
                <div><span className="text-cyan-400">stationId</span> (FK &rarr; WeatherStation)</div>
                <div>parameter: String</div>
                <div>value: Number</div>
                <div>timestamp: ISODate</div>
                <div>qualityFlag: 'Good' | 'Suspect'</div>
              </div>
            </div>

            {/* MaintenanceRecord Collection */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-purple-400 text-sm border-b border-slate-800 pb-1.5">
                Maintenance
              </div>
              <div className="text-slate-300 space-y-1">
                <div><span className="text-amber-400">_id</span> (PK, ObjectId)</div>
                <div><span className="text-cyan-400">sensorId</span> (FK &rarr; Sensor)</div>
                <div><span className="text-cyan-400">engineerId</span> (FK &rarr; User)</div>
                <div>date: ISODate</div>
                <div>workDetails: String</div>
                <div>certificateNo: String</div>
                <div>standardUsed: 'WMO-No. 8'</div>
              </div>
            </div>

            {/* Alert / MaintenanceTask Collection */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-rose-400 text-sm border-b border-slate-800 pb-1.5">
                Alert / MaintenanceTask
              </div>
              <div className="text-slate-300 space-y-1">
                <div><span className="text-amber-400">_id</span> (PK, ObjectId)</div>
                <div><span className="text-cyan-400">sensorId</span> (FK, optional)</div>
                <div><span className="text-cyan-400">assignedTo</span> (FK &rarr; User)</div>
                <div>dueDate: ISODate</div>
                <div>priority: 'Critical' | 'High'</div>
                <div>status: 'Pending' | 'In Progress'</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Use Case & Actors */}
      {activeSection === 'usecase' && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Use Case & Actors Interaction Model</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Core actors interact with the Meteorological Weather Management System according to their role privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>System Admin</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Commission new weather stations</li>
                <li>Assign GPS & region metadata</li>
                <li>Create and assign maintenance tasks</li>
                <li>Manage departmental user accounts</li>
                <li>Configure alert threshold parameters</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Monitor className="w-4 h-4" />
                <span>Meteorologist</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Monitor live weather data streams</li>
                <li>Analyze 24h & 7d meteorological trends</li>
                <li>Detect sensor calibration drift</li>
                <li>Evaluate weather anomaly alerts</li>
                <li>Export statistical weather reports</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>Field Operator</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Receive dispatched maintenance tasks</li>
                <li>Execute on-site sensor inspection</li>
                <li>Log sensor calibration & offset tuning</li>
                <li>Report faulty sensors & physical damage</li>
                <li>Submit WMO compliance certificates</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Radio className="w-4 h-4" />
                <span>Weather Sensor Node</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Periodically pushes JSON observations</li>
                <li>Streams temp, humidity, pressure, wind, rain</li>
                <li>Sends battery & solar telemetry</li>
                <li>Triggers out-of-range sensor flags</li>
                <li>Heartbeat monitoring maintains "last seen"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: REST API Specifications */}
      {activeSection === 'api' && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <span>RESTful API Specifications</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active Express.js endpoints powering meteorological operations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 font-mono text-[11px]">
                {[
                  { method: 'POST', endpoint: '/api/auth/login', desc: 'Authenticate & issue JWT token', status: 'Active (200 OK)' },
                  { method: 'GET', endpoint: '/api/stations', desc: 'Fetch all weather stations with live status', status: 'Active (200 OK)' },
                  { method: 'POST', endpoint: '/api/stations', desc: 'Commission new weather station with GPS coords', status: 'Active (201 Created)' },
                  { method: 'GET', endpoint: '/api/sensors', desc: 'Fetch all meteorological sensor channels', status: 'Active (200 OK)' },
                  { method: 'POST', endpoint: '/api/readings', desc: 'Receive sensor telemetry and weather observations', status: 'Active (201 Created)' },
                  { method: 'GET', endpoint: '/api/readings', desc: 'Query time-series historical weather observations', status: 'Active (200 OK)' },
                  { method: 'POST', endpoint: '/api/inspections', desc: 'Schedule / log field inspection & calibration', status: 'Active (201 Created)' },
                  { method: 'PUT', endpoint: '/api/tasks/:id', desc: 'Update maintenance and calibration task status', status: 'Active (200 OK)' },
                  { method: 'GET', endpoint: '/api/alerts', desc: 'Fetch active abnormal readings & offline alerts', status: 'Active (200 OK)' },
                  { method: 'GET', endpoint: '/api/audit-logs', desc: 'Audit Trail Engine immutable activity logs', status: 'Active (200 OK)' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-750/30">
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.method === 'GET'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : row.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white">{row.endpoint}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">{row.desc}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: Standards & Research */}
      {activeSection === 'survey' && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Meteorological Standards & Literature Reference</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Foundational research justifying the centralized station asset management layer.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Basha, S. (2015)</span>
                <span className="text-slate-400 font-mono">Journal of Atmospheric Research</span>
              </div>
              <p className="text-slate-300">
                <strong>Description:</strong> Studied automatic weather station networks and their effect on forecast accuracy.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                <div className="text-emerald-400"><strong>Pros:</strong> Shows measurable gains from denser, automated station coverage.</div>
                <div className="text-rose-400"><strong>Cons:</strong> Focuses on data collection only; does not address maintenance or calibration tracking.</div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Rao, P. & Kumar, S. (2018)</span>
                <span className="text-slate-400 font-mono">International Journal of Sensor Networks</span>
              </div>
              <p className="text-slate-300">
                <strong>Description:</strong> Proposed an IoT-based framework for remote monitoring of environmental sensors.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                <div className="text-emerald-400"><strong>Pros:</strong> Demonstrates real-time data transmission from distributed sensor nodes.</div>
                <div className="text-rose-400"><strong>Cons:</strong> Single-site prototype; no department-wide asset management layer.</div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">World Meteorological Organization (WMO)</span>
                <span className="text-slate-400 font-mono">WMO-No. 8 (Guide to Meteorological Instruments)</span>
              </div>
              <p className="text-slate-300">
                <strong>Description:</strong> Guide to Meteorological Instruments and Methods of Observation. Establishes standard calibration intervals and procedures worldwide.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                <div className="text-emerald-400"><strong>Pros:</strong> Establishes international standard calibration intervals and error bounds.</div>
                <div className="text-slate-400"><strong>Addressed by this platform:</strong> Implemented as automated software scheduler and digital compliance certificates.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
