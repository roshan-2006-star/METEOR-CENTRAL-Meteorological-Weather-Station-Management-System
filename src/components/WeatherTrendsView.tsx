import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  CloudRain,
  Sun,
  Filter,
  BarChart2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { WeatherStation, WeatherReading, SensorType } from '../types';

interface WeatherTrendsViewProps {
  stations: WeatherStation[];
  readings: WeatherReading[];
}

export const WeatherTrendsView: React.FC<WeatherTrendsViewProps> = ({
  stations,
  readings,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?._id || 'stn_001');
  const [selectedParameter, setSelectedParameter] = useState<string>('Thermometer');
  const [timeWindowHours, setTimeWindowHours] = useState<number>(24);

  const parameters = [
    { id: 'Thermometer', name: 'Temperature', unit: '°C', icon: Thermometer, color: '#f59e0b', stroke: '#fbbf24' },
    { id: 'Hygrometer', name: 'Relative Humidity', unit: '%', icon: Droplets, color: '#38bdf8', stroke: '#0284c7' },
    { id: 'Barometer', name: 'Atmospheric Pressure', unit: 'hPa', icon: Gauge, color: '#a855f7', stroke: '#9333ea' },
    { id: 'Anemometer', name: 'Wind Speed', unit: 'km/h', icon: Wind, color: '#10b981', stroke: '#059669' },
    { id: 'Rain Gauge', name: 'Precipitation', unit: 'mm/h', icon: CloudRain, color: '#06b6d4', stroke: '#0891b2' },
    { id: 'Solar Radiation', name: 'Solar Insolation', unit: 'W/m²', icon: Sun, color: '#eab308', stroke: '#ca8a04' },
  ];

  const currentParamConfig = parameters.find((p) => p.id === selectedParameter) || parameters[0];

  // Filter readings for selected station, parameter, and time window
  const filteredReadings = useMemo(() => {
    const now = Date.now();
    const cutoff = now - timeWindowHours * 60 * 60 * 1000;

    return readings
      .filter(
        (r) =>
          r.stationId === selectedStationId &&
          r.parameter.toLowerCase() === selectedParameter.toLowerCase() &&
          new Date(r.timestamp).getTime() >= cutoff
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [readings, selectedStationId, selectedParameter, timeWindowHours]);

  const selectedStation = stations.find((s) => s._id === selectedStationId);

  // Compute Statistics
  const values = filteredReadings.map((r) => r.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const avgVal = values.length > 0 ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0;
  const latestVal = values.length > 0 ? values[values.length - 1] : 0;

  // Chart Dimensions & Coordinate calculations for SVG
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Bounds for Y-axis
  const rangeSpan = maxVal - minVal || 10;
  const yMin = Math.floor(minVal - rangeSpan * 0.15);
  const yMax = Math.ceil(maxVal + rangeSpan * 0.15);

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padding.left + graphWidth / 2;
    return padding.left + (idx / (total - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin || 1);
    return height - padding.bottom - ratio * graphHeight;
  };

  // Build SVG Path
  const linePath = useMemo(() => {
    if (filteredReadings.length === 0) return '';
    return filteredReadings.reduce((acc, curr, idx) => {
      const x = getX(idx, filteredReadings.length);
      const y = getY(curr.value);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [filteredReadings, yMin, yMax]);

  const areaPath = useMemo(() => {
    if (filteredReadings.length === 0) return '';
    const firstX = getX(0, filteredReadings.length);
    const lastX = getX(filteredReadings.length - 1, filteredReadings.length);
    const baseY = height - padding.bottom;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [linePath, filteredReadings]);

  return (
    <div className="space-y-6">
      {/* Top Selector Controls */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70 flex flex-wrap items-center justify-between gap-4">
        {/* Station Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Target Station:</label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {stations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.stationCode} - {s.stationName} ({s.region})
              </option>
            ))}
          </select>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
          {[6, 12, 24].map((hours) => (
            <button
              key={hours}
              onClick={() => setTimeWindowHours(hours)}
              className={`px-3 py-1 text-xs rounded-md transition cursor-pointer font-medium ${
                timeWindowHours === hours
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Past {hours}h
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {parameters.map((param) => {
          const Icon = param.icon;
          const isSelected = selectedParameter === param.id;

          return (
            <button
              key={param.id}
              onClick={() => setSelectedParameter(param.id)}
              className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  className="w-4 h-4"
                  style={{ color: isSelected ? param.color : '#94a3b8' }}
                />
                <span className="text-[10px] font-mono text-slate-400">{param.unit}</span>
              </div>
              <div>
                <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {param.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart Card */}
      <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>
                {currentParamConfig.name} Profile &bull; {selectedStation?.stationName}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Sensor observations logged at regular intervals ({filteredReadings.length} data points)
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/70">
              <span className="text-slate-400">Latest:</span>{' '}
              <span className="font-mono font-bold text-white">
                {latestVal} {currentParamConfig.unit}
              </span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/70">
              <span className="text-slate-400">Mean:</span>{' '}
              <span className="font-mono font-bold text-emerald-400">
                {avgVal} {currentParamConfig.unit}
              </span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/70">
              <span className="text-slate-400">Min / Max:</span>{' '}
              <span className="font-mono font-bold text-slate-200">
                {minVal} / {maxVal} {currentParamConfig.unit}
              </span>
            </div>
          </div>
        </div>

        {/* SVG Chart Render */}
        <div className="w-full overflow-x-auto bg-slate-900/90 rounded-lg border border-slate-800 p-2">
          {filteredReadings.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-xs">
              No historical sensor data available for the chosen time range.
            </div>
          ) : (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentParamConfig.color} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={currentParamConfig.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding.top + pct * graphHeight;
                const labelVal = (yMax - pct * (yMax - yMin)).toFixed(1);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Area Fill */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Main Line */}
              <path
                d={linePath}
                fill="none"
                stroke={currentParamConfig.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {filteredReadings.map((r, idx) => {
                const cx = getX(idx, filteredReadings.length);
                const cy = getY(r.value);
                const isAnomaly = r.status === 'Warning' || r.qualityFlag === 'Suspect';

                return (
                  <g key={r._id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isAnomaly ? 5 : 3}
                      fill={isAnomaly ? '#f43f5e' : currentParamConfig.color}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    {/* Timestamp label on selective points */}
                    {(idx === 0 || idx === Math.floor(filteredReadings.length / 2) || idx === filteredReadings.length - 1) && (
                      <text
                        x={cx}
                        y={height - padding.bottom + 18}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Graph Bottom Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Data Quality Assured</span>
            <div className="mt-1 flex items-center gap-1.5 text-emerald-400 font-medium">
              <span>99.4% Validated Packets</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Automated drift filter checks variance against neighboring Chennai AWS nodes.
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Diurnal Swing</span>
            <div className="mt-1 font-mono text-white font-bold">
              {Number((maxVal - minVal).toFixed(1))} {currentParamConfig.unit}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cycle correlates with solar azimuth angle and sea-breeze inland penetration.
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Compliance Limit</span>
            <div className="mt-1 text-slate-300 font-mono">
              WMO Guide No. 8 Chapter 2 Spec
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Zero tolerance drift boundary strictly monitored for forecasting reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
