# EcoTrack — Digital Waste Management System

A smart-city municipal waste management platform built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Leaflet**. EcoTrack optimizes urban waste collection efficiency through IoT-inspired ultrasonic bin depth monitoring, automatic fill-level threshold alerts, smart collection scheduling, field crew & fleet dispatching, and interactive route waypoint sequencing.

---

## 🌟 Key Modules & Features

### 1. 📊 Operational Overview Dashboard (`OverviewPage.tsx`)
- **Key Performance Indicators (KPIs)**: Total registered smart bins, units requiring immediate pickup, critical/offline nodes, pending dispatch requests, completed pickups today, and operational fulfillment rate.
- **Dynamic Activity Chart**: Visual comparison between completed pickups and pending queues across selectable time horizons (7 Days, 30 Days, 90 Days).
- **Waste Composition Breakdown**: Recyclable, Organic, General, and Hazardous material volume shares.
- **Fill Distribution Matrix**: Real-time bin counts across capacity tiers (*Normal <50%*, *Moderate 50–75%*, *High 75–92%*, *Critical >92%*).
- **Urgent Incident Triage**: Immediate link-outs to critical alerts and active collection routes.
- **District Performance Summary**: Zone-level average fill capacity and dispatch workorder tracking.

### 2. 🗑️ Smart Bin Inventory & IoT Telemetry (`SmartBinsPage.tsx`)
- **Node Tracking**: Unique Bin ID, physical location, municipal zone, waste classification, and GPS coordinates.
- **Ultrasonic Fill Gauges**: Accessible color-coded progress indicators displaying percentage capacity and remaining depth in centimeters (*calculated from physical bin height*).
- **Multi-Factor Filters**: Filter by waste category, zone, connectivity state, and fill level range. Column sorting on ID, Fill Level, Battery, and Last Update.
- **Node Actions**: Register new bins, edit dimensions, trigger manual collection emptying (*resets fill to 0% and marks active workorders complete*), and inspect historical telemetry streams.
- **CSV Data Export**: One-click export of current filtered bin records to CSV.

