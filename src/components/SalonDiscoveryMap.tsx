import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Star, 
  Clock, 
  Scissors, 
  Tag, 
  ChevronRight, 
  Compass, 
  Layers, 
  Sparkles,
  Maximize2,
  Minimize2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Salon, ServiceItem } from '../types';
import { useApp } from '../context/AppContext';

interface SalonDiscoveryMapProps {
  salons: Salon[];
  selectedSalon: Salon | null;
  onSelectSalon: (salon: Salon) => void;
  matchedService?: (salon: Salon) => ServiceItem | undefined;
}

// User location benchmark: 100 Feet Road, Indiranagar, Bangalore
const USER_COORDS = { lat: 12.9716, lng: 77.6412 };

// City neighborhoods for cartographic realism
const NEIGHBORHOOD_ZONES = [
  { name: 'Indiranagar Hub', lat: 12.9784, lng: 77.6408, label: 'Indiranagar' },
  { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245, label: 'Koramangala' },
  { name: 'HSR Layout Sector 2', lat: 12.9121, lng: 77.6446, label: 'HSR Layout' },
  { name: 'Jayanagar 4th Block', lat: 12.9308, lng: 77.5838, label: 'Jayanagar' },
  { name: 'MG Road / Church St', lat: 12.9754, lng: 77.6067, label: 'CBD / MG Road' },
  { name: 'Whitefield Corridor', lat: 12.9698, lng: 77.7499, label: 'Whitefield' },
];

