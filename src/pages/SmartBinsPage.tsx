import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SmartBin, WasteCategory, SensorConnectivity, PriorityLevel } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  RotateCcw, 
  BatteryCharging, 
  Radio, 
  ArrowUpDown,
  MapPin,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { FillBar } from '../components/common/FillBar';
import { PriorityBadge, CategoryBadge, ConnectivityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SmartBinsPageProps {
  onOpenCreateRequestForBin: (bin: SmartBin) => void;
}

export const SmartBinsPage: React.FC<SmartBinsPageProps> = ({
  onOpenCreateRequestForBin
}) => {
  const { 
    bins, 
    addBin, 
    updateBin, 
    deleteBin, 
    emptyBin, 
    settings,
    simulateBinReading,
    currentUser
  } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedConnectivity, setSelectedConnectivity] = useState<string>('all');
  const [fillRange, setFillRange] = useState<string>('all'); // all, normal, moderate, high, critical
  
  // Sorting State
  const [sortField, setSortField] = useState<keyof SmartBin>('fillLevel');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<SmartBin | null>(null);
  const [inspectingBin, setInspectingBin] = useState<SmartBin | null>(null);
  const [deletingBinId, setDeletingBinId] = useState<string | null>(null);

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'General' as WasteCategory,
    zone: settings.zones[0] || 'Downtown Core',
    address: '',
    lat: 37.7749,
    lng: -122.4194,
    fillLevel: 10,
    heightCm: 120,
    batteryLevel: 95,
    connectivity: 'online' as SensorConnectivity,
    notes: ''
  });

  // Filtered & Sorted Bins
  const filteredBins = useMemo(() => {
    return bins.filter(bin => {
      const matchSearch = 
        bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.zone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'all' || bin.category === selectedCategory;
      const matchZone = selectedZone === 'all' || bin.zone === selectedZone;
      const matchConn = selectedConnectivity === 'all' || bin.connectivity === selectedConnectivity;

      let matchFill = true;
      if (fillRange === 'normal') matchFill = bin.fillLevel < settings.moderateThreshold;
      else if (fillRange === 'moderate') matchFill = bin.fillLevel >= settings.moderateThreshold && bin.fillLevel < settings.highThreshold;
      else if (fillRange === 'high') matchFill = bin.fillLevel >= settings.highThreshold && bin.fillLevel < settings.criticalThreshold;
      else if (fillRange === 'critical') matchFill = bin.fillLevel >= settings.criticalThreshold;

      return matchSearch && matchCat && matchZone && matchConn && matchFill;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = (valA as string).toLowerCase();
      if (typeof valB === 'string') valB = (valB as string).toLowerCase();

      if (valA! < valB!) return sortAsc ? -1 : 1;
      if (valA! > valB!) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [bins, searchTerm, selectedCategory, selectedZone, selectedConnectivity, fillRange, sortField, sortAsc, settings]);

  const handleSort = (field: keyof SmartBin) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'General',
      zone: settings.zones[0] || 'Downtown Core',
      address: '',
      lat: 37.7749 + (Math.random() - 0.5) * 0.02,
      lng: -122.4194 + (Math.random() - 0.5) * 0.02,
      fillLevel: 15,
      heightCm: 120,
      batteryLevel: 95,
      connectivity: 'online',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bin: SmartBin) => {
    setEditingBin(bin);
    setFormData({
      name: bin.name,
      category: bin.category,
      zone: bin.zone,
      address: bin.address,
      lat: bin.lat,
      lng: bin.lng,
      fillLevel: bin.fillLevel,
      heightCm: bin.heightCm || 120,
      batteryLevel: bin.batteryLevel,
      connectivity: bin.connectivity,
      notes: bin.notes || ''
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBin) {
      updateBin(editingBin.id, formData);
      setEditingBin(null);
    } else {
      addBin(formData);
      setIsAddModalOpen(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Zone', 'Address', 'FillLevelPct', 'BatteryPct', 'Connectivity', 'LastUpdate', 'Priority'];
    const rows = filteredBins.map(b => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      b.category,
      `"${b.zone}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      b.fillLevel,
      b.batteryLevel,
      b.connectivity,
      b.lastUpdate,
      b.priority
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecotrack_smart_bins_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Smart Bin Inventory & Sensors
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {filteredBins.length} of {bins.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ultrasonic fill-level monitoring, connectivity telemetry, and quick collection dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          {!isWorker && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-ecogreen hover:bg-ecogreen-dark text-white transition-all shadow-md hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Register Smart Bin
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, address, zone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Categories</option>
              {settings.wasteCategories.map(cat => (
                <option key={cat} value={cat}>{cat} Waste</option>
              ))}
            </select>
          </div>

          {/* Zone Filter */}
          <div>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Zones</option>
              {settings.zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          {/* Fill Range Filter */}
          <div>
            <select
              value={fillRange}
              onChange={e => setFillRange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            >
              <option value="all">All Fill Levels</option>
              <option value="critical">Critical (&gt; {settings.criticalThreshold}%)</option>
              <option value="high">High ({settings.highThreshold} - {settings.criticalThreshold}%)</option>
              <option value="moderate">Moderate ({settings.moderateThreshold} - {settings.highThreshold}%)</option>
              <option value="normal">Normal (&lt; {settings.moderateThreshold}%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Smart Bins Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1.5">
                    Bin ID & Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Zone & Location</th>
                <th className="p-3.5 w-48 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => handleSort('fillLevel')}>
                  <div className="flex items-center gap-1.5">
                    Fill Capacity <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Sensor Signal</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => handleSort('batteryLevel')}>
                  <div className="flex items-center gap-1.5">
                    Battery <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBins.length > 0 ? (
                filteredBins.map(bin => {
                  const calculatedDistanceCm = Math.max(2, Math.round((bin.heightCm || 120) * (1 - bin.fillLevel / 100)));
                  return (
                    <tr 
                      key={bin.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        bin.fillLevel >= settings.criticalThreshold ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span className="font-mono text-ecogreen font-semibold">{bin.id}</span>
                          <span className="truncate max-w-[160px]">{bin.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Depth: {bin.heightCm || 120}cm &bull; Echo: {calculatedDistanceCm}cm
                        </div>
                      </td>
                      <td className="p-3.5">
                        <CategoryBadge category={bin.category} />
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {bin.zone}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {bin.address}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <FillBar fillLevel={bin.fillLevel} size="md" distanceCm={calculatedDistanceCm} />
                      </td>
                      <td className="p-3.5">
                        <ConnectivityBadge connectivity={bin.connectivity} />
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(bin.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <BatteryCharging className={`w-3.5 h-3.5 ${bin.batteryLevel <= 20 ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span className={bin.batteryLevel <= 20 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                            {bin.batteryLevel}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <PriorityBadge priority={bin.priority} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Empty / Collect button */}
                          <button
                            onClick={() => emptyBin(bin.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Empty Bin (Mark Collected & Reset to 0%)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Quick Dispatch Request */}
                          <button
                            onClick={() => onOpenCreateRequestForBin(bin)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-ecogreen hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Create Collection Request for this Bin"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* Inspect telemetry history */}
                          <button
                            onClick={() => setInspectingBin(bin)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="View Sensor Telemetry History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (Admin and Manager only) */}
                          {!isWorker && (
                            <button
                              onClick={() => handleOpenEdit(bin)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Bin Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete (Admin only) */}
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingBinId(bin.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Bin"
                            >
                              <Trash2 className="w-4 h-4" />
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
                    <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No smart bins match your filters</p>
                    <p className="text-xs mt-1">Try resetting the search keyword or adjusting category/zone filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Smart Bin Modal */}
      <Modal
        isOpen={isAddModalOpen || editingBin !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBin(null);
        }}
        title={editingBin ? `Edit Smart Bin: ${editingBin.id}` : 'Register New Smart Bin'}
        subtitle="Configure physical bin dimensions, waste classification, and sensor parameters"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bin Name / Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Civic Plaza North Hub"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waste Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as WasteCategory })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {settings.wasteCategories.map(cat => (
                  <option key={cat} value={cat}>{cat} Waste</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Municipal Zone *
              </label>
              <select
                value={formData.zone}
                onChange={e => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                {settings.zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Bin Depth (cm) *
              </label>
              <input
                type="number"
                min="50"
                max="250"
                required
                value={formData.heightCm}
                onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Street Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 500 Market St, Near Kiosk #2"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GPS Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GPS Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Fill Capacity ({formData.fillLevel}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.fillLevel}
                onChange={e => setFormData({ ...formData, fillLevel: Number(e.target.value) })}
                className="w-full accent-ecogreen"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Connectivity Channel
              </label>
              <select
                value={formData.connectivity}
                onChange={e => setFormData({ ...formData, connectivity: e.target.value as SensorConnectivity })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              >
                <option value="online">Online (Wi-Fi / 4G NB-IoT)</option>
                <option value="weak">Weak Signal</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Field Technician Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Near park fountain, heavy organic waste accumulation on weekends..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingBin(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
            >
              {editingBin ? 'Save Bin Changes' : 'Register Smart Bin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bin Telemetry History Drawer / Modal */}
      {inspectingBin && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingBin(null)}
          title={`Telemetry Stream: ${inspectingBin.id} (${inspectingBin.name})`}
          subtitle={`Zone: ${inspectingBin.zone} • ${inspectingBin.category} Waste`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Current Fill</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {inspectingBin.fillLevel}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Ultrasonic Echo</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {Math.max(2, Math.round((inspectingBin.heightCm || 120) * (1 - inspectingBin.fillLevel / 100)))} cm
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Battery Level</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {inspectingBin.batteryLevel}%
                </div>
              </div>
            </div>

            <FillBar fillLevel={inspectingBin.fillLevel} size="lg" />

            {/* Telemetry Sensor History Readings */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                <span>Recent Sensor Readings (HC-SR04 Transmissions)</span>
                <span className="font-mono text-slate-400 text-[10px] font-normal">FIFO Buffer (Last 12)</span>
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">Fill Level</th>
                      <th className="p-2">Distance</th>
                      <th className="p-2">Battery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(inspectingBin.sensorHistory || []).slice().reverse().map((reading, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 text-slate-500 font-sans">
                          {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-2 font-bold text-slate-900 dark:text-slate-100">
                          {reading.fillLevel}%
                        </td>
                        <td className="p-2 text-slate-600 dark:text-slate-300">
                          {reading.distanceCm} cm
                        </td>
                        <td className="p-2 text-slate-600 dark:text-slate-300">
                          {reading.batteryLevel}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  emptyBin(inspectingBin.id);
                  setInspectingBin(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                Reset Fill to 0% (Mark Collected)
              </button>
              <button
                onClick={() => {
                  onOpenCreateRequestForBin(inspectingBin);
                  setInspectingBin(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-ecogreen hover:bg-ecogreen-dark transition-colors shadow-sm"
              >
                Dispatch Collection Request &rarr;
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deletingBinId !== null}
        onClose={() => setDeletingBinId(null)}
        onConfirm={() => {
          if (deletingBinId) deleteBin(deletingBinId);
        }}
        title="Confirm Smart Bin Deletion"
        message={`Are you sure you want to remove bin ${deletingBinId} from monitoring? Historical logs for this node will be purged.`}
        confirmLabel="Delete Bin"
        isDestructive={true}
      />
    </div>
  );
};
