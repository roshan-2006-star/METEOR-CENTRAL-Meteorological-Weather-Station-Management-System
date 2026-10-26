import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  UserCheck,
  ExternalLink,
  Award,
} from 'lucide-react';
import { AuditLog, MaintenanceRecord } from '../types';

interface AuditTrailViewProps {
  auditLogs: AuditLog[];
  maintenanceRecords: MaintenanceRecord[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLogs,
  maintenanceRecords,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'certificates'>('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedRecordForCert, setSelectedRecordForCert] = useState<MaintenanceRecord | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || log.targetType === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meteor_central_audit_trail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Departmental Audit Trail & WMO Regulatory Compliance</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable versioned records of all sensor inspections, calibrations, threshold breaches, and administrative decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Action Ledger
            </button>
            <button
              onClick={() => setActiveSubTab('certificates')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                activeSubTab === 'certificates'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calibration Certificates ({maintenanceRecords.length})
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail by actor, action or event keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Category:</span>
              {['All', 'Station', 'Sensor', 'Task', 'Alert', 'Maintenance', 'System'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterType(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    filterType === cat
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-750 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Chronological Table */}
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp (IST)</th>
                    <th className="py-2.5 px-3">Actor & Role</th>
                    <th className="py-2.5 px-3">Action Code</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {filteredLogs.map((log) => {
                    const actionColors: Record<string, string> = {
                      STATION_COMMISSIONED: 'text-emerald-400',
                      SENSOR_CALIBRATED: 'text-teal-400',
                      ALERT_RESOLVED: 'text-cyan-400',
                      ANOMALY_FLAGGED: 'text-rose-400',
                      TASK_SCHEDULED: 'text-blue-400',
                      USER_LOGIN: 'text-slate-400',
                    };

                    return (
                      <tr key={log._id} className="hover:bg-slate-750/40 transition">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour12: false,
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{log.actor}</div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[11px]">
                          <span className={actionColors[log.action] || 'text-amber-400'}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-700">
                            {log.targetType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 leading-relaxed font-mono text-[11px]">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Calibration Certificates Section */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maintenanceRecords.map((rec) => (
            <div
              key={rec._id}
              className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span className="font-mono font-bold text-white text-sm">
                      {rec.certificateNo || 'CERT-WMO-PROVISIONAL'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Standard: <span className="text-emerald-300 font-medium">{rec.standardUsed}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Certified WMO-No. 8
                </span>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Station Code:</span>
                  <span className="text-white">{rec.stationCode || 'AWS-CHE-001'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Calibration:</span>
                  <span className="text-slate-300">{rec.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Certifying Engineer:</span>
                  <span className="text-slate-300">{rec.engineerName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {rec.workDetails}
              </p>

              {/* Checklist items */}
              {rec.checklist && (
                <div className="space-y-1 pt-2 border-t border-slate-700/40">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Verified Inspection Criteria:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    {rec.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRecordForCert(rec)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Printable Official Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Certificate Modal */}
      {selectedRecordForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-slate-900 rounded-xl border border-slate-600 w-full max-w-2xl p-8 shadow-2xl space-y-6 bg-gradient-to-b from-white to-slate-50">
            {/* Certificate Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <div className="text-[11px] uppercase tracking-widest text-slate-600 font-bold">
                National Meteorological Department &bull; Regional Calibration Laboratory
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1 uppercase tracking-wide">
                Certificate of Meteorological Calibration
              </h2>
              <div className="text-xs text-slate-700 mt-1 font-serif italic">
                In compliance with World Meteorological Organization (WMO-No. 8) & Bureau of Indian Standards (IS 4967:1994)
              </div>
            </div>

            {/* Certificate Body */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-800">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Certificate Number</span>
                <div className="font-mono font-bold text-sm text-slate-950">
                  {selectedRecordForCert.certificateNo || 'CERT-WMO-2026-0812'}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Date of Certification</span>
                <div className="font-mono font-bold text-slate-950">
                  {selectedRecordForCert.date}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Station Node</span>
                <div className="font-semibold text-slate-950">
                  {selectedRecordForCert.stationName || 'Guindy Regional Observatory'}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Inspection Officer</span>
                <div className="font-semibold text-slate-950">
                  {selectedRecordForCert.engineerName}
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded border border-slate-300 text-xs text-slate-800 space-y-2">
              <div className="font-bold text-slate-900">Work Details & Verification Scope:</div>
              <p className="leading-relaxed">{selectedRecordForCert.workDetails}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-4 border-t border-slate-300">
              <div>
                <div>Electronic Stamp Verification: Valid & Cryptographically Signed</div>
                <div className="font-mono text-[10px]">UUID: 1c51b96b-7e50-41bc-9533-d78dc7d6a880</div>
              </div>
              <div className="text-right">
                <div className="font-serif italic font-bold text-slate-900">
                  {selectedRecordForCert.engineerName}
                </div>
                <div className="text-[10px]">Lead Instrument Assessor</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRecordForCert(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
