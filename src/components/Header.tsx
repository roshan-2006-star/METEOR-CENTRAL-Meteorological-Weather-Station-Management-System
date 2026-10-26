import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  UserCheck,
  Zap,
  Sliders,
  CheckCircle2,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { User, UserRole, Alert } from '../types';

interface HeaderProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  activeAlerts: Alert[];
  onTriggerTick: () => void;
  onOpenSimulator: () => void;
  isSimulating: boolean;
  onOpenAlertsModal: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectRole,
  activeAlerts,
  onTriggerTick,
  onOpenSimulator,
  isSimulating,
  onOpenAlertsModal,
  onLogout,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = activeAlerts.filter((a) => a.severity === 'Critical').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-emerald-900/40 text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">METEOR-CENTRAL</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Centralized Meteorological Weather Station Network (MERN Stack)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300 text-[11px]">
          <span className="text-slate-400">
            Automated Weather Station (AWS) Grid &bull; WMO-No. 8 Standard
          </span>
          <span className="text-emerald-400 font-mono font-medium">Node Telemetry Active</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <CloudSun className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                CENTRALIZED WEATHER STATION MGMT
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                WMO-No. 8 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Sensor Registry &bull; Real-Time Telemetry &bull; Automated Calibration</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{time} IST</span>
          </div>

          {/* IoT Telemetry Trigger */}
          <button
            onClick={onTriggerTick}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs rounded-lg border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Fetch live multi-station IoT sensor observation packet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Stream Telemetry</span>
          </button>

          {/* IoT Anomaly & Fault Injection */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 text-xs rounded-lg border border-indigo-700/60 transition cursor-pointer"
            title="Simulate IoT Drift, Heat Surge or Disconnection"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>IoT Lab / Inject Fault</span>
          </button>

          {/* Active Alerts Bell */}
          <button
            onClick={onOpenAlertsModal}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition cursor-pointer"
            title="View Active Station Alerts"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span>Alerts</span>
            {activeAlerts.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  criticalCount > 0
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Role Switcher (Admin, Meteorologist, Operator - slide 3 & 5) */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:block" />
            <span className="text-[11px] text-slate-400 hidden lg:inline mr-1">Role:</span>
            {(['admin', 'meteorologist', 'operator'] as UserRole[]).map((r) => {
              const isActive = currentUser.role === r;
              const labels: Record<UserRole, string> = {
                admin: 'Admin',
                meteorologist: 'Meteorologist',
                operator: 'Operator',
              };
              return (
                <button
                  key={r}
                  onClick={() => onSelectRole(r)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/80 text-slate-400 text-xs rounded-lg border border-slate-700 transition cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
