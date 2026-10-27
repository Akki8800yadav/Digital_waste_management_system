import React from 'react';
import { PriorityLevel, RequestStatus, SensorConnectivity, WasteCategory } from '../../types';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles: Record<PriorityLevel, string> = {
    Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    High: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Critical: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus | 'In Service' | 'Maintenance' | 'Idle' | 'Available' | 'On Route' | 'Off Duty' | 'Scheduled' | 'Draft' }> = ({ status }) => {
  const styles: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Assigned: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    'In Progress': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    'On Route': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    'Off Duty': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    'In Service': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Idle: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Maintenance: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    Draft: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: WasteCategory }> = ({ category }) => {
  const styles: Record<WasteCategory, string> = {
    Organic: 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-800',
    Recyclable: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    General: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Hazardous: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[category]}`}>
      {category}
    </span>
  );
};

export const ConnectivityBadge: React.FC<{ connectivity: SensorConnectivity }> = ({ connectivity }) => {
  const styles: Record<SensorConnectivity, { text: string; dot: string; label: string }> = {
    online: { text: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', label: 'Online' },
    weak: { text: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', label: 'Weak Signal' },
    offline: { text: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', label: 'Offline' }
  };

  const current = styles[connectivity] || styles.online;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${current.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} ${connectivity === 'online' ? 'animate-pulse' : ''}`} />
      {current.label}
    </span>
  );
};
