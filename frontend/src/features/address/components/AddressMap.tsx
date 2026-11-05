import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AddressMapProps {
  lat?: number | null;
  lng?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
}

export const AddressMap: React.FC<AddressMapProps> = ({
  lat,
  lng,
  onLocationSelect,
  height = '350px',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = lat || 16.0471;
    const initialLng = lng || 108.2068;
    const initialZoom = lat && lng ? zoom : 6;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      fadeAnimation: false,
    });

    // High-performance Google Maps road tiles (No API key required, full Vietnamese detail, no watermark)
    const mapLayer = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps',
      }
    );
    mapLayer.addTo(map);

    // Fallback to ESRI World Street Map if Google tile fails
    mapLayer.on('tileerror', () => {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(map);
    });

    mapRef.current = map;

    // Custom SVG Pin Icon
    const customPinIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 absolute animate-ping duration-1000"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="text-red-500 drop-shadow-md transition-all duration-300 transform hover:scale-110">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="white" stroke-width="1.5" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>
      `,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (lat && lng) {
      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      markerRef.current = marker;
    }

    // Map Click Handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickedLat, lng: clickedLng } = e.latlng;
      onLocationSelect(clickedLat, clickedLng);

      if (markerRef.current) {
        markerRef.current.setLatLng([clickedLat, clickedLng]);
      } else {
        const marker = L.marker([clickedLat, clickedLng], { icon: customPinIcon }).addTo(map);
        markerRef.current = marker;
      }
      map.panTo([clickedLat, clickedLng], { animate: true });
    });

    // Invalidate map size
    const invalidate = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    requestAnimationFrame(invalidate);
    const t1 = setTimeout(invalidate, 150);
    const t2 = setTimeout(invalidate, 400);
    const t3 = setTimeout(invalidate, 800);

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        invalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sync prop changes (pan to selected location when lat/lng change)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;

    const customPinIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 absolute animate-ping duration-1000"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="text-red-500 drop-shadow-md transition-all duration-300 transform hover:scale-110">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="white" stroke-width="1.5" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>
      `,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    map.setView([lat, lng], zoom);
    map.invalidateSize();

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      markerRef.current = marker;
    }
  }, [lat, lng, zoom]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-brand-200/60 bg-brand-50/20 shadow-xs cursor-crosshair"
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />
    </div>
  );
};

export default AddressMap;
