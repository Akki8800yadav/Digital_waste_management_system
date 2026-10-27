import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { 
  Trash2, 
  AlertTriangle, 
  ClipboardList, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Calendar, 
  MapPin, 
  Activity,
  ArrowRight,
  WifiOff,
  Truck,
  HardHat,
  UserCheck,
  BatteryCharging,
  DollarSign,
  ShieldAlert,
  Navigation,
  CheckSquare,
  Square,
  Play
} from 'lucide-react';
import { PageId } from '../components/layout/Sidebar';
import { PriorityBadge, CategoryBadge, StatusBadge } from '../components/common/Badge';
import { FillBar } from '../components/common/FillBar';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
  onOpenAddBin: () => void;
  onOpenCreateRequest: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  onOpenAddBin,
  onOpenCreateRequest
}) => {
  const { 
    bins, 
    requests, 
    routes, 
    alerts, 
    settings, 
    currentUser, 
    workers, 
    vehicles,
    toggleRouteStop,
    updateRequestStatus,
    emptyBin,
    updateWorker
  } = useApp();

  const [activityRange, setActivityRange] = useState<'7d' | '30d' | '90d'>('7d');

  const isWorker = currentUser.role === 'worker';
  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  // -------------------------------------------------------------
  // WORKER SPECIFIC DATA (Elena Rostova or current logged-in worker)
  // -------------------------------------------------------------
  const workerProfile = workers.find(w => w.name === currentUser.name || w.id === currentUser.id) || workers[0];
  const assignedRoute = routes.find(r => r.driverId === workerProfile.id || r.driverName === workerProfile.name) || routes[0];
  const assignedVehicle = vehicles.find(v => v.assignedWorkerId === workerProfile.id || v.id === assignedRoute?.vehicleId) || vehicles[0];
  
  // Worker's assigned requests
  const myRequests = requests.filter(r => 
    r.assignedWorkerId === workerProfile.id || 
    r.assignedWorkerName === workerProfile.name ||
    (r.zone === workerProfile.zone && r.status === 'Pending')
  );
  const myCompletedRequests = myRequests.filter(r => r.status === 'Completed').length;
  const myPendingRequests = myRequests.filter(r => r.status === 'Pending' || r.status === 'Assigned' || r.status === 'In Progress').length;

  // Worker route progress
  const routeStops = assignedRoute?.stops || [];
  const completedStops = routeStops.filter(s => s.completed).length;
  const totalStops = routeStops.length;
  const routeProgressPct = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
  const nextPendingStop = routeStops.find(s => !s.completed);

  // Worker zone smart bins requiring collection
  const workerZoneBins = bins
    .filter(b => b.zone === workerProfile.zone && b.fillLevel >= 75)
    .sort((a, b) => b.fillLevel - a.fillLevel);

  // -------------------------------------------------------------
  // ADMIN & MANAGER AGGREGATED METRICS
  // -------------------------------------------------------------
  const totalBins = bins.length;
  const requiringCollection = bins.filter(b => b.fillLevel >= settings.highThreshold).length;
  const criticalCount = bins.filter(b => b.fillLevel >= settings.criticalThreshold).length;
  const offlineCount = bins.filter(b => b.connectivity === 'offline').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const completedToday = requests.filter(r => r.status === 'Completed').length;
  const totalActiveRequests = requests.length;
  const completionRate = totalActiveRequests > 0 
    ? Math.round((completedToday / totalActiveRequests) * 100) 
    : 100;

  // Waste category composition
  const categoryCounts = bins.reduce((acc, bin) => {
    acc[bin.category] = (acc[bin.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Zone breakdown
  const zoneSummary = settings.zones.map(zone => {
    const zoneBins = bins.filter(b => b.zone === zone);
    const zoneReqs = requests.filter(r => r.zone === zone && (r.status === 'Pending' || r.status === 'In Progress'));
    const avgFill = zoneBins.length > 0 
      ? Math.round(zoneBins.reduce((sum, b) => sum + b.fillLevel, 0) / zoneBins.length) 
      : 0;
    return {
      zone,
      total: zoneBins.length,
      avgFill,
      activeReqs: zoneReqs.length
    };
  });

  const activityData = activityRange === '7d' 
    ? [
        { label: 'Mon', completed: 18, pending: 3 },
        { label: 'Tue', completed: 22, pending: 4 },
        { label: 'Wed', completed: 19, pending: 2 },
        { label: 'Thu', completed: 25, pending: 5 },
        { label: 'Fri', completed: 28, pending: 3 },
        { label: 'Sat', completed: 15, pending: 2 },
        { label: 'Today', completed: completedToday + 12, pending: pendingRequests }
      ]
    : activityRange === '30d'
    ? [
        { label: 'W1', completed: 110, pending: 15 },
        { label: 'W2', completed: 135, pending: 18 },
        { label: 'W3', completed: 128, pending: 12 },
        { label: 'W4', completed: completedToday + 90, pending: pendingRequests + 10 }
      ]
    : [
        { label: 'Month -2', completed: 480, pending: 55 },
        { label: 'Last Month', completed: 520, pending: 42 },
        { label: 'This Month', completed: 390, pending: 35 }
      ];

  const maxVal = Math.max(...activityData.map(d => d.completed + d.pending), 30);

  // =========================================================================
  // VIEW 1: WORKER SHIFT CONSOLE (Field Execution, NO secret data)
  // =========================================================================
  if (isWorker) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Worker Shift Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-ecogreen-dark to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg border border-emerald-900 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <HardHat className="w-4 h-4 text-amber-400" />
                Field Operations Shift Active &bull; {workerProfile.name} ({workerProfile.id})
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                My Shift & Route Waypoints
              </h2>
              <p className="text-slate-300 text-xs md:text-sm">
                Assigned Zone: <strong>{workerProfile.zone}</strong> &bull; Vehicle: <strong>{assignedVehicle.regNumber} ({assignedVehicle.type})</strong>
              </p>
            </div>

            {/* Quick Shift Status Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Duty Status:</span>
              <select
                value={workerProfile.availability}
                onChange={e => updateWorker(workerProfile.id, { availability: e.target.value as any })}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-white text-slate-900 border-none shadow-md focus:ring-2 focus:ring-ecogreen"
              >
                <option value="On Route">🚚 On Route</option>
                <option value="Available">🟢 Available</option>
                <option value="Off Duty">⚪ Off Duty</option>
              </select>
            </div>
          </div>
        </div>

        {/* Worker Key Shift Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Route Progress"
            value={`${completedStops} / ${totalStops} stops`}
            subtitle={assignedRoute ? assignedRoute.name : 'No route assigned'}
            icon={<Navigation className="w-5 h-5" />}
            trend={{ value: `${routeProgressPct}%`, isPositive: true, label: 'done' }}
            onClick={() => onNavigate('routes')}
          />
          <StatCard
            title="My Pending Work Orders"
            value={myPendingRequests}
            subtitle="Pickups in queue"
            icon={<ClipboardList className="w-5 h-5" />}
            variant={myPendingRequests > 0 ? 'warning' : 'default'}
            onClick={() => onNavigate('requests')}
          />
          <StatCard
            title="Truck Load & Energy"
            value={`${assignedVehicle.currentLoadKg} kg`}
            subtitle={`${assignedVehicle.fuelBatteryPct}% battery/fuel remaining`}
            icon={<BatteryCharging className="w-5 h-5" />}
            variant={assignedVehicle.fuelBatteryPct <= 30 ? 'warning' : 'success'}
          />
          <StatCard
            title="My Pickups Completed"
            value={workerProfile.completedCollections}
            subtitle="Lifetime verified collections"
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="success"
          />
        </div>

        {/* Next Urgent Stop Callout */}
        {nextPendingStop && assignedRoute ? (
          <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                  Next Waypoint Destination
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {nextPendingStop.binName} ({nextPendingStop.fillLevel}% Full)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {nextPendingStop.address} &bull; Category: <CategoryBadge category={nextPendingStop.category} />
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  toggleRouteStop(assignedRoute.id, nextPendingStop.id);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Emptied & Complete Stop
              </button>
              <button
                onClick={() => onNavigate('routes')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                View on Map
              </button>
            </div>
          </div>
        ) : null}

        {/* Two Column Grid: My Route Stops Checklist & My Active Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stops Checklist */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-ecogreen" />
                  My Collection Route Stops ({assignedRoute?.name || 'Assigned Run'})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check off stops as you complete physical collections
                </p>
              </div>
              <button
                onClick={() => onNavigate('routes')}
                className="text-xs font-semibold text-ecogreen hover:underline flex items-center gap-1"
              >
                Full Route Map &rarr;
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {routeStops.map((stop, i) => (
                <div
                  key={stop.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    stop.completed 
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleRouteStop(assignedRoute.id, stop.id)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {stop.completed ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        #{i + 1} &bull; {stop.binName}
                      </div>
                      <div className="text-[11px] text-slate-400">{stop.address}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    stop.fillLevel >= 90 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {stop.fillLevel}% full
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* High Priority Bins in Worker's Zone */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-ecogreen" />
                  Urgent Bins in My District ({workerProfile.zone})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bins needing collection in your assigned sector
                </p>
              </div>
              <button
                onClick={() => onNavigate('bins')}
                className="text-xs font-semibold text-ecogreen hover:underline flex items-center gap-1"
              >
                District Bins &rarr;
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {workerZoneBins.length > 0 ? (
                workerZoneBins.map(bin => (
                  <div
                    key={bin.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>{bin.id}</span>
                        <span>&bull;</span>
                        <span className="truncate max-w-[160px]">{bin.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{bin.address}</div>
                      <div className="mt-1.5 w-36">
                        <FillBar fillLevel={bin.fillLevel} size="sm" showLabel={false} />
                      </div>
                    </div>

                    <button
                      onClick={() => emptyBin(bin.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark shadow-sm transition-colors"
                    >
                      Clear Bin
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  All smart bins in {workerProfile.zone} are currently within safe fill limits.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Worker Privacy Note */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] flex items-center justify-between">
          <span>Worker Field Role: Confidential city budgets, salary details, and system API keys are restricted to administrators.</span>
          <span className="font-mono text-emerald-600 font-bold">RBAC Mode: Worker Active</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2 & 3: MANAGER / ADMIN EXECUTIVE DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-ecogreen-deep to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-950">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              {isAdmin ? 'Executive Smart-City Command' : 'Municipal Dispatch Command'} &bull; {settings.orgName}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isAdmin ? 'City-Wide Waste Infrastructure' : 'Collection Operations & Dispatch Console'}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              {isAdmin
                ? `Overseeing ${totalBins} smart bins, fleet telemetry, sustainability budgets, and municipal recycling ratios.`
                : `Managing daily dispatch schedules, driver allocations, and route completion for ${totalBins} active sensor nodes.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={onOpenAddBin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-md hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                Register Smart Bin
              </button>
            )}
            <button
              onClick={onOpenCreateRequest}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md hover:scale-[1.02]"
            >
              <ClipboardList className="w-4 h-4" />
              New Collection Request
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Monitored Bins"
          value={totalBins}
          subtitle="All municipal zones"
          icon={<Trash2 className="w-5 h-5" />}
          trend={{ value: '100%', isPositive: true, label: 'mapped' }}
          onClick={() => onNavigate('bins')}
        />
        <StatCard
          title="Need Collection"
          value={requiringCollection}
          subtitle={`Fill >= ${settings.highThreshold}%`}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={requiringCollection > 0 ? 'warning' : 'default'}
          onClick={() => onNavigate('bins')}
        />
        <StatCard
          title="Critical / Offline"
          value={`${criticalCount} / ${offlineCount}`}
          subtitle="Immediate dispatch"
          icon={<WifiOff className="w-5 h-5" />}
          variant={criticalCount > 0 || offlineCount > 0 ? 'critical' : 'default'}
          onClick={() => onNavigate('notifications')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="Awaiting driver pickup"
          icon={<ClipboardList className="w-5 h-5" />}
          onClick={() => onNavigate('requests')}
        />
        <StatCard
          title="Collected Today"
          value={completedToday}
          subtitle="Reset & emptied"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
          onClick={() => onNavigate('requests')}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle="Shift operational target"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: '+4.2%', isPositive: true, label: 'vs yesterday' }}
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* ADMIN EXCLUSIVE: Financial & Operational Savings Ribbon */}
      {isAdmin && (
        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-600 text-white shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                Executive Financial Intelligence (Admin Only)
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Estimated Fuel & Route Optimization Savings: <span className="text-emerald-600 font-mono font-extrabold">$14,820 / month</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dynamic fill threshold dispatching prevents empty truck runs, reducing diesel expenditure by 31.4%.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              Cost / Ton: $42.50
            </span>
          </div>
        </div>
      )}

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-ecogreen" />
                Waste Collection Activity & Dispatch Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Completed collections compared with pending queue
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              {(['7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setActivityRange(range)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activityRange === range
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
            {activityData.map((item, idx) => {
              const compHeight = Math.max(12, Math.round((item.completed / maxVal) * 190));
              const pendHeight = Math.max(6, Math.round((item.pending / maxVal) * 190));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-ecogreen transition-colors">
                    {item.completed}
                  </div>
                  <div className="w-full max-w-[42px] flex flex-col justify-end items-center gap-1">
                    {item.pending > 0 && (
                      <div
                        style={{ height: `${pendHeight}px` }}
                        className="w-full bg-amber-400/80 rounded-t-md transition-all group-hover:bg-amber-500"
                        title={`Pending: ${item.pending}`}
                      />
                    )}
                    <div
                      style={{ height: `${compHeight}px` }}
                      className="w-full bg-emerald-600 rounded-t-md transition-all group-hover:bg-emerald-500 shadow-sm"
                      title={`Completed: ${item.completed}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-600" /> Completed Pickups
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-400/80" /> Pending Queue
            </span>
          </div>
        </div>

        {/* Waste Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Waste Composition Breakdown
          </h3>
          <div className="space-y-3">
            {(['Recyclable', 'Organic', 'General', 'Hazardous'] as const).map(cat => {
              const count = categoryCounts[cat] || 0;
              const pct = totalBins > 0 ? Math.round((count / totalBins) * 100) : 0;
              const colors = {
                Recyclable: 'bg-cyan-500',
                Organic: 'bg-lime-500',
                General: 'bg-slate-500',
                Hazardous: 'bg-amber-500'
              };
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="text-slate-500 font-mono">{count} bins ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${colors[cat]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Active Fleet Vehicles: </span>
            <span className="font-mono text-ecogreen font-semibold">{vehicles.filter(v => v.status === 'In Service').length} in service</span>, {vehicles.filter(v => v.status === 'Idle').length} idle
          </div>
        </div>
      </div>

      {/* Active Routes & Zone Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-ecogreen" />
              Active Routes & Driver Progress
            </h3>
            <button
              onClick={() => onNavigate('routes')}
              className="text-xs font-semibold text-ecogreen hover:underline flex items-center gap-1"
            >
              Route Planner <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {routes.map(route => {
              const completedStops = route.stops.filter(s => s.completed).length;
              const totalStops = route.stops.length;
              const pct = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
              return (
                <div
                  key={route.id}
                  onClick={() => onNavigate('routes')}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-ecogreen cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{route.name}</span>
                    <StatusBadge status={route.status} />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                    <span>Driver: <strong>{route.driverName}</strong></span>
                    <span>&bull;</span>
                    <span>{route.vehicleName}</span>
                    <span>&bull;</span>
                    <span>{route.estimatedDistanceKm} km</span>
                  </div>

                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Stops Cleared</span>
                      <span className="font-mono">{completedStops} / {totalStops} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-ecogreen rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Summary */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ecogreen" />
              District Operational Workload
            </h3>
            <button
              onClick={() => onNavigate('bins')}
              className="text-xs font-semibold text-ecogreen hover:underline"
            >
              View District Bins &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {zoneSummary.map(z => (
              <div key={z.zone} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{z.zone}</span>
                  <span className="font-mono text-slate-500">{z.avgFill}% avg capacity</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full ${
                      z.avgFill >= 80 ? 'bg-rose-500' : z.avgFill >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${z.avgFill}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{z.total} Monitored Units</span>
                  <span>{z.activeReqs} Active Dispatch Orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
