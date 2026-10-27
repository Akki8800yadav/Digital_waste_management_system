import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SystemAlert, AlertSeverity, AlertType } from '../types';
import { 
  Bell, 
  AlertTriangle, 
  WifiOff, 
  BatteryCharging, 
  Clock, 
  ClipboardList, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
import { PageId } from '../components/layout/Sidebar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface NotificationsPageProps {
  onNavigate: (page: PageId) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { 
    alerts, 
    markAlertRead, 
    markAllAlertsRead, 
    dismissAlert,
    bins,
    requests
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dismissingAlertId, setDismissingAlertId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSearch = 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSev = severityFilter === 'all' || a.severity === severityFilter;
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      const matchRead = 
        readFilter === 'all' || 
        (readFilter === 'unread' && !a.read) || 
        (readFilter === 'read' && a.read);

      return matchSearch && matchSev && matchType && matchRead;
    });
  }, [alerts, searchTerm, severityFilter, typeFilter, readFilter]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'critical_fill':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'offline_sensor':
        return <WifiOff className="w-4 h-4 text-rose-500" />;
      case 'low_battery':
        return <BatteryCharging className="w-4 h-4 text-amber-500" />;
      case 'overdue_collection':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'unassigned_request':
        return <ClipboardList className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            System Alerts & Operational Incident Center
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated alerts derived from IoT ultrasonic thresholds, sensor health, and dispatch SLAs
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAlertsRead()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alert messages..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Alert Types</option>
              <option value="critical_fill">Critical Fill Levels</option>
              <option value="offline_sensor">Offline Sensors</option>
              <option value="low_battery">Low Battery Telemetry</option>
              <option value="unassigned_request">Unassigned Work Orders</option>
            </select>
          </div>

          <div>
            <select
              value={readFilter}
              onChange={e => setReadFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">Read & Unread</option>
              <option value="unread">Unread Only</option>
              <option value="read">Archived / Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !alert.read
                    ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-sm ring-1 ring-rose-500/20'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isCritical 
                      ? 'bg-rose-100 dark:bg-rose-950/60' 
                      : alert.severity === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-950/60'
                      : 'bg-blue-100 dark:bg-blue-950/60'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {alert.title}
                      </h3>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                          : alert.severity === 'warning'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 pt-1">
                      <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                      <span>&bull;</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      {alert.targetId && (
                        <>
                          <span>&bull;</span>
                          <span className="text-ecogreen font-semibold">Target: {alert.targetId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Quick Navigate to Target Bin or Request */}
                  {alert.targetType && (
                    <button
                      onClick={() => {
                        markAlertRead(alert.id);
                        if (alert.targetType === 'bin') onNavigate('bins');
                        else if (alert.targetType === 'request') onNavigate('requests');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      Inspect <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {!alert.read && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setDismissingAlertId(alert.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm">No alerts found</p>
            <p className="text-xs mt-1">There are no operational warnings matching your selected criteria.</p>
          </div>
        )}
      </div>

      {/* Dismiss Confirmation */}
      <ConfirmDialog
        isOpen={dismissingAlertId !== null}
        onClose={() => setDismissingAlertId(null)}
        onConfirm={() => {
          if (dismissingAlertId) dismissAlert(dismissingAlertId);
        }}
        title="Dismiss Alert"
        message="Are you sure you want to permanently clear this alert from the active incident log?"
        confirmLabel="Dismiss"
        isDestructive={false}
      />
    </div>
  );
};
