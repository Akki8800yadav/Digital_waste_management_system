import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  Cpu, 
  Play, 
  Pause, 
  ChevronDown, 
  Check, 
  ExternalLink,
  Shield,
  Menu
} from 'lucide-react';
import { PageId } from './Sidebar';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenTelemetryModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenTelemetryModal,
  onToggleMobileSidebar
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    alerts, 
    markAlertRead, 
    markAllAlertsRead, 
    settings, 
    updateSettings,
    simulationActive,
    toggleSimulation,
    bins,
    requests
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const alertsMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter(a => !a.read);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(e.target as Node)) {
        setShowAlertsMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
    overview: { title: 'Operational Command Center', subtitle: 'Live IoT telemetry, collection pipeline, and smart city waste KPIs' },
    bins: { title: 'Smart Bin Management', subtitle: 'Ultrasonic depth sensing, battery states, and fill-level monitoring' },
    requests: { title: 'Collection Dispatch & Requests', subtitle: 'Automated dispatching, work orders, and field execution logs' },
    routes: { title: 'Collection Route Planning', subtitle: 'Geographic waypoints, stop sequencing, and route verification' },
    fleet: { title: 'Field Crew & Fleet Management', subtitle: 'Resource assignments, compactor trucks, and driver availability' },
    analytics: { title: 'Waste Reports & Analytics', subtitle: 'Recycling diversion ratios, collection efficiency, and zone metrics' },
    notifications: { title: 'System Alerts & Event Logs', subtitle: 'Critical fill warnings, sensor disconnects, and battery health' },
    settings: { title: 'System & IoT Configuration', subtitle: 'Threshold calibrators, zone definitions, and demo resets' }
  };

  // Search matches
  const matchedBins = searchQuery.trim() ? bins.filter(b => 
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4) : [];

  const matchedRequests = searchQuery.trim() ? requests.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.binName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3) : [];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            {pageTitles[currentPage]?.title || 'EcoTrack'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {pageTitles[currentPage]?.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden lg:block">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs w-64 focus-within:w-80 focus-within:ring-2 focus-within:ring-ecogreen transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search bins, requests, zones..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Quick Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full right-0 mt-2 w-96 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3 z-50 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Bins Matches</div>
              {matchedBins.length > 0 ? (
                matchedBins.map(bin => (
                  <button
                    key={bin.id}
                    onClick={() => {
                      onNavigate('bins');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{bin.id} — {bin.name}</div>
                      <div className="text-[11px] text-slate-400">{bin.address}</div>
                    </div>
                    <span className="font-mono text-ecogreen font-bold">{bin.fillLevel}%</span>
                  </button>
                ))
              ) : (
                <div className="text-slate-400 px-2 py-1">No matching smart bins</div>
              )}

              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mt-3 mb-1">Request Matches</div>
              {matchedRequests.length > 0 ? (
                matchedRequests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => {
                      onNavigate('requests');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{req.id}</div>
                      <div className="text-[11px] text-slate-400">{req.binName}</div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600">{req.status}</span>
                  </button>
                ))
              ) : (
                <div className="text-slate-400 px-2 py-1">No matching collection requests</div>
              )}
            </div>
          )}
        </div>

        {/* IoT Simulation Quick Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => onOpenTelemetryModal()}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium hover:text-ecogreen transition-colors"
            title="Inspect Sensor Telemetry & ESP32 details"
          >
            <Cpu className="w-3.5 h-3.5 text-ecogreen" />
            <span className="hidden sm:inline">IoT Sim:</span>
            <span className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          </button>
          <button
            onClick={() => toggleSimulation()}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            title={simulationActive ? 'Pause IoT Background Simulation' : 'Start IoT Simulation'}
          >
            {simulationActive ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Popover Bell */}
        <div ref={alertsMenuRef} className="relative">
          <button
            onClick={() => setShowAlertsMenu(prev => !prev)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Alerts</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {unreadAlerts.length} unread
                  </span>
                </div>
                {unreadAlerts.length > 0 && (
                  <button
                    onClick={() => markAllAlertsRead()}
                    className="text-xs text-ecogreen dark:text-ecogreen-accent font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto my-2">
                {alerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      markAlertRead(alert.id);
                      if (alert.targetType === 'bin') onNavigate('bins');
                      else if (alert.targetType === 'request') onNavigate('requests');
                      setShowAlertsMenu(false);
                    }}
                    className={`py-3 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                      !alert.read ? 'bg-rose-50/40 dark:bg-rose-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      alert.severity === 'critical' ? 'bg-rose-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{alert.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{alert.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setShowAlertsMenu(false);
                  }}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-ecogreen flex items-center justify-center gap-1 w-full py-1"
                >
                  View All Alerts Center <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile Menu */}
        <div ref={roleMenuRef} className="relative">
          <button
            onClick={() => setShowRoleMenu(prev => !prev)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 transition-all text-xs"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-lg object-cover ring-1 ring-ecogreen/50"
            />
            <div className="text-left hidden md:block">
              <div className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[110px] leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-ecogreen dark:text-ecogreen-accent font-semibold uppercase tracking-wider">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-ecogreen" />
                  Role Simulation Switcher
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Switch personas to test role-specific workflows
                </p>
              </div>

              <div className="space-y-1">
                {availableUsers.map(user => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div>{user.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal uppercase">{user.role}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 text-[10px] text-slate-400">
                Demo Auth Mode Active &bull; No passwords required
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
