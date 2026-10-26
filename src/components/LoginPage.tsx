import React, { useState } from 'react';
import {
  CloudSun,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
  Key,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@meteor-central.gov.in');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const personas = [
    {
      role: 'admin' as UserRole,
      name: 'Rajesh V. Sharma',
      email: 'admin@meteor-central.gov.in',
      password: 'admin123',
      title: 'Chief Systems Administrator',
      dept: 'Regional Directorate & AWS Control Hub',
      badge: 'Full RBAC Access',
      color: 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300',
    },
    {
      role: 'meteorologist' as UserRole,
      name: 'Dr. Ananya Iyer',
      email: 'ananya.iyer@meteor-central.gov.in',
      password: 'meteo123',
      title: 'Chief Meteorological Scientist',
      dept: 'Climate Analysis & Forecast Division',
      badge: 'Analytical Lead',
      color: 'border-cyan-500/60 bg-cyan-950/20 text-cyan-300',
    },
    {
      role: 'operator' as UserRole,
      name: 'Arun Prakash',
      email: 'arun.prakash@meteor-central.gov.in',
      password: 'field123',
      title: 'Lead Field Instrumentation Engineer',
      dept: 'South Zone Field Tech Unit',
      badge: 'Field Inspections',
      color: 'border-amber-500/60 bg-amber-950/20 text-amber-300',
    },
  ];

  const handleQuickLogin = async (p: typeof personas[0]) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email, password: p.password, role: p.role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected by security gateway');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-800/20 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Banner */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">National Meteorological Department</span>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 hidden sm:inline">Automated Weather Station (AWS) Grid Gateway</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-mono text-[11px]">WMO-No. 8 Standard Certified</span>
          </div>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 z-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & System Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
                <CloudSun className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  CENTRALIZED METEOROLOGICAL NETWORK
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  METEOR-CENTRAL
                </h1>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-200">
                Departmental Weather Station Asset & Telemetry Gateway
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                A MERN-stack platform providing real-time IoT telemetry, geo-tagged station monitoring, automated calibration scheduling, and WMO-No. 8 compliance certification.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Role-Based Access Control:</strong>
                  <div className="text-slate-400 text-[11px]">Separate privileges for Administrator, Meteorologist, and Field Operator.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Continuous IoT Telemetry:</strong>
                  <div className="text-slate-400 text-[11px]">Live temperature, humidity, pressure, wind velocity & rainfall streams.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">WMO & BIS Compliance:</strong>
                  <div className="text-slate-400 text-[11px]">Automated calibration schedules & auditable digital certificates.</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Production Architecture: Node.js &bull; Express &bull; React &bull; MongoDB
            </div>
          </div>

          {/* Right Column: Interactive Login Form & Demo Personas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Station Gateway Sign In</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter departmental credentials or select a preset role identity
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  JWT Secured
                </span>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
                {/* Role Selector Tabs */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Department Role Designation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'admin' as UserRole, label: 'Admin', desc: 'Systems Admin' },
                      { id: 'meteorologist' as UserRole, label: 'Meteorologist', desc: 'Forecast & Trends' },
                      { id: 'operator' as UserRole, label: 'Field Operator', desc: 'Calibration / Tech' },
                    ].map((r) => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(r.id);
                            const match = personas.find((p) => p.role === r.id);
                            if (match) {
                              setEmail(match.email);
                              setPassword(match.password);
                            }
                          }}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold shadow-sm'
                              : 'bg-slate-850/60 border-slate-750 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-semibold text-xs">{r.label}</div>
                          <div className="text-[10px] text-slate-500 truncate">{r.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Department Email or Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@meteor-central.gov.in"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-medium">
                      Security Password / Passcode
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      (Default: admin123 / meteo123 / field123)
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember terminal session</span>
                  </label>
                  <span className="text-slate-500">
                    Restricted Network &bull; Port 3000
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Authorize & Enter Central Gateway</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Role Personas */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quick 1-Click Role Sign In:</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {personas.map((p) => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleQuickLogin(p)}
                      className={`p-2.5 rounded-lg border text-left transition hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${p.color}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-white">{p.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 uppercase">
                            {p.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">{p.title}</div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <span>Sign In as {p.role} &rarr;</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="bg-slate-950/80 border-t border-slate-800 text-slate-500 text-xs py-3 px-4 text-center z-10">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            &copy; 2026 Centralized Meteorological Weather Station System &bull; MERN Full Stack Gateway
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Security Protocol: JWT Bearer &bull; RBAC</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono">WMO-No. 8 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