export const SalonDiscoveryMap: React.FC<SalonDiscoveryMapProps> = ({
  salons,
  selectedSalon,
  onSelectSalon,
  matchedService,
}) => {
  const { setSelectedSalonId, startBookingForSalon, filterDate, selectedSpecificService } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Map viewport states
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapStyle, setMapStyle] = useState<'cyber' | 'carto'>('cyber');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeRadiusKm, setActiveRadiusKm] = useState<number | null>(null);

  // Auto-scroll carousel when selectedSalon changes
  useEffect(() => {
    if (selectedSalon && carouselRef.current) {
      const cardElement = document.getElementById(`map-card-${selectedSalon.id}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedSalon]);

  // Center coordinate determination (defaults to Indiranagar)
  const centerLat = USER_COORDS.lat;
  const centerLng = USER_COORDS.lng;

  // Coordinate Projection to SVG pixels
  // In Bangalore: 1 degree latitude ~ 111 km. 1 degree longitude ~ 108 km.
  const projectCoords = (lat: number, lng: number, width = 600, height = 480) => {
    const latScale = 2400 * zoom;
    const lngScale = 2400 * zoom;

    // Invert Y because latitude goes North (+) but SVG Y goes Down (+)
    const x = width / 2 + (lng - centerLng) * lngScale + pan.x;
    const y = height / 2 - (lat - centerLat) * latScale + pan.y;

    return { x, y };
  };

  // Convert distance in KM to pixel radius at current zoom
  const kmToPixels = (km: number) => {
    // 1 km is roughly (1 / 111) degrees latitude
    return (km / 111) * 2400 * zoom;
  };

  // Handle Drag / Pan Events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || !e.touches[0]) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  // Recenter to user's location
  const handleRecenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.2);
  };

  // User position projection
  const userPos = projectCoords(USER_COORDS.lat, USER_COORDS.lng);

  // Filter salons if activeRadiusKm is set
  const visibleSalons = useMemo(() => {
    if (!activeRadiusKm) return salons;
    return salons.filter((s) => s.distanceKm <= activeRadiusKm);
  }, [salons, activeRadiusKm]);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-md transition-all select-none ${
        isFullscreen
          ? 'fixed inset-2 sm:inset-4 z-50 h-[95vh] bg-slate-100'
          : 'h-[520px] sm:h-[580px] bg-slate-100'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Status & Privacy Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl px-3 py-1.5 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-3.5" />
            <span className="text-xs font-bold text-slate-900">
              {visibleSalons.length} Salons Nearby
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] text-slate-600 hidden sm:inline flex items-center gap-1 font-medium">
            <Compass className="w-3 h-3 text-violet-600 inline" />
            Interactive Discovery Map
          </span>
        </div>

        {/* Right: Quick Zoom, Recenter & Map Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-1 shadow-md">
          {/* Radius selector buttons */}
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-0.5">
            {[
              { km: null, label: 'All' },
              { km: 3, label: '3km' },
              { km: 5, label: '5km' },
              { km: 10, label: '10km' },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => setActiveRadiusKm(r.km)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                  activeRadiusKm === r.km
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            title="Recenter on your location"
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zoom In / Out */}
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.3, 3))}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.3, 0.6))}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Map Style Toggle */}
          <button
            onClick={() => setMapStyle((s) => (s === 'cyber' ? 'carto' : 'cyber'))}
            title="Toggle Map Style"
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container (Draggable) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className={`w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden ${
          mapStyle === 'cyber'
            ? 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]'
            : 'bg-gradient-to-b from-white via-slate-50 to-slate-100'
        }`}
      >
        {/* SVG Map Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            </pattern>

            {/* Radial glow for user */}
            <radialGradient id="user-radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#city-grid)" />

          {/* Distance Concentric Radius Circles from User Location */}
          {[2, 5, 10, 15].map((km) => {
            const radius = kmToPixels(km);
            return (
              <g key={km}>
                <circle
                  cx={userPos.x}
                  cy={userPos.y}
                  r={radius}
                  fill="none"
                  stroke={activeRadiusKm === km ? '#8b5cf6' : '#cbd5e1'}
                  strokeWidth={activeRadiusKm === km ? '2' : '1.25'}
                  strokeDasharray="4 6"
                  opacity={activeRadiusKm === km ? '0.9' : '0.6'}
                />
                <text
                  x={userPos.x + radius + 4}
                  y={userPos.y - 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {km}km
                </text>
              </g>
            );
          })}

          {/* Simulated Major Arterial Roads & Metro Corridors connecting salons */}
          <g opacity="0.65">
            {/* 100 Feet Road Axis */}
            <line
              x1={userPos.x - 300}
              y1={userPos.y - 120}
              x2={userPos.x + 350}
              y2={userPos.y + 180}
              stroke="#a5b4fc"
              strokeWidth="5"
            />
            {/* Inner Ring Road / Koramangala Axis */}
            <path
              d={`M ${userPos.x - 220} ${userPos.y - 300} Q ${userPos.x} ${userPos.y + 60} ${userPos.x + 280} ${userPos.y + 350}`}
              fill="none"
              stroke="#c4b5fd"
              strokeWidth="4"
            />
            {/* Whitefield Metro Corridor */}
            <line
              x1={userPos.x}
              y1={userPos.y}
              x2={userPos.x + 450}
              y2={userPos.y - 100}
              stroke="#f472b6"
              strokeWidth="3"
              strokeDasharray="8 4"
            />
          </g>

          {/* User Radar Ping Circle */}
          <circle cx={userPos.x} cy={userPos.y} r={kmToPixels(1.5)} fill="url(#user-radar-glow)" />

          {/* Neighborhood Labels */}
          {NEIGHBORHOOD_ZONES.map((zone) => {
            const p = projectCoords(zone.lat, zone.lng);
            return (
              <g key={zone.name} transform={`translate(${p.x}, ${p.y})`}>
                <text
                  x="0"
                  y="26"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="11"
                  fontWeight="bold"
                  letterSpacing="0.05em"
                  className="uppercase tracking-wider pointer-events-none select-none"
                >
                  {zone.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* User Location Pulse Marker */}
        <div
          style={{ top: `${userPos.y}px`, left: `${userPos.x}px` }}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-8 h-8 rounded-full bg-blue-500/20 animate-ping absolute" />
            <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow-md whitespace-nowrap">
            You · Indiranagar
          </span>
        </div>

        {/* Interactive Salon Markers on the Map */}
        {visibleSalons.map((salon) => {
          const coords = salon.coordinates || { lat: 12.9716, lng: 77.6412 };
          const pos = projectCoords(coords.lat, coords.lng);
          const isSelected = selectedSalon?.id === salon.id;
          const advancePrice = Math.round((salon.services[0]?.price || 499) * 0.25);
          const activeService = matchedService ? matchedService(salon) : undefined;

          return (
            <div
              key={salon.id}
              style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSalon(salon);
              }}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-110 group"
            >
              {/* Marker Container */}
              <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-md transition-all duration-200 border ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-400 ring-4 ring-violet-200 scale-110 z-40'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-violet-500 hover:bg-slate-50'
                }`}
              >
                {/* Pin Icon / Category Icon */}
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  <Scissors className="w-3 h-3" />
                </div>

                {/* Name & Advance Tag */}
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-black truncate max-w-[100px] sm:max-w-[130px]">
                    {salon.name.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-bold">
                    <span className={isSelected ? 'text-amber-200' : 'text-amber-600'}>★ {salon.rating}</span>
                    <span className={isSelected ? 'text-violet-200' : 'text-slate-300'}>·</span>
                    <span className={isSelected ? 'text-emerald-200' : 'text-emerald-700'}>₹{advancePrice} adv</span>
                  </div>
                </div>

                {/* Pointer Arrow Tail */}
                <div
                  className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
                    isSelected
                      ? 'bg-violet-600 border-violet-400'
                      : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              {/* Hover Tooltip Preview */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-center shadow-lg whitespace-nowrap">
                  <span className="text-[10px] font-bold text-slate-900 block">{salon.name}</span>
                  <span className="text-[9px] text-slate-500">
                    {salon.area} · {salon.distanceKm} km away
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Horizontal Thumb-Scroll Carousel of Salon Cards */}
      <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
        <div
          ref={carouselRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pointer-events-auto py-1 px-0.5"
        >
          {visibleSalons.map((salon) => {
            const isSelected = selectedSalon?.id === salon.id;
            const advancePrice = Math.round((salon.services[0]?.price || 499) * 0.25);
            const activeService = matchedService ? matchedService(salon) : undefined;

            return (
              <div
                id={`map-card-${salon.id}`}
                key={salon.id}
                onClick={() => {
                  onSelectSalon(salon);
                  // Pan map to center on this salon
                  const coords = salon.coordinates || { lat: 12.9716, lng: 77.6412 };
                  const latScale = 2400 * zoom;
                  const lngScale = 2400 * zoom;
                  const targetPanX = -(coords.lng - centerLng) * lngScale;
                  const targetPanY = (coords.lat - centerLat) * latScale;
                  setPan({ x: targetPanX, y: targetPanY });
                }}
                className={`w-[260px] sm:w-[300px] shrink-0 bg-white/95 backdrop-blur-md rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-lg ${
                  isSelected
                    ? 'border-violet-600 ring-2 ring-violet-400/40 shadow-violet-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={salon.bannerImage}
                    alt={salon.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{salon.name}</h4>
                      {salon.verifiedBadge && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{salon.area} · {salon.distanceKm} km</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                      <span className="text-amber-600 font-bold">★ {salon.rating}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-bold">25% Adv: ₹{advancePrice}</span>
                    </div>
                  </div>
                </div>

                {/* Matched service tag or active promo tag */}
                {activeService && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-violet-700">
                    <span className="truncate font-medium">Offers: {activeService.name}</span>
                    <span className="font-bold text-slate-900">₹{activeService.price}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-2.5 flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSalonId(salon.id);
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    View Menu
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeService) {
                        startBookingForSalon(salon, activeService);
                      } else {
                        startBookingForSalon(salon);
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Book Slot →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
