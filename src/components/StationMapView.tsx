import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Navigation,
  Battery,
  Sun,
  Activity,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Info,
  Maximize2,
} from 'lucide-react';
import { WeatherStation, Sensor } from '../types';

interface StationMapViewProps {
  stations: WeatherStation[];
  onSelectStation: (stationId: string) => void;
  selectedStationId?: string | null;
}

export const StationMapView: React.FC<StationMapViewProps> = ({
  stations,
  onSelectStation,
  selectedStationId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeStation, setActiveStation] = useState<WeatherStation | null>(null);

  // Available regions
  const regions = ['All', ...Array.from(new Set(stations.map((s) => s.region)))];

  // Filter stations
  const filteredStations = stations.filter((s) => {
    const matchesRegion = regionFilter === 'All' || s.region === regionFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesRegion && matchesStatus;
  });

  // Keep active station synced
  useEffect(() => {
    if (selectedStationId) {
      const match = stations.find((s) => s._id === selectedStationId);
      if (match) setActiveStation(match);
    } else if (stations.length > 0 && !activeStation) {
      setActiveStation(stations[0]);
    }
  }, [selectedStationId, stations]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered around Chennai & regional coastal Tamil Nadu
      const map = L.map(mapContainerRef.current, {
        center: [12.98, 80.18],
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Meteorological Dept',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for stations
    filteredStations.forEach((station) => {
      const isSelected = activeStation?._id === station._id;

      const getMarkerColor = (status: string) => {
        switch (status) {
          case 'Online':
            return '#10b981'; // emerald
          case 'Degraded':
            return '#f59e0b'; // amber
          case 'Offline':
            return '#f43f5e'; // rose
          case 'Calibrating':
            return '#3b82f6'; // blue
          default:
            return '#64748b';
        }
      };

      const color = getMarkerColor(station.status);

      // Custom HTML Marker Pin
      const icon = L.divIcon({
        className: 'custom-weather-pin',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: #0f172a;
            border: 2px solid ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            transform: translate(-50%, -50%) scale(${isSelected ? '1.25' : '1'});
            transition: transform 0.2s ease;
          ">
            <span style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${color};
              box-shadow: 0 0 8px ${color};
            "></span>
            ${
              station.status === 'Offline'
                ? `<span style="position: absolute; top:-4px; right:-4px; width:8px; height:8px; background:#ef4444; border-radius:50%;"></span>`
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setActiveStation(station);
          onSelectStation(station._id);
        });

      // Simple tooltip
      marker.bindTooltip(
        `<strong>${station.stationName}</strong><br/>${station.stationCode} &bull; ${station.status}`,
        { direction: 'top', offset: [0, -16] }
      );

      markersRef.current[station._id] = marker;
    });

    // Resize map to fix viewport layout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [filteredStations, activeStation, onSelectStation]);

  const handleCenterOnStation = (station: WeatherStation) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([station.coordinates.lat, station.coordinates.lng], 13, {
        duration: 1.2,
      });
    }
    setActiveStation(station);
    onSelectStation(station._id);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Region:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  regionFilter === r
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-750 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          {['All', 'Online', 'Degraded', 'Offline', 'Calibrating'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-750 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leaflet Map Container (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm flex flex-col h-[560px] relative">
          <div
            ref={mapContainerRef}
            className="w-full h-full z-10"
            style={{ background: '#1e293b' }}
          />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-3 shadow-lg">
            <span className="font-semibold text-white">Status Key:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Offline</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Calibrating</span>
            </div>
          </div>
        </div>

        {/* Right Station Details Telemetry Drawer */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 p-5 shadow-sm flex flex-col justify-between h-[560px] overflow-y-auto">
          {activeStation ? (
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                      {activeStation.stationCode}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {activeStation.stationName}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeStation.status === 'Online'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : activeStation.status === 'Offline'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {activeStation.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{activeStation.location}</span>
                </p>
              </div>

              {/* Geographic Coordinates & Commissioning */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">GPS Coordinates</span>
                  <div className="font-mono text-slate-200 mt-0.5">
                    {activeStation.coordinates.lat.toFixed(4)}° N, {activeStation.coordinates.lng.toFixed(4)}° E
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Elevation MSL</span>
                  <div className="font-mono text-slate-200 mt-0.5">
                    {activeStation.elevation} meters
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Battery / Power</span>
                  <div className="font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Battery className="w-3 h-3" />
                    <span>{activeStation.batteryLevel}% (Solar OK)</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Last Contact</span>
                  <div className="font-mono text-slate-300 mt-0.5">
                    {new Date(activeStation.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Attached Sensor Channels (Slide 4, 8) */}
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Attached Meteorological Sensors</span>
                  <span className="text-slate-400 text-[10px]">
                    {activeStation.sensors?.length ?? 0} channels
                  </span>
                </h4>

                <div className="space-y-2">
                  {activeStation.sensors && activeStation.sensors.length > 0 ? (
                    activeStation.sensors.map((sensor) => (
                      <div
                        key={sensor._id}
                        className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-slate-200">{sensor.sensorType}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sensor.model}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-emerald-300 text-sm">
                            {activeStation.status === 'Offline'
                              ? '--'
                              : `${sensor.currentReading} ${sensor.unit}`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Health: <span className="text-slate-300 font-semibold">{sensor.healthScore}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-3 text-center">
                      No sensors configured for this station.
                    </div>
                  )}
                </div>
              </div>

              {/* Station Contact & Firmware */}
              <div className="text-[11px] text-slate-400 border-t border-slate-700/40 pt-2 space-y-1">
                <div>
                  <span className="text-slate-500">Contact Officer:</span>{' '}
                  <span className="text-slate-300">{activeStation.contactPerson}</span>
                </div>
                <div>
                  <span className="text-slate-500">Firmware:</span>{' '}
                  <span className="text-slate-300 font-mono">{activeStation.firmwareVersion}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center p-4">
              <MapPin className="w-8 h-8 text-slate-600 mb-2" />
              <span>Select any weather station from the map to inspect its real-time sensor array and health state.</span>
            </div>
          )}

          {activeStation && (
            <div className="mt-4 pt-3 border-t border-slate-700/60">
              <button
                onClick={() => handleCenterOnStation(activeStation)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Center Map On Station</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
