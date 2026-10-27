import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  SmartBin, 
  CollectionRequest, 
  Worker, 
  Vehicle, 
  CollectionRoute, 
  SystemAlert, 
  AppSettings, 
  User, 
  RequestStatus,
  SensorConnectivity
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_BINS,
  INITIAL_WORKERS,
  INITIAL_VEHICLES,
  INITIAL_REQUESTS,
  INITIAL_ROUTES,
  INITIAL_ALERTS,
  StorageService
} from '../services/storage';
import { SimulationEngine } from '../services/simulation';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  
  bins: SmartBin[];
  requests: CollectionRequest[];
  workers: Worker[];
  vehicles: Vehicle[];
  routes: CollectionRoute[];
  alerts: SystemAlert[];
  settings: AppSettings;
  
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Bins
  addBin: (bin: Partial<SmartBin>) => void;
  updateBin: (id: string, updates: Partial<SmartBin>) => void;
  deleteBin: (id: string) => void;
  emptyBin: (id: string) => void;
  simulateBinReading: (id: string, fill: number, battery?: number, conn?: SensorConnectivity) => void;

  // Requests
  createRequest: (req: Partial<CollectionRequest>) => void;
  updateRequestStatus: (id: string, status: RequestStatus, note?: string) => void;
  assignRequest: (id: string, workerId: string, vehicleId: string) => void;
  cancelRequest: (id: string, reason?: string) => void;

  // Routes
  createRoute: (route: Partial<CollectionRoute>) => void;
  updateRoute: (id: string, updates: Partial<CollectionRoute>) => void;
  toggleRouteStop: (routeId: string, stopId: string) => void;
  deleteRoute: (id: string) => void;

  // Workers & Vehicles
  addWorker: (worker: Partial<Worker>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  addVehicle: (vehicle: Partial<Vehicle>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Alerts
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  dismissAlert: (id: string) => void;

  // Settings & Reset
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToDemoDefaults: () => void;

  // Simulation
  simulationActive: boolean;
  toggleSimulation: (active?: boolean) => void;
  stepSimulation: () => void;
  lastSimulationTick: Date | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => StorageService.getCurrentUser());
  const [bins, setBins] = useState<SmartBin[]>(() => StorageService.getBins());
  const [requests, setRequests] = useState<CollectionRequest[]>(() => StorageService.getRequests());
  const [workers, setWorkers] = useState<Worker[]>(() => StorageService.getWorkers());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => StorageService.getVehicles());
  const [routes, setRoutes] = useState<CollectionRoute[]>(() => StorageService.getRoutes());
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => StorageService.getAlerts());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  
  const [simulationActive, setSimulationActive] = useState<boolean>(() => settings.simulationActive);
  const [lastSimulationTick, setLastSimulationTick] = useState<Date | null>(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const simulationIntervalRef = useRef<number | null>(null);

  // Sync state to localStorage on changes
  useEffect(() => { StorageService.saveBins(bins); }, [bins]);
  useEffect(() => { StorageService.saveRequests(requests); }, [requests]);
  useEffect(() => { StorageService.saveWorkers(workers); }, [workers]);
  useEffect(() => { StorageService.saveVehicles(vehicles); }, [vehicles]);
  useEffect(() => { StorageService.saveRoutes(routes); }, [routes]);
  useEffect(() => { StorageService.saveAlerts(alerts); }, [alerts]);
  useEffect(() => { StorageService.saveSettings(settings); }, [settings]);
  useEffect(() => { StorageService.saveCurrentUser(currentUser); }, [currentUser]);

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast helpers
  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    addToast('info', 'Active User Switched', `Logged in as ${user.name} (${user.role.toUpperCase()})`);
  };

  // Bin Management
  const addBin = (binData: Partial<SmartBin>) => {
    const newId = `BIN-${100 + bins.length + 1}`;
    const fill = binData.fillLevel ?? 10;
    const height = binData.heightCm ?? 120;
    const distanceCm = Math.max(2, Math.round(height * (1 - fill / 100)));
    const timestamp = new Date().toISOString();

    const newBin: SmartBin = {
      id: binData.id || newId,
      name: binData.name || `Smart Bin ${newId}`,
      category: binData.category || 'General',
      zone: binData.zone || 'Downtown Core',
      address: binData.address || 'Central Plaza, Street Level',
      lat: binData.lat || 37.7749 + (Math.random() - 0.5) * 0.02,
      lng: binData.lng || -122.4194 + (Math.random() - 0.5) * 0.02,
      fillLevel: fill,
      connectivity: binData.connectivity || 'online',
      lastUpdate: timestamp,
      batteryLevel: binData.batteryLevel ?? 95,
      priority: fill >= settings.criticalThreshold ? 'Critical' : fill >= settings.highThreshold ? 'High' : 'Low',
      lastCollectionDate: timestamp,
      status: fill >= settings.criticalThreshold ? 'critical' : fill >= settings.highThreshold ? 'high' : 'normal',
      heightCm: height,
      sensorHistory: [
        { timestamp, fillLevel: fill, batteryLevel: 95, distanceCm }
      ],
      notes: binData.notes || ''
    };

    setBins(prev => [newBin, ...prev]);
    addToast('success', 'Smart Bin Added', `${newBin.name} (${newBin.id}) registered successfully.`);
  };

  const updateBin = (id: string, updates: Partial<SmartBin>) => {
    setBins(prev => prev.map(bin => {
      if (bin.id === id) {
        return { ...bin, ...updates, lastUpdate: new Date().toISOString() };
      }
      return bin;
    }));
    addToast('info', 'Bin Updated', `Changes to ${id} have been saved.`);
  };

  const deleteBin = (id: string) => {
    setBins(prev => prev.filter(bin => bin.id !== id));
    addToast('warning', 'Bin Removed', `Bin ${id} removed from system.`);
  };

  const emptyBin = (id: string) => {
    const timestamp = new Date().toISOString();
    setBins(prev => prev.map(bin => {
      if (bin.id === id) {
        return {
          ...bin,
          fillLevel: 0,
          status: 'normal',
          priority: 'Low',
          lastCollectionDate: timestamp,
          lastUpdate: timestamp,
          sensorHistory: [
            ...(bin.sensorHistory || []),
            { timestamp, fillLevel: 0, batteryLevel: bin.batteryLevel, distanceCm: bin.heightCm }
          ]
        };
      }
      return bin;
    }));

    // Auto-complete any active collection request for this bin
    setRequests(prev => prev.map(req => {
      if (req.binId === id && req.status !== 'Completed' && req.status !== 'Cancelled') {
        return {
          ...req,
          status: 'Completed',
          timeline: [
            ...req.timeline,
            {
              timestamp,
              action: 'Marked Completed via Bin Empty action',
              actor: currentUser.name
            }
          ]
        };
      }
      return req;
    }));

    addToast('success', 'Bin Emptied', `Bin ${id} collection completed. Fill reset to 0%.`);
  };

  const simulateBinReading = (id: string, fill: number, battery?: number, conn?: SensorConnectivity) => {
    setBins(prev => prev.map(bin => {
      if (bin.id === id) {
        return SimulationEngine.manualTelemetry(bin, fill, battery, conn);
      }
      return bin;
    }));
    addToast('info', 'Telemetry Updated', `Manual sensor reading applied to ${id} (${fill}%).`);
  };

  // Requests
  const createRequest = (reqData: Partial<CollectionRequest>) => {
    const id = `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = new Date().toISOString();
    
    const newReq: CollectionRequest = {
      id,
      binId: reqData.binId || 'BIN-GENERIC',
      binName: reqData.binName || 'Manual Pickup Location',
      location: reqData.location || 'Civic Center',
      zone: reqData.zone || 'Downtown Core',
      category: reqData.category || 'General',
      priority: reqData.priority || 'Medium',
      createdAt: timestamp,
      scheduledDate: reqData.scheduledDate || new Date(Date.now() + 4 * 3600000).toISOString(),
      assignedWorkerId: reqData.assignedWorkerId,
      assignedWorkerName: reqData.assignedWorkerName,
      assignedVehicleId: reqData.assignedVehicleId,
      assignedVehicleName: reqData.assignedVehicleName,
      status: reqData.assignedWorkerId ? 'Assigned' : 'Pending',
      notes: reqData.notes || '',
      timeline: [
        {
          timestamp,
          action: 'Request Created',
          actor: currentUser.name,
          note: reqData.notes
        }
      ]
    };

    setRequests(prev => [newReq, ...prev]);
    addToast('success', 'Request Created', `Collection request ${id} created.`);
  };

  const updateRequestStatus = (id: string, newStatus: RequestStatus, note?: string) => {
    const timestamp = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        // If completed, trigger emptying the bin if valid
        if (newStatus === 'Completed' && req.binId) {
          emptyBin(req.binId);
        }
        return {
          ...req,
          status: newStatus,
          timeline: [
            ...req.timeline,
            {
              timestamp,
              action: `Status changed to ${newStatus}`,
              actor: currentUser.name,
              note
            }
          ]
        };
      }
      return req;
    }));
    addToast('info', 'Request Updated', `Request ${id} status set to ${newStatus}.`);
  };

  const assignRequest = (id: string, workerId: string, vehicleId: string) => {
    const worker = workers.find(w => w.id === workerId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const timestamp = new Date().toISOString();

    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          assignedWorkerId: workerId,
          assignedWorkerName: worker?.name,
          assignedVehicleId: vehicleId,
          assignedVehicleName: vehicle ? `${vehicle.regNumber} (${vehicle.type})` : undefined,
          status: 'Assigned',
          timeline: [
            ...req.timeline,
            {
              timestamp,
              action: `Assigned to ${worker?.name || workerId} with ${vehicle?.regNumber || vehicleId}`,
              actor: currentUser.name
            }
          ]
        };
      }
      return req;
    }));

    // Update worker status if available
    if (worker) {
      setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, availability: 'On Route' } : w));
    }
    if (vehicle) {
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'In Service', assignedWorkerId: workerId, assignedWorkerName: worker?.name } : v));
    }

    addToast('success', 'Request Assigned', `Assigned ${id} to ${worker?.name || 'worker'}.`);
  };

  const cancelRequest = (id: string, reason?: string) => {
    const timestamp = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Cancelled',
          timeline: [
            ...req.timeline,
            {
              timestamp,
              action: `Request Cancelled`,
              actor: currentUser.name,
              note: reason || 'Cancelled by dispatcher'
            }
          ]
        };
      }
      return req;
    }));
    addToast('warning', 'Request Cancelled', `Collection request ${id} has been cancelled.`);
  };

  // Route operations
  const createRoute = (routeData: Partial<CollectionRoute>) => {
    const id = `ROT-${200 + routes.length + 1}`;
    const newRoute: CollectionRoute = {
      id,
      name: routeData.name || `Route ${id}`,
      zone: routeData.zone || 'Downtown Core',
      vehicleId: routeData.vehicleId || 'VEH-01',
      vehicleName: routeData.vehicleName || 'ECO-TRK-701',
      driverId: routeData.driverId || 'WRK-01',
      driverName: routeData.driverName || 'Elena Rostova',
      status: routeData.status || 'Scheduled',
      stops: routeData.stops || [],
      estimatedDistanceKm: routeData.estimatedDistanceKm || 6.5,
      estimatedDurationMins: routeData.estimatedDurationMins || 40,
      startTime: routeData.startTime
    };

    setRoutes(prev => [newRoute, ...prev]);
    addToast('success', 'Route Created', `Collection route ${newRoute.name} added.`);
  };

  const updateRoute = (id: string, updates: Partial<CollectionRoute>) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    addToast('info', 'Route Updated', `Route ${id} updated.`);
  };

  const toggleRouteStop = (routeId: string, stopId: string) => {
    setRoutes(prev => prev.map(route => {
      if (route.id === routeId) {
        const updatedStops = route.stops.map(stop => {
          if (stop.id === stopId) {
            const willBeCompleted = !stop.completed;
            if (willBeCompleted && stop.binId) {
              emptyBin(stop.binId);
            }
            return {
              ...stop,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : undefined
            };
          }
          return stop;
        });

        const allDone = updatedStops.every(s => s.completed);
        return {
          ...route,
          stops: updatedStops,
          status: allDone ? 'Completed' : 'In Progress'
        };
      }
      return route;
    }));
  };

  const deleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
    addToast('warning', 'Route Removed', `Route ${id} was deleted.`);
  };

  // Workers & Vehicles
  const addWorker = (workerData: Partial<Worker>) => {
    const id = `WRK-${10 + workers.length + 1}`;
    const newWorker: Worker = {
      id,
      name: workerData.name || 'New Worker',
      phone: workerData.phone || '+1 (555) 000-0000',
      email: workerData.email || 'worker@ecotrack.city',
      zone: workerData.zone || 'Downtown Core',
      availability: workerData.availability || 'Available',
      completedCollections: 0,
      avatar: workerData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setWorkers(prev => [...prev, newWorker]);
    addToast('success', 'Worker Added', `${newWorker.name} added to roster.`);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    addToast('info', 'Worker Updated', `Profile updated for ${id}.`);
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    addToast('warning', 'Worker Removed', `Worker ${id} removed.`);
  };

  const addVehicle = (vehData: Partial<Vehicle>) => {
    const id = `VEH-${10 + vehicles.length + 1}`;
    const newVeh: Vehicle = {
      id,
      regNumber: vehData.regNumber || `ECO-VEH-${id.slice(-2)}`,
      type: vehData.type || 'Electric Van',
      capacityKg: vehData.capacityKg || 1500,
      currentLoadKg: 0,
      status: vehData.status || 'Idle',
      fuelBatteryPct: vehData.fuelBatteryPct ?? 100,
      zone: vehData.zone || 'Downtown Core'
    };
    setVehicles(prev => [...prev, newVeh]);
    addToast('success', 'Vehicle Added', `${newVeh.regNumber} registered.`);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    addToast('info', 'Vehicle Updated', `Vehicle ${id} details updated.`);
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    addToast('warning', 'Vehicle Removed', `Vehicle ${id} decommissioned.`);
  };

  // Alerts
  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    addToast('info', 'Alerts Marked Read', 'All notifications marked as read.');
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      setSimulationActive(next.simulationActive);
      return next;
    });
    addToast('success', 'Settings Saved', 'Configuration preferences saved.');
  };

  const resetToDemoDefaults = () => {
    StorageService.resetAll();
    setBins(INITIAL_BINS);
    setRequests(INITIAL_REQUESTS);
    setWorkers(INITIAL_WORKERS);
    setVehicles(INITIAL_VEHICLES);
    setRoutes(INITIAL_ROUTES);
    setAlerts(INITIAL_ALERTS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUserState(INITIAL_USERS[0]);
    addToast('info', 'Demo Data Reset', 'All records restored to initial demo benchmark.');
  };

  // Simulation step
  const stepSimulation = () => {
    const result = SimulationEngine.tick(bins, requests, alerts, settings);
    setBins(result.updatedBins);
    
    if (result.newAlerts.length > 0) {
      setAlerts(prev => [...result.newAlerts, ...prev]);
      result.newAlerts.forEach(a => {
        addToast(a.severity === 'critical' ? 'error' : 'warning', a.title, a.message);
      });
    }

    if (result.newRequests.length > 0) {
      setRequests(prev => [...result.newRequests, ...prev]);
      addToast('info', 'Auto-Collection Triggered', `${result.newRequests.length} pickup requests recommended.`);
    }

    setLastSimulationTick(new Date());
  };

  const toggleSimulation = (active?: boolean) => {
    const nextVal = active !== undefined ? active : !simulationActive;
    setSimulationActive(nextVal);
    updateSettings({ simulationActive: nextVal });
    addToast('info', nextVal ? 'IoT Simulator Active' : 'IoT Simulator Paused', nextVal ? `Sampling telemetry every ${settings.simulationIntervalSecs}s` : 'Background telemetry paused.');
  };

  // Background simulation runner
  useEffect(() => {
    if (!simulationActive) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(3000, (settings.simulationIntervalSecs || 10) * 1000);
    simulationIntervalRef.current = window.setInterval(() => {
      stepSimulation();
    }, intervalMs);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [simulationActive, settings.simulationIntervalSecs, bins, requests, alerts, settings]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: INITIAL_USERS,
        bins,
        requests,
        workers,
        vehicles,
        routes,
        alerts,
        settings,
        toasts,
        addToast,
        removeToast,
        addBin,
        updateBin,
        deleteBin,
        emptyBin,
        simulateBinReading,
        createRequest,
        updateRequestStatus,
        assignRequest,
        cancelRequest,
        createRoute,
        updateRoute,
        toggleRouteStop,
        deleteRoute,
        addWorker,
        updateWorker,
        deleteWorker,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        markAlertRead,
        markAllAlertsRead,
        dismissAlert,
        updateSettings,
        resetToDemoDefaults,
        simulationActive,
        toggleSimulation,
        stepSimulation,
        lastSimulationTick
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