### 3. 📋 Collection Dispatch & Work Orders (`CollectionRequestsPage.tsx`)
- **Lifecycle Management**: Structured state transitions (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Completed` or `Cancelled`).
- **Field Crew & Fleet Pairing**: Modal interface to assign certified drivers and appropriate compactor trucks / electric vans.
- **Overdue SLA Highlights**: Visual indicators and badges for requests exceeding scheduled pickup windows.
- **Audit Log Timeline**: Chronological event history detailing who created, assigned, or completed each collection order.

### 4. 🗺️ Collection Route Planner & Waypoint Checklist (`CollectionRoutesPage.tsx`)
- **Interactive Leaflet Mapping**: Visualizes collection stops on an interactive OpenStreetMap canvas with custom color-coded status pins and dashed connecting polyline trajectories.
- **Schematic View Fallback**: Graceful offline schematic route visualizer for low-bandwidth or restricted environments.
- **Waypoint Checklist**: Field drivers can mark individual stops as completed directly from the checklist, automatically updating bin fill levels and linked work orders.
- **Route Optimizer**: Form to plan optimized runs by grouping highest-priority bins in a municipal district.

### 5. 👥 Field Personnel & Fleet Fleet (`WorkersFleetPage.tsx`)
- **Personnel Roster**: Track driver/collector availability (`Available`, `On Route`, `Off Duty`), contact information, base district, and lifetime completed pickups.
- **Fleet Vehicles**: Manage compactor trucks, electric vans, recycling tippers, and light haulers with capacity metrics, battery/fuel gauges, and maintenance states.

### 6. 📈 Reports & Analytics (`AnalyticsPage.tsx`)
- **Circularity & Diversion Metrics**: Real-time recycling diversion rates calculated across material streams.
- **Response Time Diagnostics**: Average dispatch response latency in minutes based on timeline audits.
- **Period Volume Analysis**: Daily, weekly, and monthly estimated waste mass (kg) and fulfillment percentages.
- **Export Reports**: Download analytical summaries to CSV.

### 7. 🚨 Real-Time Incident Alert Center (`NotificationsPage.tsx`)
- **Dynamic State Alerts**: Alerts dynamically generated from live telemetry (Critical Capacity >92%, Sensor Disconnects, Low Battery <20%, Overdue Pickups, Unassigned High-Priority Requests).
- **Triage & Filter**: Filter by severity (`Critical`, `Warning`, `Info`) and read state, with one-click direct inspection navigation to the offending bin or request.

### 8. ⚙️ System & IoT Configuration (`SettingsPage.tsx`)
- **Threshold Calibrator**: Sliders to adjust Normal, Moderate, High, and Critical capacity percentages.
- **Simulator Controls**: Configure background telemetry sampling intervals (3s to 30s) and toggle automated dispatch generation.
- **Demo Data Reset**: Instant one-click restoration to baseline demo state with confirmation protection.

---

## 🔬 IoT Hardware Architecture & Sensor Integration

While physical sensors are simulated locally for this demonstration, the platform is architected according to industrial IoT and embedded standards:

### Physical Hardware Setup
- **Microcontroller**: Espressif **ESP32-WROOM-32** (or Arduino MKR WiFi 1010).
- **Sensor**: **JSN-SR04T** (Waterproof Industrial Ultrasonic Sensor) or standard **HC-SR04**.
- **Power**: 3.7V 18650 Li-Ion battery pack with a 5V boost converter and TP4056 charging circuit.

```
       [ Waterproof Ultrasonic Sensor (JSN-SR04T) ]
                    |           |
               (TRIG Pin)   (ECHO Pin via 1k/2k Divider)
                    |           |
            +-------v-----------v-------+
            |  GPIO 5         GPIO 18   |
            |                           |
            |       ESP32-WROOM-32      |
            |      Wi-Fi / 4G NB-IoT    |
            |                           |
            |  ADC GPIO 34 (Battery)    |
            +-------------+-------------+
                          |
             [ 18650 Li-Ion Battery Pack ]
```

### Calibration Formula
```cpp
// Speed of sound in air: ~0.0343 cm/microsecond
long duration = pulseIn(ECHO_PIN, HIGH);
float distanceCm = (duration * 0.0343) / 2.0;

// Constrain and calculate fill percentage based on total bin depth
float binHeightCm = 120.0;
int fillPercentage = constrain(round(((binHeightCm - distanceCm) / binHeightCm) * 100), 0, 100);
```

### MQTT Telemetry Topic Schema
```
Topic: ecotrack/telemetry/BIN-101/status
Payload:
{
  "bin_id": "BIN-101",
  "fill_level_pct": 94,
  "raw_distance_cm": 7,
  "bin_height_cm": 120,
  "battery_pct": 88,
  "battery_voltage": 3.92,
  "connectivity": "online",
  "rssi_dbm": -67,
  "timestamp": "2026-10-26T18:00:00Z"
}
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **NPM**: v9.0.0 or later

### Installation & Run Commands
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in your browser:
# http://127.0.0.1:5173/

# 4. Run production build
npm run build
```

---

## 👥 Demo Authentication, RBAC & Secret Data Isolation

EcoTrack includes an instant **Role Simulation Switcher** in the top navigation header to test permissions seamlessly on the live dashboard:

| Feature / Data Access | 👑 Administrator (`Dr. Sarah Mitchell`) | 👔 Collection Manager (`Marcus Vance`) | 👷 Field Worker (`Elena Rostova`) |
| :--- | :---: | :---: | :---: |
| **Field Shift & Route Console** | ❌ (Executive view) | ❌ (Dispatch view) | ✅ Dedicated interactive shift console |
| **Stops Checklist & Clearances** | ✅ Full control | ✅ Full control | ✅ Real-time stop clearance checkoff |
| **Smart Bin Inventory** | ✅ Full CRUD (Add, Edit, Delete) | ✅ Add, Edit (Cannot delete) | 👁️ View & Empty Bin only |
| **Collection Requests** | ✅ Create, Dispatch, Cancel | ✅ Create, Dispatch, Cancel | 🚀 Start & Complete assigned pickups |
| **Collection Routes Planning** | ✅ Create, Edit, Delete | ✅ Create, Edit stops | 👁️ View assigned route stops only |
| **Workforce & Fleet Management** | ✅ Add, Edit, Delete | ✅ Add, Edit (No deletions) | ⛔ **Restricted (Access Denied)** |
| **Sustainability & Analytics** | ✅ Full city metrics & CSV | ✅ District operational reports | ⛔ **Restricted (Access Denied)** |
| **Municipal Financials & Savings** | ✅ `$14,820/mo` savings & costs | ⛔ **Obfuscated** | ⛔ **Hidden (Zero financial data)** |
| **IoT Telemetry Secrets (API/MQTT)** | ✅ Full visibility & secret unmasking | ⛔ **Masked & Protected** | 🔒 **Completely Hidden & Blocked** |
| **System Settings & Demo Reset** | ✅ Full calibration & reset | 👁️ View config only (No reset) | ⛔ **Restricted (Access Denied)** |

---

## 💾 Data Persistence & Architecture

- **Data Access Layer (`src/services/storage.ts`)**: Encapsulated repository pattern storing smart bins, requests, workers, vehicles, routes, alerts, and settings in browser `localStorage`.
- **Easy Backend Replacement**: The storage service exposes clean CRUD helper contracts that can be swapped for REST or GraphQL API calls (`fetch` / `axios`) without altering UI components.
- **Zero Mock Fabrications**: All dashboard KPIs, fill percentages, and alert counters are derived dynamically from active records.

---

## 🔮 Future Enhancements
1. **Physical Hardware Bridge**: Deploying a lightweight Node.js/Go MQTT broker adapter (Mosquitto) that ingests physical ESP32 payloads directly into the REST backend.
2. **Turn-by-Turn GPS Navigation**: Integrating OSRM (Open Source Routing Machine) or Google Maps Directions API for live road network route geometry.
3. **Automated Weighing Scales (Load Cells)**: Incorporating HX711 strain gauge load cells to measure actual waste mass (kg) alongside volume depth.
