import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CollectionRequest, 
  RequestStatus, 
  PriorityLevel, 
  WasteCategory 
} from '../types';
import { 
  Plus, 
  Search, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Truck, 
  Calendar, 
  AlertCircle, 
  XCircle, 
  ArrowUpDown,
  History,
  FileText
} from 'lucide-react';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface CollectionRequestsPageProps {
  initialBinForNewRequest?: any;
  onClearInitialBin?: () => void;
}

export const CollectionRequestsPage: React.FC<CollectionRequestsPageProps> = ({
  initialBinForNewRequest,
  onClearInitialBin
}) => {
  const { 
    requests, 
    bins, 
    workers, 
    vehicles, 
    createRequest, 
    updateRequestStatus, 
    assignRequest, 
    cancelRequest,
    currentUser,
    settings
  } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<'createdAt' | 'priority' | 'scheduledDate'>('createdAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<CollectionRequest | null>(null);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Assign Form
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Create Form State
  const [formData, setFormData] = useState({
    binId: '',
    binName: '',
    location: '',
    zone: settings.zones[0] || 'Downtown Core',
    category: 'General' as WasteCategory,
    priority: 'Medium' as PriorityLevel,
    scheduledDate: new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 16),
    assignedWorkerId: '',
    assignedVehicleId: '',
    notes: ''
  });

  // Handle pre-fill if triggered from Smart Bins page
  React.useEffect(() => {
    if (initialBinForNewRequest) {
      setFormData({
        binId: initialBinForNewRequest.id,
        binName: initialBinForNewRequest.name,
        location: initialBinForNewRequest.address,
        zone: initialBinForNewRequest.zone,
        category: initialBinForNewRequest.category,
        priority: initialBinForNewRequest.priority || 'High',
        scheduledDate: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16),
        assignedWorkerId: '',
        assignedVehicleId: '',
        notes: `Urgent pickup initiated from Bin Manager (Fill level: ${initialBinForNewRequest.fillLevel}%).`
      });
      setIsCreateModalOpen(true);
      if (onClearInitialBin) onClearInitialBin();
    }
  }, [initialBinForNewRequest, onClearInitialBin]);

  // Priority sort weights
  const priorityWeight: Record<PriorityLevel, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.binName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.assignedWorkerName && req.assignedWorkerName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || req.priority === priorityFilter;
      const matchZone = zoneFilter === 'all' || req.zone === zoneFilter;

      return matchSearch && matchStatus && matchPriority && matchZone;
    }).sort((a, b) => {
      if (sortField === 'priority') {
        const weightB = priorityWeight[b.priority as PriorityLevel] || 0;
        const weightA = priorityWeight[a.priority as PriorityLevel] || 0;
        const diff = weightB - weightA;
        return sortAsc ? -diff : diff;
      }
      const timeA = new Date(a[sortField]).getTime();
      const timeB = new Date(b[sortField]).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, zoneFilter, sortField, sortAsc]);

  const handleOpenCreate = () => {
    setFormData({
      binId: bins[0]?.id || '',
      binName: bins[0]?.name || '',
      location: bins[0]?.address || '',
      zone: bins[0]?.zone || settings.zones[0],
      category: bins[0]?.category || 'General',
      priority: 'Medium',
      scheduledDate: new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 16),
      assignedWorkerId: '',
      assignedVehicleId: '',
      notes: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest({
      binId: formData.binId,
      binName: formData.binName,
      location: formData.location,
      zone: formData.zone,
      category: formData.category,
      priority: formData.priority,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      assignedWorkerId: formData.assignedWorkerId || undefined,
      assignedWorkerName: workers.find(w => w.id === formData.assignedWorkerId)?.name,
      assignedVehicleId: formData.assignedVehicleId || undefined,
      assignedVehicleName: vehicles.find(v => v.id === formData.assignedVehicleId)?.regNumber,
      notes: formData.notes
    });
    setIsCreateModalOpen(false);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigningRequestId && selectedWorkerId && selectedVehicleId) {
      assignRequest(assigningRequestId, selectedWorkerId, selectedVehicleId);
      setAssigningRequestId(null);
      setSelectedWorkerId('');
      setSelectedVehicleId('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Collection Dispatch Work Orders
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {filteredRequests.length} orders
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage dispatch requests, field crew assignments, and work completion verification
          </p>
        </div>

        {!isWorker && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-ecogreen hover:bg-ecogreen-dark text-white transition-all shadow-md hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Create Collection Request
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
              placeholder="Search request ID, location, driver..."
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
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
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

      {/* Requests Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Request ID</th>
                <th className="p-3.5">Target Location / Bin</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => { setSortField('priority'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1.5">
                    Priority <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Assigned Crew</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => { setSortField('scheduledDate'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1.5">
                    Scheduled Time <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => {
                  const isOverdue = 
                    (req.status === 'Pending' || req.status === 'Assigned' || req.status === 'In Progress') && 
                    new Date(req.scheduledDate).getTime() < Date.now();

                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isOverdue ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {req.id}
                        {isOverdue && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-sans font-bold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Overdue
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{req.binName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{req.location}</div>
                      </td>
                      <td className="p-3.5">
                        <CategoryBadge category={req.category} />
                      </td>
                      <td className="p-3.5">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="p-3.5">
                        {req.assignedWorkerName ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {req.assignedWorkerName}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Truck className="w-3 h-3" />
                              {req.assignedVehicleName || 'Vehicle assigned'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-slate-700 dark:text-slate-300">
                          {new Date(req.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                          {new Date(req.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Dispatch (Admin / Manager only) */}
                          {!isWorker && req.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setAssigningRequestId(req.id);
                                setSelectedWorkerId(workers.find(w => w.availability === 'Available')?.id || workers[0]?.id || '');
                                setSelectedVehicleId(vehicles.find(v => v.status === 'Idle')?.id || vehicles[0]?.id || '');
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                              Dispatch
                            </button>
                          )}

                          {/* In Progress trigger */}
                          {req.status === 'Assigned' && (
                            <button
                              onClick={() => updateRequestStatus(req.id, 'In Progress')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                            >
                              Start
                            </button>
                          )}

                          {/* Complete trigger */}
                          {(req.status === 'In Progress' || req.status === 'Assigned') && (
                            <button
                              onClick={() => updateRequestStatus(req.id, 'Completed')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                              Complete
                            </button>
                          )}

                          {/* Inspect Timeline */}
                          <button
                            onClick={() => setViewingRequest(req)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Request Activity Log"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Cancel button (Admin / Manager only) */}
                          {!isWorker && req.status !== 'Completed' && req.status !== 'Cancelled' && (
                            <button
                              onClick={() => setCancellingRequestId(req.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Cancel Request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No collection requests match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Waste Collection Request"
        subtitle="Schedule automated or manual pickup orders for smart bins or civic drop zones"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associated Smart Bin (Optional)
            </label>
            <select
              value={formData.binId}
              onChange={e => {
                const b = bins.find(item => item.id === e.target.value);
                if (b) {
                  setFormData({
                    ...formData,
                    binId: b.id,
                    binName: b.name,
                    location: b.address,
                    zone: b.zone,
                    category: b.category,
                    priority: b.fillLevel >= 90 ? 'Critical' : 'Medium'
                  });
                } else {
                  setFormData({ ...formData, binId: e.target.value });
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="">Manual Location (No bin linked)</option>
              {bins.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.name} ({b.fillLevel}% full)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pickup Name / Location Title *
              </label>
              <input
                type="text"
                required
                value={formData.binName}
                onChange={e => setFormData({ ...formData, binName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waste Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as WasteCategory })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {settings.wasteCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address / GPS Coordinates *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Immediate dispatch)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Pickup Window *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.scheduledDate}
                onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dispatch Instructions / Field Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Access via side alley, security gate code 4091..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
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
              Submit Collection Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Dispatch Assignment Modal */}
      {assigningRequestId && (
        <Modal
          isOpen={true}
          onClose={() => setAssigningRequestId(null)}
          title={`Dispatch Field Assignment: ${assigningRequestId}`}
          subtitle="Pair an available waste collection worker with a compatible municipal vehicle"
          maxWidth="md"
        >
          <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Field Worker *
              </label>
              <select
                value={selectedWorkerId}
                onChange={e => setSelectedWorkerId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.zone} &bull; {w.availability})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Fleet Vehicle *
              </label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} — {v.type} ({v.status} &bull; Capacity: {v.capacityKg}kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAssigningRequestId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
              >
                Confirm Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Request Details & Activity Timeline Modal */}
      {viewingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setViewingRequest(null)}
          title={`Order Dossier: ${viewingRequest.id}`}
          subtitle={`${viewingRequest.binName} (${viewingRequest.zone})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                <div className="mt-1"><StatusBadge status={viewingRequest.status} /></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Priority</span>
                <div className="mt-1"><PriorityBadge priority={viewingRequest.priority} /></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Driver</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {viewingRequest.assignedWorkerName || 'Unassigned'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Truck</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {viewingRequest.assignedVehicleName || 'None'}
                </div>
              </div>
            </div>

            {viewingRequest.notes && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span className="font-bold">Instructions: </span> {viewingRequest.notes}
              </div>
            )}

            {/* Timeline Events */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-ecogreen" />
                Dispatch Audit & Action Timeline
              </h4>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {(viewingRequest.timeline || []).map((event, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-ecogreen ring-4 ring-white dark:ring-slate-900" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{event.action}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        By <strong>{event.actor}</strong> &bull; {new Date(event.timestamp).toLocaleString()}
                      </div>
                      {event.note && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic">
                          "{event.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancellingRequestId !== null}
        onClose={() => setCancellingRequestId(null)}
        onConfirm={() => {
          if (cancellingRequestId) {
            cancelRequest(cancellingRequestId, cancelReason);
            setCancelReason('');
          }
        }}
        title="Cancel Collection Order"
        message={`Are you sure you want to cancel request ${cancellingRequestId}? Field workers will be notified immediately.`}
        confirmLabel="Cancel Request"
        isDestructive={true}
      />
    </div>
  );
};
