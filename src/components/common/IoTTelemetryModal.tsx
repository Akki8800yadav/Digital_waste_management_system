import React, { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { Cpu, Wifi, BatteryCharging, Radio, Play, Pause, RefreshCw, Send, Check, Lock, ShieldAlert } from 'lucide-react';
import { FillBar } from './FillBar';

export const IoTTelemetryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { 
    bins, 
    simulateBinReading, 
    simulationActive, 
    toggleSimulation, 
    stepSimulation,
    settings,
    lastSimulationTick,
    currentUser
  } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'simulator' | 'hardware' | 'protocol'>(
    isWorker ? 'hardware' : 'simulator'
  );
  const [selectedBinId, setSelectedBinId] = useState<string>(bins[0]?.id || '');
  const [manualFill, setManualFill] = useState<number>(85);
  const [manualBattery, setManualBattery] = useState<number>(90);
  const [manualConn, setManualConn] = useState<'online' | 'weak' | 'offline'>('online');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const selectedBin = bins.find(b => b.id === selectedBinId) || bins[0];
  const calculatedDistanceCm = selectedBin 
    ? Math.max(2, Math.round((selectedBin.heightCm || 120) * (1 - manualFill / 100))) 
    : 18;

  const handleApplyTelemetry = () => {
    if (selectedBin) {
      simulateBinReading(selectedBin.id, manualFill, manualBattery, manualConn);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="IoT Sensor Lab & Hardware Architecture"
      subtitle={
        isWorker
          ? "Field Technician hardware reference & ultrasonic transducer wiring"
          : "Simulate real-time ultrasonic telemetry or inspect ESP32 microcontroller deployment standards"
      }
      maxWidth="2xl"
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        {!isWorker && (
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'simulator'
                ? 'border-ecogreen text-ecogreen dark:text-ecogreen-accent'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Telemetry Simulator
          </button>
        )}
        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'hardware'
              ? 'border-ecogreen text-ecogreen dark:text-ecogreen-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Radio className="w-4 h-4" />
          ESP32 Ultrasonic Wiring
        </button>
        <button
          onClick={() => setActiveTab('protocol')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'protocol'
              ? 'border-ecogreen text-ecogreen dark:text-ecogreen-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Wifi className="w-4 h-4" />
          {isWorker ? 'API & Device Security' : 'MQTT & HTTP API Spec'}
        </button>
      </div>

      {activeTab === 'simulator' && !isWorker && (
        <div className="space-y-6">
          {/* Simulation Global Controls */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${simulationActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Background IoT Simulation: {simulationActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Period: every {settings.simulationIntervalSecs}s &bull; Last tick: {lastSimulationTick?.toLocaleTimeString() || 'Just now'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepSimulation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                title="Execute 1 simulation tick immediately"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Step Once
              </button>
              <button
                onClick={() => toggleSimulation()}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors shadow-sm ${
                  simulationActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-ecogreen hover:bg-ecogreen-dark'
                }`}
              >
                {simulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {simulationActive ? 'Pause Engine' : 'Start Engine'}
              </button>
            </div>
          </div>

          {/* Manual Telemetry Injection */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-ecogreen" />
              Manual Sensor Calibration & Telemetry Injection
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a deployed smart bin to simulate a live ultrasonic distance measurement and observe immediate threshold dispatch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Smart Bin
                </label>
                <select
                  value={selectedBinId}
                  onChange={e => {
                    setSelectedBinId(e.target.value);
                    const b = bins.find(item => item.id === e.target.value);
                    if (b) {
                      setManualFill(b.fillLevel);
                      setManualBattery(b.batteryLevel);
                      setManualConn(b.connectivity);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
                >
                  {bins.map(bin => (
                    <option key={bin.id} value={bin.id}>
                      {bin.id} — {bin.name} ({bin.fillLevel}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Connectivity Heartbeat
                </label>
                <select
                  value={manualConn}
                  onChange={e => setManualConn(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
                >
                  <option value="online">Online (Wi-Fi / 4G NB-IoT)</option>
                  <option value="weak">Weak Signal / RSSI &lt; -85dBm</option>
                  <option value="offline">Offline (Sensor Timeout)</option>
                </select>
              </div>
            </div>

            {/* Slider Fill Level */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Simulated Waste Fill Level: <strong className="text-ecogreen text-sm">{manualFill}%</strong>
                </span>
                <span className="text-slate-400 font-mono">
                  Ultrasonic Echo Distance: <strong>{calculatedDistanceCm} cm</strong> (Total Depth: {selectedBin?.heightCm || 120} cm)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={manualFill}
                onChange={e => setManualFill(Number(e.target.value))}
                className="w-full accent-ecogreen cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="mt-2">
                <FillBar fillLevel={manualFill} size="md" distanceCm={calculatedDistanceCm} />
              </div>
            </div>

            {/* Slider Battery Level */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  Li-Ion Battery Voltage Level: <strong>{manualBattery}%</strong>
                </span>
                <span className="text-slate-400 text-[11px]">
                  {manualBattery <= 20 ? '⚠️ Will trigger Low Battery Alert' : 'Nominal (3.7V - 4.2V)'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={manualBattery}
                onChange={e => setManualBattery(Number(e.target.value))}
                className="w-full accent-ecogreen cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            <button
              onClick={handleApplyTelemetry}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                submitted ? 'bg-emerald-600' : 'bg-ecogreen hover:bg-ecogreen-dark'
              }`}
            >
              {submitted ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {submitted ? 'Telemetry Injected Successfully!' : `Transmit Sensor Reading to ${selectedBin?.id || 'Bin'}`}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'hardware' && (
        <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-xl">
            <h5 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 mb-1">
              Smart Waste IoT Physical Hardware Setup
            </h5>
            <p>
              In a physical deployment, each bin lid houses an <strong>ESP32 Microcontroller</strong> connected to an ultrasonic distance sensor (such as the waterproof <strong>JSN-SR04T</strong> or standard <strong>HC-SR04</strong>). The sensor emits high-frequency 40kHz sound pulses downwards and calculates distance from time of flight.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="p-2.5">Sensor Pin</th>
                  <th className="p-2.5">ESP32 Pin</th>
                  <th className="p-2.5">Description & Calibration Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">VCC</td>
                  <td className="p-2.5">VIN (5V)</td>
                  <td className="p-2.5 font-sans">Power supply from 18650 Li-Ion battery pack with 5V step-up boost.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">GND</td>
                  <td className="p-2.5">GND</td>
                  <td className="p-2.5 font-sans">Common ground reference.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">TRIG</td>
                  <td className="p-2.5">GPIO 5</td>
                  <td className="p-2.5 font-sans">Sends 10 microsecond pulse to trigger ultrasonic burst.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">ECHO</td>
                  <td className="p-2.5">GPIO 18</td>
                  <td className="p-2.5 font-sans">Measures return time. Note: use a 1kΩ / 2kΩ resistor divider to step 5V down to 3.3V logic.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-mono text-[11px] text-slate-800 dark:text-slate-200">
            <p className="font-bold font-sans text-xs mb-1 text-slate-900 dark:text-slate-100">Calibration Formula:</p>
            <code>
              distanceCm = (pulseDurationMicroseconds * 0.0343) / 2;<br />
              fillLevel = ((binHeightCm - distanceCm) / binHeightCm) * 100;
            </code>
          </div>
        </div>
      )}

      {activeTab === 'protocol' && (
        <div className="space-y-4 text-xs">
          {/* RBAC CHECK: Workers cannot view secret device tokens or API bearer keys */}
          {isWorker ? (
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Restricted: Secret API Keys & MQTT Device Tokens
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  Field workers have access to physical bin hardware and calibration specs. Production API authorization tokens, encryption secrets, and MQTT broker credentials are restricted to System Administrators.
                </p>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-500">
                Current Role: worker &bull; Access Level: Field Execution Only
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-600 dark:text-slate-400">
                Smart bins communicate either through an MQTT Broker (for low-bandwidth lightweight telemetry) or direct HTTPS REST API endpoints.
              </p>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  1. MQTT Telemetry Topic & Payload:
                </h5>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                  <span className="text-emerald-400">TOPIC:</span> ecotrack/telemetry/BIN-101/status<br /><br />
                  {JSON.stringify({
                    bin_id: "BIN-101",
                    fill_level_pct: 94,
                    raw_distance_cm: 7,
                    bin_height_cm: 120,
                    battery_pct: 88,
                    battery_voltage: 3.92,
                    connectivity: "online",
                    rssi_dbm: -67,
                    timestamp: "2026-10-26T17:45:00Z"
                  }, null, 2)}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">
                    2. REST API Ingestion Endpoint:
                  </h5>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {isAdmin ? 'Admin View: Keys Unmasked' : 'Manager View: Masked Secret'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                  <span className="text-cyan-400">POST</span> /api/v1/telemetry/report<br />
                  <span className="text-slate-400">Content-Type:</span> application/json<br />
                  <span className="text-slate-400">Authorization:</span> Bearer {
                    isAdmin 
                      ? 'eco_sec_live_948a20bf77a01cd49e89b' 
                      : 'eco_sec_live_*************************'
                  }<br />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};
