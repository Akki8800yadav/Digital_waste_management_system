import { 
  SmartBin, 
  CollectionRequest, 
  Worker, 
  Vehicle, 
  CollectionRoute, 
  SystemAlert, 
  AppSettings,
  User
} from '../types';

const STORAGE_KEYS = {
  BINS: 'ecotrack_bins_v1',
  REQUESTS: 'ecotrack_requests_v1',
  WORKERS: 'ecotrack_workers_v1',
  VEHICLES: 'ecotrack_vehicles_v1',
  ROUTES: 'ecotrack_routes_v1',
  ALERTS: 'ecotrack_alerts_v1',
  SETTINGS: 'ecotrack_settings_v1',
  CURRENT_USER: 'ecotrack_user_v1'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-01',
    name: 'Dr. Sarah Mitchell',
    role: 'admin',
    email: 'admin.mitchell@ecotrack.city',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    zone: 'All Zones'
  },
  {
    id: 'USR-02',
    name: 'Marcus Vance',
    role: 'manager',
    email: 'm.vance@ecotrack.city',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    zone: 'Downtown Core & Metro Tech'
  },
  {
    id: 'USR-03',
    name: 'Elena Rostova',
    role: 'worker',
    email: 'e.rostova@ecotrack.city',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    zone: 'Downtown Core'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  orgName: 'Metro Clean City Operations',
  theme: 'light',
  normalThreshold: 50,
  moderateThreshold: 75,
  highThreshold: 85,
  criticalThreshold: 92,
  autoRecommendCollection: true,
  simulationIntervalSecs: 10,
  simulationActive: true,
  zones: ['Downtown Core', 'Metro Tech Hub', 'Green Valley', 'Harbor District', 'Riverside Campus'],
  wasteCategories: ['General', 'Recyclable', 'Organic', 'Hazardous']
};

