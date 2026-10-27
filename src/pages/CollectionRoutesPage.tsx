import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CollectionRoute, RouteStop, WasteCategory } from '../types';
import { 
  Navigation, 
  Plus, 
  Truck, 
  UserCheck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Compass, 
  Trash2, 
  Edit3, 
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';

export const CollectionRoutesPage: React.FC = () => {
  const { 
    routes, 
    bins, 
    workers, 
    vehicles, 
    createRoute, 
    updateRoute, 
    deleteRoute, 
    toggleRouteStop, 
    settings,
    currentUser
  } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';

  // Automatically select worker's assigned route if role is worker
  const myAssignedRoute = isWorker 
    ? routes.find(r => r.driverId === currentUser.id || r.driverName.toLowerCase().includes(currentUser.name.toLowerCase())) 
    : undefined;

  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    myAssignedRoute?.id || routes[0]?.id || ''
  );
  const [activeStopId, setActiveStopId] = useState<string | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditStopsOpen, setIsEditStopsOpen] = useState(false);

  // Active selected route
  const currentRoute = routes.find(r => r.id === selectedRouteId) || myAssignedRoute || routes[0];

  // Create Route Form
  const [routeName, setRouteName] = useState('');
  const [routeZone, setRouteZone] = useState(settings.zones[0]);
  const [selectedDriverId, setSelectedDriverId] = useState(workers[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');

  // Edit Stops State
  const [selectedBinIdsForStops, setSelectedBinIdsForStops] = useState<string[]>([]);

  const handleOpenCreate = () => {
    setRouteName(`Urban Route ${routes.length + 1}`);
    setRouteZone(settings.zones[0]);
    setSelectedDriverId(workers[0]?.id || '');
    setSelectedVehicleId(vehicles[0]?.id || '');
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = workers.find(w => w.id === selectedDriverId);
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);

    // Pick top 3-4 bins in this zone with highest fill levels as default stops
    const zoneBins = bins
      .filter(b => b.zone === routeZone)
      .sort((a, b) => b.fillLevel - a.fillLevel)
      .slice(0, 4);

    const stops: RouteStop[] = zoneBins.map((bin, idx) => ({
      id: `STP-${Date.now()}-${idx}`,
      binId: bin.id,
      binName: bin.name,
      address: bin.address,
      lat: bin.lat,
      lng: bin.lng,
      category: bin.category,
      fillLevel: bin.fillLevel,
      completed: false
    }));

    const distance = Math.round((stops.length * 2.2 + 1.5) * 10) / 10;
    const duration = Math.round(distance * 5);

    createRoute({
      name: routeName,
      zone: routeZone,
      driverId: selectedDriverId,
      driverName: driver?.name || 'Driver',
      vehicleId: selectedVehicleId,
      vehicleName: vehicle ? `${vehicle.regNumber} (${vehicle.type})` : 'Vehicle',
      status: 'Scheduled',
      stops,
      estimatedDistanceKm: distance,
      estimatedDurationMins: duration
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenEditStops = () => {
    if (currentRoute) {
      setSelectedBinIdsForStops(currentRoute.stops.map(s => s.binId));
      setIsEditStopsOpen(true);
    }
  };

  const handleSaveStops = () => {
    if (!currentRoute) return;
    const newStops: RouteStop[] = selectedBinIdsForStops.map((binId, idx) => {
      const existingStop = currentRoute.stops.find(s => s.binId === binId);
      if (existingStop) return existingStop;
      const bin = bins.find(b => b.id === binId)!;
      return {
        id: `STP-${Date.now()}-${idx}`,
        binId: bin.id,
        binName: bin.name,
        address: bin.address,
        lat: bin.lat,
        lng: bin.lng,
        category: bin.category,
        fillLevel: bin.fillLevel,
        completed: false
      };
    });

    const dist = Math.round((newStops.length * 2.1 + 1.2) * 10) / 10;
    const dur = Math.round(dist * 5);

    updateRoute(currentRoute.id, {
      stops: newStops,
      estimatedDistanceKm: dist,
      estimatedDurationMins: dur
    });

    setIsEditStopsOpen(false);
  };

  const completedCount = currentRoute?.stops.filter(s => s.completed).length || 0;
  const totalCount = currentRoute?.stops.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Dynamic Collection Route Planner
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {routes.length} Active Routes
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optimize waypoint sequencing, track driver completion, and monitor real-time bin clearances
          </p>
        </div>

        {!isWorker && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-ecogreen hover:bg-ecogreen-dark text-white transition-all shadow-md hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Plan New Collection Route
          </button>
        )}
      </div>

      {/* Field Worker Shift Info Notice */}
      {isWorker && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Field Operator View:</strong> Showing route stops. Tap the checkbox next to any waypoint to record bin clearance.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300">
              {completedCount} / {totalCount} Pickups Done ({progressPct}%)
            </span>
          </div>
        </div>
      )}

      {/* Route Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {routes.map(route => {
          const isSelected = (currentRoute?.id || '') === route.id;
          const completedStops = route.stops.filter(s => s.completed).length;
          return (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRouteId(route.id);
                setActiveStopId(undefined);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all shrink-0 ${
                isSelected
                  ? 'bg-ecogreen text-white border-ecogreen shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-ecogreen/50'
              }`}
            >
              <Navigation className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div>{route.name}</div>
                <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {completedStops}/{route.stops.length} stops &bull; {route.zone}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Map (Left) + Assigned Stops Checklist (Right) */}
      {currentRoute ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Route Stats Bar */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Driver</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-ecogreen" />
                    {currentRoute.driverName}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Vehicle</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Truck className="w-3.5 h-3.5 text-ecogreen" />
                    {currentRoute.vehicleName}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Est. Distance</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    ~{currentRoute.estimatedDistanceKm} km ({currentRoute.estimatedDurationMins} min)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={currentRoute.status} />
                {!isWorker && (
                  <button
                    onClick={handleOpenEditStops}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Stops
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map with Route Polyline */}
            <InteractiveMap
              stops={currentRoute.stops}
              activeStopId={activeStopId}
              onSelectStop={id => setActiveStopId(id)}
              height="480px"
            />

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-ecogreen" />
                Distances derived from OpenStreetMap coordinate waypoints.
              </span>
              <span className="italic">Click any checkbox or stop to record field collection.</span>
            </div>
          </div>

          {/* Assigned Stops Checklist Column (1 col) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Route Waypoint Checklist
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {completedCount} of {totalCount} stops collected
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-ecogreen">{progressPct}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 my-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Stop Items */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {currentRoute.stops.map((stop, index) => {
                  const isSelected = activeStopId === stop.id;
                  return (
                    <div
                      key={stop.id}
                      onClick={() => setActiveStopId(stop.id)}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        stop.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : isSelected
                          ? 'bg-slate-50 dark:bg-slate-800 border-ecogreen shadow-sm ring-1 ring-ecogreen'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            toggleRouteStop(currentRoute.id, stop.id);
                          }}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                          title={stop.completed ? 'Mark pending' : 'Mark collected'}
                        >
                          {stop.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              #{index + 1} &bull; {stop.binName}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              stop.fillLevel >= 90 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {stop.fillLevel}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {stop.address}
                          </p>
                          {stop.completed && stop.completedAt && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Collected at {new Date(stop.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {isAdmin ? (
                <button
                  onClick={() => deleteRoute(currentRoute.id)}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Route
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Route Management: {isWorker ? 'Field Execution' : 'Manager Dispatch'}
                </span>
              )}
              {progressPct === 100 && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Route Fully Completed
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400">
          <Navigation className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="font-semibold text-sm">No collection routes currently scheduled</p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-ecogreen text-white"
          >
            Create Route
          </button>
        </div>
      )}

      {/* Plan New Route Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Plan Optimized Collection Route"
        subtitle="Sequence high-priority smart bins into an efficient municipal pickup run"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Route Identifier / Name *
            </label>
            <input
              type="text"
              required
              value={routeName}
              onChange={e => setRouteName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Municipal Sector / Zone *
            </label>
            <select
              value={routeZone}
              onChange={e => setRouteZone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              {settings.zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Driver *
              </label>
              <select
                value={selectedDriverId}
                onChange={e => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.availability})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Vehicle *
              </label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} ({v.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
            Smart Route Optimizer will automatically ingest all high-priority smart bins located in <strong>{routeZone}</strong> into this route sequence.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
            >
              Generate Optimized Route
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Stops Selection Modal */}
      {isEditStopsOpen && currentRoute && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditStopsOpen(false)}
          title={`Edit Stops: ${currentRoute.name}`}
          subtitle={`Select smart bins in ${currentRoute.zone} to include in this route`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {bins.map(bin => {
                const isSelected = selectedBinIdsForStops.includes(bin.id);
                return (
                  <label
                    key={bin.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer pt-2"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedBinIdsForStops(prev => prev.filter(id => id !== bin.id));
                          } else {
                            setSelectedBinIdsForStops(prev => [...prev, bin.id]);
                          }
                        }}
                        className="rounded border-slate-300 text-ecogreen focus:ring-ecogreen w-4 h-4"
                      />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {bin.id} &bull; {bin.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{bin.address} ({bin.zone})</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      bin.fillLevel >= 90 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {bin.fillLevel}%
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditStopsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStops}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
              >
                Save Stops ({selectedBinIdsForStops.length})
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
