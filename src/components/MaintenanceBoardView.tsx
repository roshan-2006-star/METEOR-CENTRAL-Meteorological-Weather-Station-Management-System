import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Calendar,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  ListTodo,
} from 'lucide-react';
import { MaintenanceTask, WeatherStation, Sensor, UserRole } from '../types';

interface MaintenanceBoardViewProps {
  tasks: MaintenanceTask[];
  stations: WeatherStation[];
  sensors: Sensor[];
  onCreateTask: (taskData: any) => Promise<void>;
  onUpdateTask: (taskId: string, updateData: any) => Promise<void>;
  userRole: UserRole;
}

export const MaintenanceBoardView: React.FC<MaintenanceBoardViewProps> = ({
  tasks,
  stations,
  sensors,
  onCreateTask,
  onUpdateTask,
  userRole,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTaskForModal, setActiveTaskForModal] = useState<MaintenanceTask | null>(null);

  // New Task State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    stationId: stations[0]?._id || '',
    sensorId: '',
    type: 'Calibration',
    priority: 'Medium',
    assignedTo: 'Arun Prakash',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  });

  // Action / Completion Modal State
  const [completionForm, setCompletionForm] = useState({
    status: 'Completed',
    resolutionNotes: 'Completed instrument inspection and physical calibration against portable standard. Compliant with WMO-No. 8.',
    certifyWmo: true,
  });

  const columns: { id: MaintenanceTask['status']; label: string; color: string }[] = [
    { id: 'Pending', label: 'Scheduled / Pending', color: 'border-slate-700 bg-slate-900/40' },
    { id: 'In Progress', label: 'In Field / In Progress', color: 'border-blue-900/60 bg-blue-950/20' },
    { id: 'Under Review', label: 'Quality Verification', color: 'border-amber-900/60 bg-amber-950/20' },
    { id: 'Completed', label: 'Completed & Certified', color: 'border-emerald-900/60 bg-emerald-950/20' },
  ];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.stationId) return;

    await onCreateTask({
      ...newTask,
      sensorId: newTask.sensorId || undefined,
    });

    setShowCreateModal(false);
    setNewTask({
      title: '',
      description: '',
      stationId: stations[0]?._id || '',
      sensorId: '',
      type: 'Calibration',
      priority: 'Medium',
      assignedTo: 'Arun Prakash',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    });
  };

  const handleUpdateStatus = async (task: MaintenanceTask, newStatus: MaintenanceTask['status']) => {
    if (newStatus === 'Completed') {
      setActiveTaskForModal(task);
    } else {
      await onUpdateTask(task._id, { status: newStatus });
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskForModal) return;

    await onUpdateTask(activeTaskForModal._id, {
      status: 'Completed',
      resolutionNotes: completionForm.resolutionNotes,
      complianceCertId: completionForm.certifyWmo
        ? `CERT-WMO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        : undefined,
    });

    setActiveTaskForModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <span>Station Maintenance & Calibration Workflow Board</span>
          </h2>
          <p className="text-xs text-slate-400">
            Lifecycle tracking for automatic weather station servicing, sensor recalibration, and regulatory compliance.
          </p>
        </div>

        {/* Schedule Task Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-xl border ${col.color} p-3.5 flex flex-col min-h-[500px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    No tasks in this stage
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'Completed';

                    const priorityStyles: Record<string, string> = {
                      Critical: 'bg-rose-950/60 text-rose-300 border-rose-800/80',
                      High: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
                      Medium: 'bg-blue-950/60 text-blue-300 border-blue-800/80',
                      Low: 'bg-slate-800 text-slate-300 border-slate-700',
                    };

                    return (
                      <div
                        key={task._id}
                        className="bg-slate-800/90 rounded-lg border border-slate-700 p-3 shadow-md hover:border-slate-600 transition space-y-2 text-xs"
                      >
                        {/* Task Priority & Type */}
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              priorityStyles[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {task.type}
                          </span>
                        </div>

                        {/* Title & Station */}
                        <div>
                          <h4 className="font-semibold text-white leading-snug">
                            {task.title}
                          </h4>
                          <div className="text-[11px] text-emerald-400 font-medium mt-1">
                            {task.stationName} {task.stationCode ? `(${task.stationCode})` : ''}
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Certificate Badge if Completed */}
                        {task.complianceCertId && (
                          <div className="bg-emerald-950/60 p-1.5 rounded border border-emerald-800/80 text-[10px] text-emerald-300 flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{task.complianceCertId}</span>
                          </div>
                        )}

                        {/* Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-500" />
                            <span>{task.assignedTo}</span>
                          </span>
                          <span className={`font-mono ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                            {task.dueDate}
                          </span>
                        </div>

                        {/* Stage Progression Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-1 text-[11px]">
                          {col.id === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(task, 'In Progress')}
                              className="w-full py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded font-medium border border-blue-600/40 transition cursor-pointer"
                            >
                              Dispatch Field Crew &rarr;
                            </button>
                          )}
                          {col.id === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateStatus(task, 'Under Review')}
                              className="w-full py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded font-medium border border-amber-600/40 transition cursor-pointer"
                            >
                              Submit for Review &rarr;
                            </button>
                          )}
                          {col.id === 'Under Review' && (
                            <button
                              onClick={() => setActiveTaskForModal(task)}
                              className="w-full py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded font-semibold border border-emerald-600/40 transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Certify & Sign Off &rarr;</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Schedule Maintenance or Calibration Task</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultrasonic Anemometer Zero-Wind Chamber Recalibration"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Weather Station</label>
                  <select
                    value={newTask.stationId}
                    onChange={(e) => setNewTask({ ...newTask, stationId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {stations.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.stationCode} - {s.stationName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Task Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Calibration">Sensor Calibration</option>
                    <option value="Routine Inspection">Routine Inspection</option>
                    <option value="Rain Gauge Desilting">Rain Gauge Desilting</option>
                    <option value="Anemometer Cleaning">Anemometer Cleaning</option>
                    <option value="Sensor Repair">Sensor Repair</option>
                    <option value="Offline Investigation">Offline Investigation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Field Engineer / Technician</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Arun Prakash">Arun Prakash (Field Operator)</option>
                  <option value="S. Basha">S. Basha (Senior Instrument Tech)</option>
                  <option value="Rajesh V. Sharma">Rajesh V. Sharma (Lead Engineer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Instructions / Detailed Work Scope</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="e.g. Inspect solar charger output, test grounding resistance < 2 ohms, run 3-point calibration curve."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Task & Issue WMO Certificate Modal */}
      {activeTaskForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Sign Off Maintenance & Generate Certificate</span>
              </h3>
              <button
                onClick={() => setActiveTaskForModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1">
              <div className="font-semibold text-white">{activeTaskForModal.title}</div>
              <div className="text-slate-400">
                Station: <span className="text-slate-200">{activeTaskForModal.stationName}</span>
              </div>
              <div className="text-slate-400">
                Type: <span className="text-slate-200">{activeTaskForModal.type}</span>
              </div>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Field Work Verification Summary</label>
                <textarea
                  rows={3}
                  required
                  value={completionForm.resolutionNotes}
                  onChange={(e) => setCompletionForm({ ...completionForm, resolutionNotes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wmoCert"
                  checked={completionForm.certifyWmo}
                  onChange={(e) => setCompletionForm({ ...completionForm, certifyWmo: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <label htmlFor="wmoCert" className="text-slate-300 font-medium cursor-pointer">
                  Issue Digital WMO-No. 8 & BIS IS 4967 Compliance Certificate
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTaskForModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md"
                >
                  Complete Task & Log to Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