export const INITIAL_BINS: SmartBin[] = [
  {
    id: 'BIN-101',
    name: 'Central Plaza Recyclable Bin',
    category: 'Recyclable',
    zone: 'Downtown Core',
    address: '450 Civic Center Way, Plaza North',
    lat: 37.7749,
    lng: -122.4194,
    fillLevel: 94,
    connectivity: 'online',
    lastUpdate: new Date(Date.now() - 3 * 60000).toISOString(),
    batteryLevel: 88,
    priority: 'Critical',
    lastCollectionDate: new Date(Date.now() - 36 * 3600000).toISOString(),
    status: 'critical',
    heightCm: 120,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), fillLevel: 45, batteryLevel: 92, distanceCm: 66 },
      { timestamp: new Date(Date.now() - 16 * 3600000).toISOString(), fillLevel: 65, batteryLevel: 90, distanceCm: 42 },
      { timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), fillLevel: 82, batteryLevel: 89, distanceCm: 22 },
      { timestamp: new Date(Date.now() - 3 * 60000).toISOString(), fillLevel: 94, batteryLevel: 88, distanceCm: 7 }
    ],
    notes: 'Heavy foot traffic near subway entrance.'
  },
  {
    id: 'BIN-102',
    name: 'Tech District Organic Station',
    category: 'Organic',
    zone: 'Metro Tech Hub',
    address: '102 Innovation Blvd, Building C',
    lat: 37.7833,
    lng: -122.4167,
    fillLevel: 86,
    connectivity: 'online',
    lastUpdate: new Date(Date.now() - 5 * 60000).toISOString(),
    batteryLevel: 72,
    priority: 'High',
    lastCollectionDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: 'high',
    heightCm: 100,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), fillLevel: 50, batteryLevel: 75, distanceCm: 50 },
      { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), fillLevel: 86, batteryLevel: 72, distanceCm: 14 }
    ],
    notes: 'Cafeteria output bin.'
  },
  {
    id: 'BIN-103',
    name: 'Market Street General Waste',
    category: 'General',
    zone: 'Downtown Core',
    address: '880 Market Street, Near Transit Kiosk',
    lat: 37.7850,
    lng: -122.4070,
    fillLevel: 76,
    connectivity: 'online',
    lastUpdate: new Date(Date.now() - 8 * 60000).toISOString(),
    batteryLevel: 95,
    priority: 'Medium',
    lastCollectionDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    status: 'moderate',
    heightCm: 130,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 10 * 3600000).toISOString(), fillLevel: 55, batteryLevel: 96, distanceCm: 58 },
      { timestamp: new Date(Date.now() - 8 * 60000).toISOString(), fillLevel: 76, batteryLevel: 95, distanceCm: 31 }
    ]
  },
  {
    id: 'BIN-104',
    name: 'Harbor Pier E-Waste & Hazardous',
    category: 'Hazardous',
    zone: 'Harbor District',
    address: 'Pier 14 Terminal South Gate',
    lat: 37.7925,
    lng: -122.3910,
    fillLevel: 38,
    connectivity: 'weak',
    lastUpdate: new Date(Date.now() - 25 * 60000).toISOString(),
    batteryLevel: 19,
    priority: 'Low',
    lastCollectionDate: new Date(Date.now() - 96 * 3600000).toISOString(),
    status: 'normal',
    heightCm: 90,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 25 * 60000).toISOString(), fillLevel: 38, batteryLevel: 19, distanceCm: 56 }
    ],
    notes: 'Low battery telemetry alert pending battery swap.'
  },
  {
    id: 'BIN-105',
    name: 'University Quad Recyclable Hub',
    category: 'Recyclable',
    zone: 'Riverside Campus',
    address: '700 University Way, Science Quad',
    lat: 37.7600,
    lng: -122.4400,
    fillLevel: 97,
    connectivity: 'online',
    lastUpdate: new Date(Date.now() - 2 * 60000).toISOString(),
    batteryLevel: 64,
    priority: 'Critical',
    lastCollectionDate: new Date(Date.now() - 48 * 3600000).toISOString(),
    status: 'critical',
    heightCm: 120,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 15 * 3600000).toISOString(), fillLevel: 70, batteryLevel: 68, distanceCm: 36 },
      { timestamp: new Date(Date.now() - 2 * 60000).toISOString(), fillLevel: 97, batteryLevel: 64, distanceCm: 4 }
    ],
    notes: 'Overflow risk detected. Recommend expedited collection.'
  },
  {
    id: 'BIN-106',
    name: 'Green Valley Park Organic Bin',
    category: 'Organic',
    zone: 'Green Valley',
    address: '210 Meadowland Ave, Pavilion West',
    lat: 37.7690,
    lng: -122.4600,
    fillLevel: 42,
    connectivity: 'online',
    lastUpdate: new Date(Date.now() - 12 * 60000).toISOString(),
    batteryLevel: 82,
    priority: 'Low',
    lastCollectionDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    status: 'normal',
    heightCm: 110,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 12 * 60000).toISOString(), fillLevel: 42, batteryLevel: 82, distanceCm: 64 }
    ]
  },
  {
    id: 'BIN-107',
    name: 'South Financial General Bin',
    category: 'General',
    zone: 'Downtown Core',
    address: '333 Pine St, Courtyard entrance',
    lat: 37.7910,
    lng: -122.4020,
    fillLevel: 91,
    connectivity: 'offline',
    lastUpdate: new Date(Date.now() - 180 * 60000).toISOString(),
    batteryLevel: 14,
    priority: 'High',
    lastCollectionDate: new Date(Date.now() - 52 * 3600000).toISOString(),
    status: 'critical',
    heightCm: 120,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 180 * 60000).toISOString(), fillLevel: 91, batteryLevel: 14, distanceCm: 11 }
    ],
    notes: 'Sensor offline for > 3 hours. Signal check needed.'
  },
  {
    id: 'BIN-108',
    name: 'Tech Campus West Recyclables',
    category: 'Recyclable',
    zone: 'Metro Tech Hub',
    address: '550 Semiconductor Dr, Gate 4',
    lat: 37.7810,
    lng: -122.4220,
    fillLevel: 62,
    connectivity: 'online',
    lastUpdate: new Date(Date.now() - 6 * 60000).toISOString(),
    batteryLevel: 91,
    priority: 'Medium',
    lastCollectionDate: new Date(Date.now() - 20 * 3600000).toISOString(),
    status: 'moderate',
    heightCm: 115,
    sensorHistory: [
      { timestamp: new Date(Date.now() - 6 * 60000).toISOString(), fillLevel: 62, batteryLevel: 91, distanceCm: 44 }
    ]
  }
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'WRK-01',
    name: 'Elena Rostova',
    phone: '+1 (555) 234-8901',
    email: 'e.rostova@ecotrack.city',
    zone: 'Downtown Core',
    availability: 'On Route',
    assignedRouteId: 'ROT-101',
    completedCollections: 142,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'WRK-02',
    name: 'David Chen',
    phone: '+1 (555) 892-4112',
    email: 'd.chen@ecotrack.city',
    zone: 'Metro Tech Hub',
    availability: 'Available',
    completedCollections: 98,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'WRK-03',
    name: 'Amara Okafor',
    phone: '+1 (555) 761-9034',
    email: 'a.okafor@ecotrack.city',
    zone: 'Riverside Campus',
    availability: 'Available',
    completedCollections: 215,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'WRK-04',
    name: 'Mateo Morales',
    phone: '+1 (555) 438-1290',
    email: 'm.morales@ecotrack.city',
    zone: 'Green Valley',
    availability: 'Off Duty',
    completedCollections: 67,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-01',
    regNumber: 'ECO-TRK-701',
    type: 'Compactor Truck',
    capacityKg: 4500,
    currentLoadKg: 2850,
    assignedWorkerId: 'WRK-01',
    assignedWorkerName: 'Elena Rostova',
    status: 'In Service',
    fuelBatteryPct: 78,
    assignedRouteId: 'ROT-101',
    zone: 'Downtown Core'
  },
  {
    id: 'VEH-02',
    regNumber: 'ECO-VAN-204',
    type: 'Electric Van',
    capacityKg: 1200,
    currentLoadKg: 350,
    assignedWorkerId: 'WRK-02',
    assignedWorkerName: 'David Chen',
    status: 'Idle',
    fuelBatteryPct: 92,
    zone: 'Metro Tech Hub'
  },
  {
    id: 'VEH-03',
    regNumber: 'ECO-TIP-309',
    type: 'Recycling Tipper',
    capacityKg: 3000,
    currentLoadKg: 0,
    status: 'Idle',
    fuelBatteryPct: 85,
    zone: 'Riverside Campus'
  },
  {
    id: 'VEH-04',
    regNumber: 'ECO-HAUL-102',
    type: 'Light Hauler',
    capacityKg: 850,
    currentLoadKg: 0,
    status: 'Maintenance',
    fuelBatteryPct: 40,
    zone: 'Harbor District'
  }
];

