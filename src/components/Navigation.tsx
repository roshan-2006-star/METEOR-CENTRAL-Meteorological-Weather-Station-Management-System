import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Code2,
} from 'lucide-react';

export type TabId = 'dashboard' | 'map' | 'stations' | 'trends' | 'maintenance' | 'audit' | 'architecture';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingTasksCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
}) => {
  interface NavItem {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const tabs: NavItem[] = [
    { id: 'dashboard', label: 'Central Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Regional Station Map', icon: MapPin },
    { id: 'stations', label: 'Station & Sensor Registry', icon: Cpu },
    { id: 'trends', label: 'Weather Trends & Analysis', icon: TrendingUp },
    {
      id: 'maintenance',
      label: 'Maintenance & Calibration',
      icon: Wrench,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    { id: 'audit', label: 'Audit Trail & Compliance', icon: ShieldCheck },
    { id: 'architecture', label: 'System Architecture & Specs', icon: Code2 },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-4">
      <div className="max-w-7xl mx-auto flex items-center overflow-x-auto no-scrollbar gap-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabId)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
