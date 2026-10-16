import React, { useState } from 'react';
import { MapPin, Navigation, Check, X, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CITIES = [
  {
    name: 'Bangalore',
    popularAreas: [
      { area: 'Indiranagar', pincode: '560038' },
      { area: 'Koramangala', pincode: '560034' },
      { area: 'HSR Layout', pincode: '560102' },
      { area: 'Jayanagar', pincode: '560011' },
      { area: 'Whitefield', pincode: '560066' },
      { area: 'MG Road / CBD', pincode: '560001' },
    ],
  },
  {
    name: 'Mumbai',
    popularAreas: [
      { area: 'Bandra West', pincode: '400050' },
      { area: 'Juhu', pincode: '400049' },
      { area: 'Andheri West', pincode: '400053' },
      { area: 'Lower Parel', pincode: '400013' },
    ],
  },
  {
    name: 'Delhi NCR',
    popularAreas: [
      { area: 'South Extension', pincode: '110049' },
      { area: 'Cyber City, Gurgaon', pincode: '122002' },
      { area: 'Connaught Place', pincode: '110001' },
      { area: 'Vasant Kunj', pincode: '110070' },
    ],
  },
  {
    name: 'Hyderabad',
    popularAreas: [
      { area: 'Jubilee Hills', pincode: '500033' },
      { area: 'Banjara Hills', pincode: '500034' },
      { area: 'Gachibowli', pincode: '500032' },
    ],
  },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { currentLocation, setCurrentLocation, showToast } = useApp();
  const [selectedCity, setSelectedCity] = useState(currentLocation.city);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const currentCityData = CITIES.find((c) => c.name === selectedCity) || CITIES[0];

  const handleSelectArea = (area: string, pincode: string) => {
    setCurrentLocation({
      city: selectedCity,
      area,
      pincode,
    });
    showToast(`Location set to ${area}, ${selectedCity}`, 'success');
    onClose();
  };

  const handleDetectGPS = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setCurrentLocation({
        city: 'Bangalore',
        area: 'Indiranagar',
        pincode: '560038',
      });
      showToast('Detected: Indiranagar, Bangalore (1.4 km from Luxe Aurum)', 'success');
      onClose();
    }, 1200);
  };

  const filteredAreas = currentCityData.popularAreas.filter(
    (item) =>
      item.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pincode.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-base">Select Your Location</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Detect */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-all text-violet-800 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Navigation className={`w-4 h-4 text-violet-600 ${isDetecting ? 'animate-spin' : ''}`} />
              <span className="text-xs font-semibold">
                {isDetecting ? 'Locating nearby published salons...' : 'Use Current Device Location (GPS)'}
              </span>
            </div>
            <span className="text-[10px] text-violet-600 font-bold group-hover:translate-x-0.5 transition-transform">
              Auto-detect →
            </span>
          </button>
        </div>

        {/* City Tabs */}
        <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCity(c.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCity === c.name
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search locality or pincode in ${selectedCity}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Localities List */}
        <div className="px-4 pb-4 overflow-y-auto space-y-1.5 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Popular Neighborhoods in {selectedCity}
          </p>
          {filteredAreas.map((item) => {
            const isSelected =
              currentLocation.city === selectedCity && currentLocation.area === item.area;
            return (
              <button
                key={item.area}
                onClick={() => handleSelectArea(item.area, item.pincode)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50 border border-violet-300 text-violet-900 font-bold'
                    : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-medium">{item.area}</p>
                  <p className="text-[10px] text-slate-500 font-mono">PIN: {item.pincode}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-violet-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