export const INITIAL_REQUESTS: CollectionRequest[] = [
  {
    id: 'REQ-2026-081',
    binId: 'BIN-101',
    binName: 'Central Plaza Recyclable Bin',
    location: '450 Civic Center Way, Plaza North',
    zone: 'Downtown Core',
    category: 'Recyclable',
    priority: 'Critical',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    scheduledDate: new Date(Date.now() + 2 * 3600000).toISOString(),
    assignedWorkerId: 'WRK-01',
    assignedWorkerName: 'Elena Rostova',
    assignedVehicleId: 'VEH-01',
    assignedVehicleName: 'ECO-TRK-701 (Compactor Truck)',
    status: 'In Progress',
    notes: 'Priority dispatch triggered automatically by 94% fill threshold.',
    timeline: [
      { timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), action: 'Request Generated', actor: 'System Auto-Trigger' },
      { timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), action: 'Assigned to Elena Rostova', actor: 'Marcus Vance' },
      { timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Collection Started', actor: 'Elena Rostova' }
    ]
  },
  {
    id: 'REQ-2026-082',
    binId: 'BIN-105',
    binName: 'University Quad Recyclable Hub',
    location: '700 University Way, Science Quad',
    zone: 'Riverside Campus',
    category: 'Recyclable',
    priority: 'Critical',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    scheduledDate: new Date(Date.now() + 4 * 3600000).toISOString(),
    assignedWorkerId: 'WRK-03',
    assignedWorkerName: 'Amara Okafor',
    assignedVehicleId: 'VEH-03',
    assignedVehicleName: 'ECO-TIP-309 (Recycling Tipper)',
    status: 'Assigned',
    notes: 'Student festival waste surge.',
    timeline: [
      { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Request Generated', actor: 'System Auto-Trigger' },
      { timestamp: new Date(Date.now() - 30 * 60000).toISOString(), action: 'Assigned to Amara Okafor', actor: 'Dr. Sarah Mitchell' }
    ]
  },
  {
    id: 'REQ-2026-083',
    binId: 'BIN-102',
    binName: 'Tech District Organic Station',
    location: '102 Innovation Blvd, Building C',
    zone: 'Metro Tech Hub',
    category: 'Organic',
    priority: 'High',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    scheduledDate: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: 'Pending',
    notes: 'Organic bin reached 86% fill level. Unassigned.',
    timeline: [
      { timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Request Created', actor: 'System Auto-Trigger' }
    ]
  },
  {
    id: 'REQ-2026-079',
    binId: 'BIN-103',
    binName: 'Market Street General Waste',
    location: '880 Market Street',
    zone: 'Downtown Core',
    category: 'General',
    priority: 'Medium',
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    scheduledDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    assignedWorkerId: 'WRK-01',
    assignedWorkerName: 'Elena Rostova',
    assignedVehicleId: 'VEH-01',
    assignedVehicleName: 'ECO-TRK-701',
    status: 'Completed',
    notes: 'Completed on morning shift schedule.',
    timeline: [
      { timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), action: 'Request Created', actor: 'Marcus Vance' },
      { timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), action: 'Assigned to Elena Rostova', actor: 'Marcus Vance' },
      { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Completed & Bin Reset to 0%', actor: 'Elena Rostova' }
    ]
  }
];

