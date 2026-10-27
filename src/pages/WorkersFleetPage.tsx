import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Worker, Vehicle, WorkerAvailability, VehicleStatus, VehicleType } from '../types';
import { 
  Users, 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  BatteryCharging, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const WorkersFleetPage: React.FC = () => {
  const { 
    workers, 
    vehicles, 
    addWorker, 
    updateWorker, 
    deleteWorker, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    settings,
    currentUser
  } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';

  const [activeTab, setActiveTab] = useState<'workers' | 'vehicles'>('workers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');

  // Modals
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);

  // Worker Form State
  const [workerForm, setWorkerForm] = useState({
    name: '',
    phone: '',
    email: '',
    zone: settings.zones[0],
    availability: 'Available' as WorkerAvailability
  });

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    regNumber: '',
    type: 'Compactor Truck' as VehicleType,
    capacityKg: 3500,
    status: 'Idle' as VehicleStatus,
    fuelBatteryPct: 90,
    zone: settings.zones[0]
  });

  // Filtered Workers
  const filteredWorkers = workers.filter(w => {
    const matchSearch = 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || w.availability === statusFilter;
    const matchZone = zoneFilter === 'all' || w.zone === zoneFilter;

    return matchSearch && matchStatus && matchZone;
  });

  // Filtered Vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = 
      v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchZone = zoneFilter === 'all' || v.zone === zoneFilter;

    return matchSearch && matchStatus && matchZone;
  });

  // Worker Handlers
  const handleOpenAddWorker = () => {
    setWorkerForm({
      name: '',
      phone: '+1 (555) 000-0000',
      email: '',
      zone: settings.zones[0],
      availability: 'Available'
    });
    setEditingWorker(null);
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorker = (w: Worker) => {
    setEditingWorker(w);
    setWorkerForm({
      name: w.name,
      phone: w.phone,
      email: w.email,
      zone: w.zone,
      availability: w.availability
    });
    setIsWorkerModalOpen(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      updateWorker(editingWorker.id, workerForm);
    } else {
      addWorker(workerForm);
    }
    setIsWorkerModalOpen(false);
  };

  // Vehicle Handlers
  const handleOpenAddVehicle = () => {
    setVehicleForm({
      regNumber: `ECO-TRK-${Math.floor(100 + Math.random() * 900)}`,
      type: 'Compactor Truck',
      capacityKg: 3500,
      status: 'Idle',
      fuelBatteryPct: 100,
      zone: settings.zones[0]
    });
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleForm({
      regNumber: v.regNumber,
      type: v.type,
      capacityKg: v.capacityKg,
      status: v.status,
      fuelBatteryPct: v.fuelBatteryPct,
      zone: v.zone
    });
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleForm);
    } else {
      addVehicle(vehicleForm);
    }
    setIsVehicleModalOpen(false);
  };

  if (isWorker) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Workforce & Fleet Roster Restricted
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Field worker accounts do not have access to administrative personnel records or vehicle fleet management. Please check your assigned vehicle directly on the <strong>Shift Overview</strong> console.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Field Crew & Fleet Management
            {isManager && (
              <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Manager Dispatch Console
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage certified drivers, waste collectors, compactor trucks, and electric collection vans
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'workers' ? (
            <button
              onClick={handleOpenAddWorker}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-ecogreen hover:bg-ecogreen-dark text-white transition-all shadow-md hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Field Worker
            </button>
          ) : (
            <button
              onClick={handleOpenAddVehicle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-ecogreen hover:bg-ecogreen-dark text-white transition-all shadow-md hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Register Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('workers');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === 'workers'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Field Personnel ({workers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('vehicles');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === 'vehicles'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              Fleet Vehicles ({vehicles.length})
            </button>
          </div>

          {/* Quick Stats in tab */}
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
            {activeTab === 'workers' ? (
              <>
                <span>Available: <strong className="text-emerald-600">{workers.filter(w => w.availability === 'Available').length}</strong></span>
                <span>On Route: <strong className="text-indigo-600">{workers.filter(w => w.availability === 'On Route').length}</strong></span>
              </>
            ) : (
              <>
                <span>In Service: <strong className="text-emerald-600">{vehicles.filter(v => v.status === 'In Service').length}</strong></span>
                <span>Idle / Ready: <strong className="text-blue-600">{vehicles.filter(v => v.status === 'Idle').length}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'workers' ? 'Search by name, email, phone...' : 'Search by registration, model...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Statuses</option>
              {activeTab === 'workers' ? (
                <>
                  <option value="Available">Available</option>
                  <option value="On Route">On Route</option>
                  <option value="Off Duty">Off Duty</option>
                </>
              ) : (
                <>
                  <option value="In Service">In Service</option>
                  <option value="Idle">Idle</option>
                  <option value="Maintenance">Maintenance</option>
                </>
              )}
            </select>
          </div>

          <div>
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Zones</option>
              {settings.zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workers Tab Content */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWorkers.map(worker => (
            <div
              key={worker.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:border-ecogreen transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={worker.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{worker.name}</h3>
                    <span className="text-[10px] font-mono text-ecogreen font-semibold">{worker.id}</span>
                  </div>
                </div>
                <StatusBadge status={worker.availability} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{worker.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{worker.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{worker.email}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Pickups Completed</span>
                  <div className="font-bold font-mono text-slate-800 dark:text-slate-200">{worker.completedCollections}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditWorker(worker)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Worker"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeletingWorkerId(worker.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicles Tab Content */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map(vehicle => (
            <div
              key={vehicle.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:border-ecogreen transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-ecogreen">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">{vehicle.regNumber}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle.type}</div>
                  </div>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Assigned Operator</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.assignedWorkerName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Capacity</span>
                  <span className="font-mono font-semibold">{vehicle.capacityKg} kg</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Current Load</span>
                  <span className="font-mono font-semibold">{vehicle.currentLoadKg} kg</span>
                </div>

                {/* Battery / Fuel Gauge */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5" /> Energy / Fuel
                    </span>
                    <span className="font-mono font-bold">{vehicle.fuelBatteryPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        vehicle.fuelBatteryPct <= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${vehicle.fuelBatteryPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{vehicle.zone}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditVehicle(vehicle)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Vehicle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeletingVehicleId(vehicle.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Decommission Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Worker Modal */}
      <Modal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        title={editingWorker ? `Edit Worker: ${editingWorker.name}` : 'Register Field Personnel'}
        subtitle="Manage municipal collection credentials, availability, and operating district"
        maxWidth="md"
      >
        <form onSubmit={handleSaveWorker} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={workerForm.name}
              onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Contact *
              </label>
              <input
                type="text"
                required
                value={workerForm.phone}
                onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={workerForm.email}
                onChange={e => setWorkerForm({ ...workerForm, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned District *
              </label>
              <select
                value={workerForm.zone}
                onChange={e => setWorkerForm({ ...workerForm, zone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {settings.zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Availability Status *
              </label>
              <select
                value={workerForm.availability}
                onChange={e => setWorkerForm({ ...workerForm, availability: e.target.value as WorkerAvailability })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                <option value="Available">Available</option>
                <option value="On Route">On Route</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsWorkerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
            >
              {editingWorker ? 'Update Personnel' : 'Register Worker'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title={editingVehicle ? `Edit Vehicle: ${editingVehicle.regNumber}` : 'Register Fleet Vehicle'}
        subtitle="Configure municipal hauler capacity, powertrain type, and active zone"
        maxWidth="md"
      >
        <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registration Identifier / Plate *
            </label>
            <input
              type="text"
              required
              value={vehicleForm.regNumber}
              onChange={e => setVehicleForm({ ...vehicleForm, regNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Type *
              </label>
              <select
                value={vehicleForm.type}
                onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value as VehicleType })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                <option value="Compactor Truck">Compactor Truck</option>
                <option value="Electric Van">Electric Van</option>
                <option value="Recycling Tipper">Recycling Tipper</option>
                <option value="Light Hauler">Light Hauler</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payload Capacity (kg) *
              </label>
              <input
                type="number"
                min="500"
                max="12000"
                required
                value={vehicleForm.capacityKg}
                onChange={e => setVehicleForm({ ...vehicleForm, capacityKg: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Base District *
              </label>
              <select
                value={vehicleForm.zone}
                onChange={e => setVehicleForm({ ...vehicleForm, zone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {settings.zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operational Status *
              </label>
              <select
                value={vehicleForm.status}
                onChange={e => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                <option value="Idle">Idle (Available)</option>
                <option value="In Service">In Service</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsVehicleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
            >
              {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deletingWorkerId !== null}
        onClose={() => setDeletingWorkerId(null)}
        onConfirm={() => {
          if (deletingWorkerId) deleteWorker(deletingWorkerId);
        }}
        title="Remove Field Worker"
        message={`Are you sure you want to remove worker ${deletingWorkerId} from the roster? Active routes should be reassigned.`}
        confirmLabel="Remove Worker"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={deletingVehicleId !== null}
        onClose={() => setDeletingVehicleId(null)}
        onConfirm={() => {
          if (deletingVehicleId) deleteVehicle(deletingVehicleId);
        }}
        title="Decommission Fleet Vehicle"
        message={`Are you sure you want to decommission vehicle ${deletingVehicleId}?`}
        confirmLabel="Decommission"
        isDestructive={true}
      />
    </div>
  );
};
