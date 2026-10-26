import React, { useState } from 'react';
import {
  Zap,
  Activity,
  AlertTriangle,
  Radio,
  Send,
  RefreshCw,
  CheckCircle,
  Sliders,
  Flame,
  Wind,
} from 'lucide-react';
import { WeatherStation, Sensor } from '../types';

interface IotSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: WeatherStation[];
  onTriggerTick: () => void;
  onInjectFault: (faultType: string, stationId?: string) => Promise<void>;
  onPushReading: (reading: { stationId: string; parameter: string; value: number; unit: string }) => Promise<void>;
}

export const IotSimulatorModal: React.FC<IotSimulatorModalProps> = ({
  isOpen,
  onClose,
  stations,
  onTriggerTick,
  onInjectFault,
  onPushReading,
}) => {
  const [selectedStationId, setSelectedStationId] = useState(stations[0]?._id || '');
  const [customParam, setCustomParam] = useState('Thermometer');
  const [customValue, setCustomValue] = useState('32.5');
  const [customUnit, setCustomUnit] = useState('°C');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePushCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onPushReading({
        stationId: selectedStationId,
        parameter: customParam,
        value: Number(customValue),
        unit: customUnit,
      });
      setFeedbackMsg(`Packet delivered to /api/readings: ${customValue} ${customUnit}`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg('Failed to push reading: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFault = async (faultType: string) => {
    setIsSubmitting(true);
    try {
      await onInjectFault(faultType, selectedStationId);
      setFeedbackMsg(`Fault injected (${faultType}). Alert engine evaluating.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg('Fault injection error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                IoT Sensor Gateway & Fault Injection Lab
              </h3>
              <p className="text-xs text-slate-400">
                Simulate realistic edge hardware failures, drift anomalies, and telemetry packets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Station Selection */}
        <div className="text-xs">
          <label className="block text-slate-300 font-medium mb-1">Target Station Node</label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {stations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.stationCode} - {s.stationName} ({s.status})
              </option>
            ))}
          </select>
        </div>

        {/* 1-Click Fault Injections (Directly demonstrating Slide 4 & 7 disadvantages: Drift, Dead Sensor, Offline) */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Simulate PPT Failure Modes (Slide 4 & 7):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleFault('drift')}
              disabled={isSubmitting}
              className="p-3 bg-slate-900 hover:bg-slate-750 border border-amber-800/60 rounded-lg text-left text-xs transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span>Sensor Drift (+18%)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Simulate mechanical wear causing reading to drift out of calibration band.
              </p>
            </button>

            <button
              onClick={() => handleFault('temp_surge')}
              disabled={isSubmitting}
              className="p-3 bg-slate-900 hover:bg-slate-750 border border-rose-800/60 rounded-lg text-left text-xs transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Heat Spike (58.4°C)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Inject out-of-tolerance reading exceeding RTD threshold to trigger alert.
              </p>
            </button>

            <button
              onClick={() => handleFault('station_offline')}
              disabled={isSubmitting}
              className="p-3 bg-slate-900 hover:bg-slate-750 border border-rose-900/60 rounded-lg text-left text-xs transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Sever Telemetry</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Simulate solar charger drain and dropped heartbeat (&gt;30 min offline).
              </p>
            </button>
          </div>
        </div>

        {/* Custom Reading Push to /api/readings */}
        <form onSubmit={handlePushCustom} className="space-y-3 pt-3 border-t border-slate-700 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Manual IoT JSON Push (Slide 13 <code className="font-mono text-emerald-400">POST /api/readings</code>):
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Channel</label>
              <select
                value={customParam}
                onChange={(e) => {
                  setCustomParam(e.target.value);
                  if (e.target.value === 'Thermometer') setCustomUnit('°C');
                  else if (e.target.value === 'Hygrometer') setCustomUnit('%');
                  else if (e.target.value === 'Barometer') setCustomUnit('hPa');
                  else if (e.target.value === 'Anemometer') setCustomUnit('km/h');
                  else if (e.target.value === 'Rain Gauge') setCustomUnit('mm/h');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="Thermometer">Thermometer</option>
                <option value="Hygrometer">Hygrometer</option>
                <option value="Barometer">Barometer</option>
                <option value="Anemometer">Anemometer</option>
                <option value="Rain Gauge">Rain Gauge</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Value</label>
              <input
                type="number"
                step="0.1"
                required
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Unit</label>
              <input
                type="text"
                readOnly
                value={customUnit}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onTriggerTick}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Broadcast Network Multi-Tick</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmit Packet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
