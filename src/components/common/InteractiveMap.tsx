import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SmartBin, RouteStop } from '../../types';
import { MapPin, Navigation, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface InteractiveMapProps {
  bins?: SmartBin[];
  stops?: RouteStop[];
  activeStopId?: string;
  onSelectBin?: (binId: string) => void;
  onSelectStop?: (stopId: string) => void;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  bins = [],
  stops = [],
  activeStopId,
  onSelectBin,
  onSelectStop,
  height = '440px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [useSchematic, setUseSchematic] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (useSchematic || !mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Default center: San Francisco downtown coordinates
        const defaultCenter: [number, number] = [37.778, -122.415];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.warn('Leaflet map initialization error, falling back to schematic view', err);
      setMapError(true);
      setUseSchematic(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [useSchematic]);

  // Update Markers and Polyline on bins or stops change
  useEffect(() => {
    if (useSchematic || !mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const bounds: [number, number][] = [];

    // If Route Stops provided
    if (stops.length > 0) {
      const routeCoordinates: [number, number][] = [];

      stops.forEach((stop, index) => {
        const latLng: [number, number] = [stop.lat, stop.lng];
        routeCoordinates.push(latLng);
        bounds.push(latLng);

        // Marker color based on completed status or fill
        const isCompleted = stop.completed;
        const isCurrent = stop.id === activeStopId;
        const colorClass = isCompleted 
          ? 'bg-emerald-600 text-white' 
          : stop.fillLevel >= 90 
          ? 'bg-rose-600 text-white animate-bounce' 
          : 'bg-ecogreen text-white';

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-weight:bold;font-size:12px;box-shadow:0 3px 6px rgba(0,0,0,0.3);border:2px solid white;" class="${colorClass} ${isCurrent ? 'ring-4 ring-amber-400' : ''}">
              ${isCompleted ? '✓' : index + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(latLng, { icon: customIcon });

        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;min-width:180px;">
            <div style="font-size:10px;text-transform:uppercase;color:#64748b;font-weight:600;">Stop #${index + 1}</div>
            <div style="font-size:13px;font-weight:bold;color:#0f172a;margin-top:2px;">${stop.binName}</div>
            <div style="font-size:11px;color:#475569;margin-top:2px;">${stop.address}</div>
            <div style="margin-top:6px;display:flex;justify-content:space-between;font-size:11px;">
              <span>Fill: <strong>${stop.fillLevel}%</strong></span>
              <span style="color:${isCompleted ? '#16a34a' : '#d97706'};font-weight:600;">${isCompleted ? 'Completed' : 'Pending'}</span>
            </div>
          </div>
        `);

        if (onSelectStop) {
          marker.on('click', () => onSelectStop(stop.id));
        }

        markersLayer.addLayer(marker);
      });

      // Draw route connecting polyline
      if (routeCoordinates.length > 1) {
        const polyline = L.polyline(routeCoordinates, {
          color: '#2d6a4f',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round'
        }).addTo(map);

        routePolylineRef.current = polyline;
      }
    } 
    // Otherwise render standard Smart Bins markers
    else if (bins.length > 0) {
      bins.forEach(bin => {
        if (!bin.lat || !bin.lng) return;
        const latLng: [number, number] = [bin.lat, bin.lng];
        bounds.push(latLng);

        let pinBg = 'bg-emerald-600';
        if (bin.status === 'critical' || bin.fillLevel >= 90) pinBg = 'bg-rose-600 pulse-circle';
        else if (bin.status === 'high' || bin.fillLevel >= 80) pinBg = 'bg-amber-500';
        else if (bin.connectivity === 'offline') pinBg = 'bg-slate-500';

        const customIcon = L.divIcon({
          className: 'custom-bin-marker',
          html: `
            <div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;color:white;font-size:11px;font-weight:bold;box-shadow:0 3px 6px rgba(0,0,0,0.3);border:2px solid white;" class="${pinBg}">
              ${bin.fillLevel}%
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(latLng, { icon: customIcon });

        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;min-width:200px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;font-weight:600;">
              <span>${bin.id}</span>
              <span style="color:${bin.connectivity === 'online' ? '#16a34a' : '#e11d48'}">${bin.connectivity.toUpperCase()}</span>
            </div>
            <div style="font-size:13px;font-weight:bold;color:#0f172a;margin-top:2px;">${bin.name}</div>
            <div style="font-size:11px;color:#475569;margin-top:2px;">${bin.address}</div>
            <div style="margin-top:8px;font-size:11px;padding:4px;background:#f8fafc;border-radius:6px;">
              <div>Capacity: <strong>${bin.fillLevel}%</strong> (${bin.category})</div>
              <div>Battery: <strong>${bin.batteryLevel}%</strong></div>
            </div>
          </div>
        `);

        if (onSelectBin) {
          marker.on('click', () => onSelectBin(bin.id));
        }

        markersLayer.addLayer(marker);
      });
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [bins, stops, activeStopId, onSelectBin, onSelectStop, useSchematic]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      {/* Top Map Controls Header */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setUseSchematic(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          {useSchematic ? <Navigation className="w-3.5 h-3.5 text-ecogreen" /> : <Eye className="w-3.5 h-3.5" />}
          {useSchematic ? 'Switch to Map Tiles' : 'Schematic View'}
        </button>
      </div>

      {/* Main Display: Interactive Map or Schematic Fallback */}
      {!useSchematic && !mapError ? (
        <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />
      ) : (
        /* Schematic Route & Location Visualizer Fallback */
        <div style={{ height }} className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-ecogreen" />
                  Schematic Route & Location Visualizer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reliable offline schematic representation of stops, addresses, and fill statuses
                </p>
              </div>
            </div>

            {stops.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    onClick={() => onSelectStop && onSelectStop(stop.id)}
                    className={`relative p-3.5 rounded-xl border bg-white dark:bg-slate-800 transition-all cursor-pointer ${
                      stop.id === activeStopId
                        ? 'border-ecogreen shadow-md ring-1 ring-ecogreen'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`absolute -left-7 top-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-slate-900 ${
                      stop.completed ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}>
                      {stop.completed ? '✓' : i + 1}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          Stop #{i + 1}: {stop.binName}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {stop.address}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          stop.fillLevel >= 90 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {stop.fillLevel}% full
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {stop.completed ? (
                            <span className="text-emerald-600 flex items-center gap-0.5 justify-end">
                              <CheckCircle2 className="w-3 h-3" /> Collected
                            </span>
                          ) : 'Pending pickup'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bins.map(bin => (
                  <div
                    key={bin.id}
                    onClick={() => onSelectBin && onSelectBin(bin.id)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-ecogreen transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>{bin.id} &bull; {bin.name}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        bin.fillLevel >= 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {bin.fillLevel}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {bin.address} ({bin.zone})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-ecogreen" />
              Live approximations calculated from zone waypoints.
            </span>
            <span className="font-mono">OpenStreetMap Tiles Available</span>
          </div>
        </div>
      )}
    </div>
  );
};