export const INITIAL_ROUTES: CollectionRoute[] = [
  {
    id: 'ROT-101',
    name: 'Downtown Commercial Express',
    zone: 'Downtown Core',
    vehicleId: 'VEH-01',
    vehicleName: 'ECO-TRK-701',
    driverId: 'WRK-01',
    driverName: 'Elena Rostova',
    status: 'In Progress',
    stops: [
      {
        id: 'STP-1',
        binId: 'BIN-103',
        binName: 'Market Street General Waste',
        address: '880 Market Street',
        lat: 37.7850,
        lng: -122.4070,
        category: 'General',
        fillLevel: 76,
        completed: true,
        completedAt: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: 'STP-2',
        binId: 'BIN-101',
        binName: 'Central Plaza Recyclable Bin',
        address: '450 Civic Center Way',
        lat: 37.7749,
        lng: -122.4194,
        category: 'Recyclable',
        fillLevel: 94,
        completed: false
      },
      {
        id: 'STP-3',
        binId: 'BIN-107',
        binName: 'South Financial General Bin',
        address: '333 Pine St',
        lat: 37.7910,
        lng: -122.4020,
        category: 'General',
        fillLevel: 91,
        completed: false
      }
    ],
    estimatedDistanceKm: 8.4,
    estimatedDurationMins: 45,
    startTime: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: 'ROT-102',
    name: 'Innovation & Campus Route',
    zone: 'Metro Tech Hub',
    vehicleId: 'VEH-02',
    vehicleName: 'ECO-VAN-204',
    driverId: 'WRK-02',
    driverName: 'David Chen',
    status: 'Scheduled',
    stops: [
      {
        id: 'STP-4',
        binId: 'BIN-102',
        binName: 'Tech District Organic Station',
        address: '102 Innovation Blvd',
        lat: 37.7833,
        lng: -122.4167,
        category: 'Organic',
        fillLevel: 86,
        completed: false
      },
      {
        id: 'STP-5',
        binId: 'BIN-108',
        binName: 'Tech Campus West Recyclables',
        address: '550 Semiconductor Dr',
        lat: 37.7810,
        lng: -122.4220,
        category: 'Recyclable',
        fillLevel: 62,
        completed: false
      }
    ],
    estimatedDistanceKm: 5.2,
    estimatedDurationMins: 30
  }
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'ALT-1',
    type: 'critical_fill',
    severity: 'critical',
    title: 'Critical Fill Level (97%)',
    message: 'University Quad Recyclable Hub (BIN-105) has exceeded the critical capacity threshold.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false,
    targetType: 'bin',
    targetId: 'BIN-105'
  },
  {
    id: 'ALT-2',
    type: 'offline_sensor',
    severity: 'warning',
    title: 'Sensor Connectivity Lost',
    message: 'South Financial General Bin (BIN-107) has missed 4 consecutive telemetry heartbeats.',
    timestamp: new Date(Date.now() - 95 * 60000).toISOString(),
    read: false,
    targetType: 'bin',
    targetId: 'BIN-107'
  },
  {
    id: 'ALT-3',
    type: 'low_battery',
    severity: 'warning',
    title: 'Low Battery Alert (19%)',
    message: 'Harbor Pier E-Waste (BIN-104) sensor battery is approaching depletion.',
    timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
    read: true,
    targetType: 'bin',
    targetId: 'BIN-104'
  },
  {
    id: 'ALT-4',
    type: 'unassigned_request',
    severity: 'info',
    title: 'High Priority Request Unassigned',
    message: 'Collection request REQ-2026-083 requires driver and vehicle dispatch.',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    read: false,
    targetType: 'request',
    targetId: 'REQ-2026-083'
  }
];

