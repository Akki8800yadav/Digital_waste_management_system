import { SmartBin, SystemAlert, CollectionRequest, AppSettings } from '../types';

export interface SimulationResult {
  updatedBins: SmartBin[];
  newAlerts: SystemAlert[];
  newRequests: CollectionRequest[];
}

export class SimulationEngine {
  /**
   * Performs one cycle of simulated sensor measurements on smart bins
   */
  static tick(
    bins: SmartBin[],
    existingRequests: CollectionRequest[],
    existingAlerts: SystemAlert[],
    settings: AppSettings
  ): SimulationResult {
    const updatedBins: SmartBin[] = [];
    const newAlerts: SystemAlert[] = [];
    const newRequests: CollectionRequest[] = [];

    // Track active requests by binId to avoid duplicates
    const activeRequestBinIds = new Set(
      existingRequests
        .filter(r => r.status === 'Pending' || r.status === 'Assigned' || r.status === 'In Progress')
        .map(r => r.binId)
    );

    for (const bin of bins) {
      // If bin is completely offline, skip fill updates but simulate possible reconnect
      if (bin.connectivity === 'offline') {
        const reconnectRoll = Math.random();
        if (reconnectRoll > 0.85) {
          updatedBins.push({
            ...bin,
            connectivity: 'online',
            lastUpdate: new Date().toISOString()
          });
        } else {
          updatedBins.push(bin);
        }
        continue;
      }

      // Simulate waste filling (increase fill level by 0 to 4% randomly)
      // Some bins might not change, some increase slightly
      const fillDelta = Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0;
      const newFill = Math.min(100, bin.fillLevel + fillDelta);

      // Calculate distance in cm based on total bin depth
      const height = bin.heightCm || 120;
      const calculatedDistanceCm = Math.max(2, Math.round(height * (1 - newFill / 100)));

      // Tiny simulated battery decay (0.05% chance of 1% drop)
      const batteryDrop = Math.random() < 0.1 ? 1 : 0;
      const newBattery = Math.max(0, bin.batteryLevel - batteryDrop);

      // Check operational status based on configured thresholds
      let newStatus: SmartBin['status'] = 'normal';
      let newPriority: SmartBin['priority'] = 'Low';

      if (newFill >= settings.criticalThreshold) {
        newStatus = 'critical';
        newPriority = 'Critical';
      } else if (newFill >= settings.highThreshold) {
        newStatus = 'high';
        newPriority = 'High';
      } else if (newFill >= settings.moderateThreshold) {
        newStatus = 'moderate';
        newPriority = 'Medium';
      }

      const timestamp = new Date().toISOString();

      const newReading = {
        timestamp,
        fillLevel: newFill,
        batteryLevel: newBattery,
        distanceCm: calculatedDistanceCm
      };

      // Keep recent 12 history readings
      const history = [...(bin.sensorHistory || []), newReading].slice(-12);

      const updatedBin: SmartBin = {
        ...bin,
        fillLevel: newFill,
        batteryLevel: newBattery,
        status: newStatus,
        priority: newPriority,
        lastUpdate: timestamp,
        sensorHistory: history
      };

      updatedBins.push(updatedBin);

      // Check if alert should be created for critical fill
      if (newFill >= settings.criticalThreshold && bin.fillLevel < settings.criticalThreshold) {
        newAlerts.push({
          id: `ALT-CRIT-${bin.id}-${Date.now()}`,
          type: 'critical_fill',
          severity: 'critical',
          title: `Critical Capacity: ${bin.name}`,
          message: `${bin.name} in ${bin.zone} reached ${newFill}% fill level. Urgent pickup needed.`,
          timestamp,
          read: false,
          targetType: 'bin',
          targetId: bin.id
        });
      }

      // Check if low battery alert
      if (newBattery <= 20 && bin.batteryLevel > 20) {
        newAlerts.push({
          id: `ALT-BAT-${bin.id}-${Date.now()}`,
          type: 'low_battery',
          severity: 'warning',
          title: `Low Battery: ${bin.name}`,
          message: `Sensor battery on ${bin.id} is down to ${newBattery}%. Replace sensor battery soon.`,
          timestamp,
          read: false,
          targetType: 'bin',
          targetId: bin.id
        });
      }

      // Auto-recommend collection request if enabled and threshold reached
      if (
        settings.autoRecommendCollection &&
        newFill >= settings.highThreshold &&
        !activeRequestBinIds.has(bin.id)
      ) {
        activeRequestBinIds.add(bin.id);
        const reqId = `REQ-AUTO-${Date.now().toString().slice(-4)}`;
        newRequests.push({
          id: reqId,
          binId: bin.id,
          binName: bin.name,
          location: bin.address,
          zone: bin.zone,
          category: bin.category,
          priority: newPriority,
          createdAt: timestamp,
          scheduledDate: new Date(Date.now() + 4 * 3600000).toISOString(),
          status: 'Pending',
          notes: `Automated dispatch recommendation: Bin reached ${newFill}% capacity.`,
          timeline: [
            {
              timestamp,
              action: 'Auto-Generated by Telemetry',
              actor: 'EcoTrack IoT Engine',
              note: `Triggered at ${newFill}% fill`
            }
          ]
        });
      }
    }

    return { updatedBins, newAlerts, newRequests };
  }

  /**
   * Helper to manually calibrate/test an individual bin reading
   */
  static manualTelemetry(
    bin: SmartBin, 
    fillLevel: number, 
    batteryLevel?: number,
    connectivity?: SmartBin['connectivity']
  ): SmartBin {
    const timestamp = new Date().toISOString();
    const height = bin.heightCm || 120;
    const distanceCm = Math.max(2, Math.round(height * (1 - fillLevel / 100)));
    const battery = batteryLevel !== undefined ? batteryLevel : bin.batteryLevel;
    const conn = connectivity !== undefined ? connectivity : bin.connectivity;

    let status: SmartBin['status'] = 'normal';
    let priority: SmartBin['priority'] = 'Low';

    if (conn === 'offline') {
      status = 'offline';
    } else if (fillLevel >= 92) {
      status = 'critical';
      priority = 'Critical';
    } else if (fillLevel >= 85) {
      status = 'high';
      priority = 'High';
    } else if (fillLevel >= 75) {
      status = 'moderate';
      priority = 'Medium';
    }

    const reading = {
      timestamp,
      fillLevel,
      batteryLevel: battery,
      distanceCm
    };

    return {
      ...bin,
      fillLevel,
      batteryLevel: battery,
      connectivity: conn,
      status,
      priority,
      lastUpdate: timestamp,
      sensorHistory: [...(bin.sensorHistory || []), reading].slice(-15)
    };
  }
}
