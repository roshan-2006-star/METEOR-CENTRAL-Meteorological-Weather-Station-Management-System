import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  Radio,
  Sliders,
  Filter,
} from 'lucide-react';
import { Alert, UserRole } from '../types';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onResolveAlert: (alertId: string) => Promise<void>;
  userRole: UserRole;
  onNavigateToMaintenance: () => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
  userRole,
  onNavigateToMaintenance,
}) => {
  const [filterResolved, setFilterResolved] = useState<boolean>(false);

  if (!isOpen) return null;

  const displayAlerts = alerts.filter((a) => a.resolved === filterResolved);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Meteorological Network Alert Center
              </h3>
              <p className="text-xs text-slate-400">
                Automated detection of sensor drift, offline telemetry, and threshold excursions
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

        {/* Filter Toggle */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setFilterResolved(false)}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                !filterResolved ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active / Unresolved ({alerts.filter((a) => !a.resolved).length})
            </button>
            <button
              onClick={() => setFilterResolved(true)}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                filterResolved ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved History ({alerts.filter((a) => a.resolved).length})
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigateToMaintenance();
            }}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Open Maintenance Kanban &rarr;
          </button>
        </div>

        {/* Alert List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {displayAlerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-70" />
              <span>No alerts found matching current filter state.</span>
            </div>
          ) : (
            displayAlerts.map((alt) => {
              const isCrit = alt.severity === 'Critical';
              return (
                <div
                  key={alt._id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    alt.resolved
                      ? 'bg-slate-900/60 border-slate-700/60 text-slate-300'
                      : isCrit
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                      : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{alt.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCrit ? 'bg-rose-900/80 text-rose-200' : 'bg-amber-900/80 text-amber-200'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Station: <span className="text-slate-200 font-semibold">{alt.stationName || 'N/A'}</span>
                        {alt.sensorType && (
                          <span> &bull; Channel: <span className="text-emerald-400">{alt.sensorType}</span></span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {alt.description}
                  </p>

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                    {alt.resolved ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolved by {alt.resolvedBy || 'Meteorologist'}</span>
                      </span>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-slate-400 text-[10px]">
                          Logged to auditable record
                        </span>
                        <button
                          onClick={() => onResolveAlert(alt._id)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
                        >
                          Resolve & Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
