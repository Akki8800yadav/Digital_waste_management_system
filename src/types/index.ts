export type UserRole = 'admin' | 'manager' | 'worker';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  zone?: string;
}

export type WasteCategory = 'Organic' | 'Recyclable' | 'General' | 'Hazardous';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type BinStatus = 'normal' | 'moderate' | 'high' | 'critical' | 'offline';

export type SensorConnectivity = 'online' | 'offline' | 'weak';

export interface SensorReading {
  timestamp: string;
  fillLevel: number;
  batteryLevel: number;
  distanceCm: number;
  temperatureC?: number;
}

export interface SmartBin {
  id: string;
  name: string;
  category: WasteCategory;
  zone: string;
  address: string;
  lat: number;
  lng: number;
  fillLevel: number; // 0 - 100%
  connectivity: SensorConnectivity;
  lastUpdate: string;
  batteryLevel: number; // 0 - 100%
  priority: PriorityLevel;
  lastCollectionDate: string;
  status: BinStatus;
  heightCm: number; // bin total physical depth
  sensorHistory: SensorReading[];
  notes?: string;
}

export type RequestStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface RequestTimelineEvent {
  timestamp: string;
  action: string;
  actor: string;
  note?: string;
}

export interface CollectionRequest {
  id: string;
  binId: string;
  binName: string;
  location: string;
  zone: string;
  category: WasteCategory;
  priority: PriorityLevel;
  createdAt: string;
  scheduledDate: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  status: RequestStatus;
  notes?: string;
  timeline: RequestTimelineEvent[];
}

export type WorkerAvailability = 'Available' | 'On Route' | 'Off Duty';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  availability: WorkerAvailability;
  assignedRouteId?: string;
  completedCollections: number;
  avatar?: string;
}

export type VehicleStatus = 'In Service' | 'Maintenance' | 'Idle';
export type VehicleType = 'Compactor Truck' | 'Electric Van' | 'Recycling Tipper' | 'Light Hauler';

export interface Vehicle {
  id: string;
  regNumber: string;
  type: VehicleType;
  capacityKg: number;
  currentLoadKg: number;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  status: VehicleStatus;
  fuelBatteryPct: number;
  assignedRouteId?: string;
  zone: string;
}

export interface RouteStop {
  id: string;
  binId: string;
  binName: string;
  address: string;
  lat: number;
  lng: number;
  category: WasteCategory;
  fillLevel: number;
  completed: boolean;
  completedAt?: string;
}

export type RouteStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Draft';

export interface CollectionRoute {
  id: string;
  name: string;
  zone: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  status: RouteStatus;
  stops: RouteStop[];
  estimatedDistanceKm: number;
  estimatedDurationMins: number;
  startTime?: string;
  completedTime?: string;
}

export type AlertType = 'critical_fill' | 'offline_sensor' | 'low_battery' | 'overdue_collection' | 'unassigned_request';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetType: 'bin' | 'request' | 'route' | 'system';
  targetId?: string;
}

export interface AppSettings {
  orgName: string;
  theme: 'light' | 'dark' | 'system';
  normalThreshold: number; // default 50
  moderateThreshold: number; // default 75
  highThreshold: number; // default 90
  criticalThreshold: number; // default 95
  autoRecommendCollection: boolean;
  simulationIntervalSecs: number;
  simulationActive: boolean;
  zones: string[];
  wasteCategories: WasteCategory[];
}
