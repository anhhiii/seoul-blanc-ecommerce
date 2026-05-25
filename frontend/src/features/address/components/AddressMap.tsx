import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

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
  const [cssLoaded, setCssLoaded] = useState(false);

  // Load Leaflet CSS dynamically to prevent bundle issues
  useEffect(() => {
    const linkId = 'leaflet-css-cdn';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.onload = () => setCssLoaded(true);
      document.head.appendChild(link);
    } else {
      setCssLoaded(true);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!cssLoaded || !mapContainerRef.current || mapRef.current) return;

    // Vietnam center default if lat/lng not provided
    const initialLat = lat || 16.0471; 
    const initialLng = lng || 108.2068;
    const initialZoom = lat && lng ? zoom : 6;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Custom SVG Pin Icon (Fits premium minimalist theme)
    const customPinIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-brand-900/10 border border-brand-900/20 absolute animate-ping duration-1000"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="text-red-500 drop-shadow-md transition-all duration-300 transform hover:scale-110">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="white" stroke-width="1" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>
      `,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Create marker if coordinates exist
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
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [cssLoaded]);

  // Sync prop changes (e.g., selection from form fields/search)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;

    // Custom SVG Pin Icon
    const customPinIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-brand-900/10 border border-brand-900/20 absolute animate-ping duration-1000"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="text-red-500 drop-shadow-md transition-all duration-300 transform hover:scale-110">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="white" stroke-width="1" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>
      `,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    map.setView([lat, lng], zoom);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      markerRef.current = marker;
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-brand-200/60 bg-brand-50/20 shadow-xs" style={{ height }}>
      {!cssLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-10">
          <div className="w-6 h-6 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};

export default AddressMap;
