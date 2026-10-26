import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Cpu,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Sliders,
  ShieldCheck,
  Wrench,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WeatherStation, Sensor, UserRole } from '../types';

interface StationRegistryViewProps {
  stations: WeatherStation[];
  sensors: Sensor[];
  onCreateStation: (stationData: any) => Promise<void>;
  onCalibrateSensor: (sensorId: string, calibrationData: any) => Promise<void>;
  userRole: UserRole;
  onSelectStationForMap: (stationId: string) => void;
}

export const StationRegistryView: React.FC<StationRegistryViewProps> = ({
  stations,
  sensors,
  onCreateStation,
  onCalibrateSensor,
  userRole,
  onSelectStationForMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [expandedStationId, setExpandedStationId] = useState<string | null>(stations[0]?._id || null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [calibratingSensor, setCalibratingSensor] = useState<Sensor | null>(null);

  // New Station Form State
  const [newStation, setNewStation] = useState({
    stationName: '',
    region: 'Chennai Central',
    location: '',
    elevation: 15,
    lat: 13.0827,
    lng: 80.2707,
    contactPerson: '',
  });

  // Calibration Form State
  const [calibrationForm, setCalibrationForm] = useState({
    calibrationNotes: 'Verified against secondary standard chamber per WMO-No. 8 Part 1.',
    adjustedOffset: '0.00',
    certifiedBy: 'Field Calibration Officer',
  });

  const regions = ['All', ...Array.from(new Set(stations.map((s) => s.region)))];

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || s.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleCreateStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStation.stationName || !newStation.region) return;

    await onCreateStation({
      stationName: newStation.stationName,
      region: newStation.region,
      location: newStation.location || `${newStation.stationName}, ${newStation.region}`,
      elevation: Number(newStation.elevation),
      coordinates: {
        lat: Number(newStation.lat),
        lng: Number(newStation.lng),
      },
      contactPerson: newStation.contactPerson || 'Regional Instrumentation Officer',
    });

    setShowAddModal(false);
    setNewStation({
      stationName: '',
      region: 'Chennai Central',
      location: '',
      elevation: 15,
      lat: 13.0827,
      lng: 80.2707,
      contactPerson: '',
    });
  };

  const handleCalibrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibratingSensor) return;

    await onCalibrateSensor(calibratingSensor._id, calibrationForm);
    setCalibratingSensor(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station by name, code (e.g. AWS-CHE-001) or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Station Button (Admin / Lead) */}
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Commission Weather Station</span>
          </button>
        )}
      </div>

      {/* Station List */}
      <div className="space-y-4">
        {filteredStations.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center text-slate-400 text-xs border border-slate-700">
            No weather stations match your search or filter criteria.
          </div>
        ) : (
          filteredStations.map((station) => {
            const isExpanded = expandedStationId === station._id;
            const stationSensors = sensors.filter((s) => s.stationId === station._id);

            const statusColors: Record<string, string> = {
              Online: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              Degraded: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              Offline: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              Calibrating: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
            };

            return (
              <div
                key={station._id}
                className="bg-slate-800/80 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm transition hover:border-slate-600"
              >
                {/* Station Summary Row */}
                <div
                  onClick={() => setExpandedStationId(isExpanded ? null : station._id)}
                  className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-750/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                      {station.stationCode.split('-').pop()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{station.stationName}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                          {station.stationCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            statusColors[station.status]
                          }`}
                        >
                          {station.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {station.region} ({station.location})
                        </span>
                        <span>&bull;</span>
                        <span>Elevation: {station.elevation}m MSL</span>
                        <span>&bull;</span>
                        <span>GPS: {station.coordinates.lat.toFixed(4)}°N, {station.coordinates.lng.toFixed(4)}°E</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Channels</div>
                        <div className="font-semibold">{stationSensors.length} Sensors</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Battery</div>
                        <div className="font-semibold text-emerald-400">{station.batteryLevel}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Commissioned</div>
                        <div className="font-mono text-slate-400">{station.installationDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStationForMap(station._id);
                        }}
                        className="px-2.5 py-1 text-xs rounded bg-slate-750 hover:bg-slate-700 text-emerald-400 border border-slate-700 cursor-pointer"
                        title="View on Map"
                      >
                        Map
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Sensor Channels Breakdown (Slide 6 & 8) */}
                {isExpanded && (
                  <div className="border-t border-slate-700/60 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Configured Sensor Array & WMO Calibration Status</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Contact: {station.contactPerson} &bull; Firmware: {station.firmwareVersion}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stationSensors.map((sensor) => {
                        const isDrift = sensor.status === 'Drift Detected';
                        const isDue = sensor.status === 'Calibration Due';
                        const isFaulty = sensor.status === 'Faulty';

                        return (
                          <div
                            key={sensor._id}
                            className={`p-3 rounded-lg border text-xs relative ${
                              isDrift || isFaulty
                                ? 'bg-rose-950/20 border-rose-800/40'
                                : isDue
                                ? 'bg-amber-950/20 border-amber-800/40'
                                : 'bg-slate-800/70 border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-white text-sm">
                                  {sensor.sensorType}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {sensor.model}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  sensor.status === 'Normal'
                                    ? 'bg-emerald-900/60 text-emerald-300'
                                    : sensor.status === 'Drift Detected'
                                    ? 'bg-rose-900/70 text-rose-300 animate-pulse'
                                    : 'bg-amber-900/70 text-amber-300'
                                }`}
                              >
                                {sensor.status}
                              </span>
                            </div>

                            <div className="mt-3 flex items-baseline justify-between">
                              <div>
                                <div className="text-[10px] text-slate-400">Current Reading</div>
                                <div className="text-xl font-extrabold font-mono text-emerald-400">
                                  {station.status === 'Offline' ? '--' : `${sensor.currentReading} ${sensor.unit}`}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-slate-400">Operational Limits</div>
                                <div className="text-[11px] font-mono text-slate-300">
                                  {sensor.toleranceMin} to {sensor.toleranceMax} {sensor.unit}
                                </div>
                              </div>
                            </div>

                            {/* Calibration Dates */}
                            <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Due: <span className={isDue ? 'text-amber-400 font-semibold' : 'text-slate-300 font-mono'}>{sensor.nextCalibrationDueDate}</span></span>
                              <button
                                onClick={() => setCalibratingSensor(sensor)}
                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                              >
                                <Wrench className="w-3 h-3" />
                                <span>Calibrate</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Commission Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Commission New Weather Station</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStationSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chembarambakkam Reservoir AWS"
                  value={newStation.stationName}
                  onChange={(e) => setNewStation({ ...newStation, stationName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Regional Zone</label>
                  <select
                    value={newStation.region}
                    onChange={(e) => setNewStation({ ...newStation, region: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Chennai Central">Chennai Central</option>
                    <option value="Chennai South">Chennai South</option>
                    <option value="Chennai East Coastal">Chennai East Coastal</option>
                    <option value="Chennai West">Chennai West</option>
                    <option value="Kanchipuram Industrial">Kanchipuram Industrial</option>
                    <option value="Chengalpattu Coastal">Chengalpattu Coastal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Elevation (MSL in meters)</label>
                  <input
                    type="number"
                    value={newStation.elevation}
                    onChange={(e) => setNewStation({ ...newStation, elevation: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newStation.lat}
                    onChange={(e) => setNewStation({ ...newStation, lat: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newStation.lng}
                    onChange={(e) => setNewStation({ ...newStation, lng: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Physical Location / Enclosure Address</label>
                <input
                  type="text"
                  placeholder="e.g. Reservoir Dam Headworks, Chembarambakkam"
                  value={newStation.location}
                  onChange={(e) => setNewStation({ ...newStation, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Designated Officer / Engineer</label>
                <input
                  type="text"
                  placeholder="e.g. S. Basha (Instrument Division)"
                  value={newStation.contactPerson}
                  onChange={(e) => setNewStation({ ...newStation, contactPerson: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <strong>Automatic Provisioning:</strong> Initialises standard meteorological channel package (Thermometer PT100, Hygrometer, Barometer, Ultrasonic Anemometer, Tipping Bucket Rain Gauge) per WMO-No. 8 baseline.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md"
                >
                  Confirm Commissioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensor Calibration Modal */}
      {calibratingSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>WMO Sensor Recalibration & Verification</span>
              </h3>
              <button
                onClick={() => setCalibratingSensor(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Sensor Type:</span>
                <span className="font-semibold text-white">{calibratingSensor.sensorType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Model:</span>
                <span className="font-mono text-slate-300">{calibratingSensor.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Reading:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {calibratingSensor.currentReading} {calibratingSensor.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-amber-400 font-semibold">{calibratingSensor.status}</span>
              </div>
            </div>

            <form onSubmit={handleCalibrationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Adjusted Zero / Span Offset Tuning
                </label>
                <input
                  type="text"
                  value={calibrationForm.adjustedOffset}
                  onChange={(e) => setCalibrationForm({ ...calibrationForm, adjustedOffset: e.target.value })}
                  placeholder="e.g. -0.15"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Calibration Methodology & Standard Used
                </label>
                <textarea
                  rows={2}
                  value={calibrationForm.calibrationNotes}
                  onChange={(e) => setCalibrationForm({ ...calibrationForm, calibrationNotes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Certifying Field Instrument Engineer
                </label>
                <input
                  type="text"
                  value={calibrationForm.certifiedBy}
                  onChange={(e) => setCalibrationForm({ ...calibrationForm, certifiedBy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60 text-[11px] text-emerald-300">
                &bull; Submitting this audit generates a tamper-evident digital certificate per WMO-No. 8 & BIS IS 4967:1994, updates the sensor calibration timestamp to +6 months, and logs to the immutable audit trail.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setCalibratingSensor(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md"
                >
                  Certify & Calibrate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