// Storage Helper Functions with safe error handling
export const StorageService = {
  getBins(): SmartBin[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BINS);
      return data ? JSON.parse(data) : INITIAL_BINS;
    } catch {
      return INITIAL_BINS;
    }
  },
  saveBins(bins: SmartBin[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BINS, JSON.stringify(bins));
    } catch (e) {
      console.error('Failed to save bins to localStorage', e);
    }
  },

  getRequests(): CollectionRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return data ? JSON.parse(data) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  },
  saveRequests(requests: CollectionRequest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save requests to localStorage', e);
    }
  },

  getWorkers(): Worker[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKERS);
      return data ? JSON.parse(data) : INITIAL_WORKERS;
    } catch {
      return INITIAL_WORKERS;
    }
  },
  saveWorkers(workers: Worker[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    } catch (e) {
      console.error('Failed to save workers to localStorage', e);
    }
  },

  getVehicles(): Vehicle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return data ? JSON.parse(data) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  },
  saveVehicles(vehicles: Vehicle[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Failed to save vehicles to localStorage', e);
    }
  },

  getRoutes(): CollectionRoute[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTES);
      return data ? JSON.parse(data) : INITIAL_ROUTES;
    } catch {
      return INITIAL_ROUTES;
    }
  },
  saveRoutes(routes: CollectionRoute[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
    } catch (e) {
      console.error('Failed to save routes to localStorage', e);
    }
  },

  getAlerts(): SystemAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  },
  saveAlerts(alerts: SystemAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts to localStorage', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  },
  saveCurrentUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  },

  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.BINS);
      localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.WORKERS);
      localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      localStorage.removeItem(STORAGE_KEYS.ROUTES);
      localStorage.removeItem(STORAGE_KEYS.ALERTS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Failed to reset localStorage', e);
    }
  }
};
