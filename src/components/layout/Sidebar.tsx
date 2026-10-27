import React from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  ClipboardList, 
  Navigation, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Radio,
  Leaf,
  HardHat,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { canAccessPage } from '../../utils/rbac';

export type PageId = 
  | 'overview' 
  | 'bins' 
  | 'requests' 
  | 'routes' 
  | 'fleet' 
  | 'analytics' 
  | 'notifications' 
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenTelemetryModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onOpenTelemetryModal
}) => {
  const { bins, requests, alerts, currentUser } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isManager = currentUser.role === 'manager';

  // For worker, calculate only tasks assigned to them or their route
  const criticalBinsCount = bins.filter(b => b.fillLevel >= 90).length;
  const myPendingRequestsCount = isWorker
    ? requests.filter(r => (r.status === 'Pending' || r.status === 'Assigned' || r.status === 'In Progress') && (r.assignedWorkerName === currentUser.name || r.assignedWorkerId === currentUser.id)).length
    : requests.filter(r => r.status === 'Pending' || r.status === 'Assigned').length;
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const rawNavItems: { id: PageId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { 
      id: 'overview', 
      label: isWorker ? 'My Shift & Tasks' : isManager ? 'Dispatch Center' : 'Executive Overview', 
      icon: isWorker ? <HardHat className="w-5 h-5 shrink-0" /> : <LayoutDashboard className="w-5 h-5 shrink-0" /> 
    },
    { 
      id: 'bins', 
      label: isWorker ? 'Nearby Smart Bins' : 'Smart Bins', 
      icon: <Trash2 className="w-5 h-5 shrink-0" />, 
      badge: criticalBinsCount > 0 ? criticalBinsCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { 
      id: 'requests', 
      label: isWorker ? 'Assigned Pickups' : 'Collection Requests', 
      icon: <ClipboardList className="w-5 h-5 shrink-0" />,
      badge: myPendingRequestsCount > 0 ? myPendingRequestsCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      id: 'routes', 
      label: isWorker ? 'My Route & Checklist' : 'Collection Routes', 
      icon: <Navigation className="w-5 h-5 shrink-0" /> 
    },
    { 
      id: 'fleet', 
      label: 'Workers & Fleet', 
      icon: <Users className="w-5 h-5 shrink-0" />
    },
    { 
      id: 'analytics', 
      label: 'Reports & Analytics', 
      icon: <BarChart3 className="w-5 h-5 shrink-0" /> 
    },
    { 
      id: 'notifications', 
      label: isWorker ? 'Dispatch Alerts' : 'Notifications', 
      icon: <Bell className="w-5 h-5 shrink-0" />, 
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse'
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: <Settings className="w-5 h-5 shrink-0" /> 
    }
  ];

  // Filter items strictly by RBAC permissions
  const navItems = rawNavItems.filter(item => canAccessPage(currentUser.role, item.id));

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-ecogreen-dark flex items-center justify-center text-white shadow-md shadow-emerald-950 shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  EcoTrack
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">v1.0</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
                  Digital Waste Management
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-ecogreen-dark flex items-center justify-center text-white shadow-md shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Role Badge */}
        {!collapsed && (
          <div className="px-4 py-3 mx-3 my-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              {isWorker ? (
                <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
              ) : isManager ? (
                <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div className="truncate">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role Active</div>
                <div className="text-xs font-semibold text-white capitalize truncate">
                  {currentUser.role} console
                </div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${isWorker ? 'bg-amber-400' : isManager ? 'bg-cyan-400' : 'bg-emerald-400'} animate-pulse`} />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}

                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed dot badge */}
                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom IoT Lab Trigger */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onOpenTelemetryModal}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-800 border border-emerald-800/50 text-emerald-300 hover:border-emerald-500 transition-all text-xs font-semibold ${
            collapsed ? 'justify-center p-2' : ''
          }`}
          title="Open IoT Sensor Lab (ESP32 / Ultrasonic Simulation)"
        >
          <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          {!collapsed && (
            <div className="text-left truncate">
              <div>IoT Sensor Lab</div>
              <div className="text-[10px] text-emerald-400/80 font-normal">
                {isWorker ? 'Field Hardware Spec' : 'ESP32 & Simulator'}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
