import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  RotateCcw, 
  Sliders, 
  Building, 
  Moon, 
  Sun, 
  Radio, 
  Save, 
  Check, 
  AlertTriangle,
  Cpu,
  MapPin,
  Tag,
  Key,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SettingsPageProps {
  onOpenTelemetryModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenTelemetryModal }) => {
  const { 
    settings, 
    updateSettings, 
    resetToDemoDefaults,
    bins,
    requests,
    currentUser
  } = useApp();

  const isWorker = currentUser.role === 'worker';
  const isAdmin = currentUser.role === 'admin';

  const [formSettings, setFormSettings] = useState({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isWorker) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          System Settings & Credentials Restricted
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Field worker accounts do not have access to municipal system parameters, API credentials, or hardware calibration. Please contact your dispatch administrator.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            System Preferences & IoT Calibration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure municipal parameters, fill-level alert triggers, and telemetry sampling
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data to Initial State
          </button>
        ) : (
          <span className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Manager Mode &bull; Root resets restricted to Admin
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Branding */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-ecogreen" />
            Municipal Organization Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Municipality Name
              </label>
              <input
                type="text"
                value={formSettings.orgName}
                onChange={e => setFormSettings({ ...formSettings, orgName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-ecogreen"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Color Appearance
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormSettings({ ...formSettings, theme: 'light' })}
                  className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    formSettings.theme === 'light'
                      ? 'bg-ecogreen text-white border-ecogreen shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => setFormSettings({ ...formSettings, theme: 'dark' })}
                  className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    formSettings.theme === 'dark'
                      ? 'bg-ecogreen text-white border-ecogreen shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ultrasonic Fill Thresholds */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-ecogreen" />
              Ultrasonic Sensor Fill Threshold Calibration
            </h3>
            <span className="text-[11px] text-slate-400">
              Triggers visual status and automated dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/40 dark:bg-yellow-950/20">
              <label className="block font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                Moderate Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="80"
                  value={formSettings.moderateThreshold}
                  onChange={e => setFormSettings({ ...formSettings, moderateThreshold: Number(e.target.value) })}
                  className="w-20 px-2 py-1 font-mono font-bold text-xs rounded-lg border border-yellow-300 dark:border-yellow-800 bg-white dark:bg-slate-800"
                />
                <span className="text-slate-500 font-bold">% capacity</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Display yellow gauge alert</p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                High Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="60"
                  max="92"
                  value={formSettings.highThreshold}
                  onChange={e => setFormSettings({ ...formSettings, highThreshold: Number(e.target.value) })}
                  className="w-20 px-2 py-1 font-mono font-bold text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800"
                />
                <span className="text-slate-500 font-bold">% capacity</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Auto-generates collection order</p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20">
              <label className="block font-bold text-rose-900 dark:text-rose-300 mb-1">
                Critical Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="80"
                  max="99"
                  value={formSettings.criticalThreshold}
                  onChange={e => setFormSettings({ ...formSettings, criticalThreshold: Number(e.target.value) })}
                  className="w-20 px-2 py-1 font-mono font-bold text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800"
                />
                <span className="text-slate-500 font-bold">% capacity</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Immediate sound / emergency alert</p>
            </div>
          </div>
        </div>

        {/* IoT Telemetry Simulation Engine */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-ecogreen" />
              IoT Simulation & Microcontroller Telemetry
            </h3>
            <button
              type="button"
              onClick={onOpenTelemetryModal}
              className="text-xs font-semibold text-ecogreen hover:underline flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" /> Open Hardware Schematics
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.simulationActive}
                onChange={e => setFormSettings({ ...formSettings, simulationActive: e.target.checked })}
                className="rounded border-slate-300 text-ecogreen focus:ring-ecogreen w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Enable Background IoT Simulation Engine
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Continuously updates ultrasonic fill depth readings and battery discharge in background
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.autoRecommendCollection}
                onChange={e => setFormSettings({ ...formSettings, autoRecommendCollection: e.target.checked })}
                className="rounded border-slate-300 text-ecogreen focus:ring-ecogreen w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Automated Dispatch Generation
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically create unassigned collection requests when bins breach High Threshold without duplicate orders
                </p>
              </div>
            </label>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telemetry Polling Interval ({formSettings.simulationIntervalSecs} seconds)
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={formSettings.simulationIntervalSecs}
                onChange={e => setFormSettings({ ...formSettings, simulationIntervalSecs: Number(e.target.value) })}
                className="w-full accent-ecogreen"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Fast (3s)</span>
                <span>Normal (10s)</span>
                <span>Slow (30s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sectors and Waste Classifications Overview */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-ecogreen" />
            Configured Municipal Sectors & Waste Classes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Sectors / Zones</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formSettings.zones.map(z => (
                  <span key={z} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                    {z}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Separation Categories</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formSettings.wasteCategories.map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                    {c} Waste
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Keys & Cryptographic Secrets (Admin Only Vault) */}
        {isAdmin && (
          <div className="p-6 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                API Keys & Cryptographic Secrets (Admin Vault)
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                Secret Barrier: Isolated from Workers & Managers
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              These credentials allow root control over physical ESP32 telemetry feeds, MQTT gateway streams, and database ingestion. They are hidden and obfuscated from worker field shifts.
            </p>

            <div className="space-y-3 pt-1 text-xs">
              {/* REST API Key */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Municipal Ingestion REST API Key</span>
                  <button
                    type="button"
                    onClick={() => toggleSecret('apiKey')}
                    className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 hover:underline font-medium"
                  >
                    {showSecrets['apiKey'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showSecrets['apiKey'] ? 'Mask Secret' : 'Reveal Key'}
                  </button>
                </div>
                <div className="font-mono text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 select-all">
                  {showSecrets['apiKey'] ? 'eco_live_sec_9941a0f882e3b1c7' : '••••••••••••••••••••••••••••••••'}
                </div>
              </div>

              {/* MQTT Token */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">MQTT Broker Master Device Token</span>
                  <button
                    type="button"
                    onClick={() => toggleSecret('mqttToken')}
                    className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 hover:underline font-medium"
                  >
                    {showSecrets['mqttToken'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showSecrets['mqttToken'] ? 'Mask Secret' : 'Reveal Key'}
                  </button>
                </div>
                <div className="font-mono text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 select-all">
                  {showSecrets['mqttToken'] ? 'mqtt_sec_920f_broker_prod_root' : '••••••••••••••••••••••••••••••••'}
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Cloudflare Webhook Signing Secret</span>
                  <button
                    type="button"
                    onClick={() => toggleSecret('webhookSec')}
                    className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 hover:underline font-medium"
                  >
                    {showSecrets['webhookSec'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showSecrets['webhookSec'] ? 'Mask Secret' : 'Reveal Key'}
                  </button>
                </div>
                <div className="font-mono text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 select-all">
                  {showSecrets['webhookSec'] ? 'whsec_d83e29f0a21817c7b2' : '••••••••••••••••••••••••••••••••'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> Preferences saved and applied to local operational state!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-ecogreen hover:bg-ecogreen-dark text-white transition-all shadow-md hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              Save Operational Settings
            </button>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetToDemoDefaults();
          setIsResetConfirmOpen(false);
          setFormSettings({ ...settings });
        }}
        title="Reset Demo Operational State"
        message="Are you sure you want to reset all smart bins, collection requests, field routes, and sensor history back to factory demo benchmarks? All custom-created records in localStorage will be cleared."
        confirmLabel="Reset All Data"
        isDestructive={true}
      />
    </div>
  );
};
