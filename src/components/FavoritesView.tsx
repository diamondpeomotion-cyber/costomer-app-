import React from 'react';
import { Heart, Star, MapPin, Sparkles, Scissors } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FavoritesView: React.FC = () => {
  const { 
    salons, 
    customer, 
    toggleFavoriteSalon, 
    setSelectedSalonId, 
    startBookingForSalon,
    setActiveTab 
  } = useApp();

  const favoriteSalons = salons.filter((s) => customer.savedSalonIds.includes(s.id));

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-900">Saved Salons & Favorites</h1>
        <p className="text-xs text-slate-500">
          Quickly access your preferred stylists and salons for fast rebooking
        </p>
      </div>

      {favoriteSalons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No saved salons yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tap the heart icon on any salon to save it here for instant one-click bookings.
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Discover Salons
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteSalons.map((salon) => (
            <div
              key={salon.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-violet-300 transition-all shadow-xs"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={salon.bannerImage}
                  alt={salon.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                <button
                  onClick={() => toggleFavoriteSalon(salon.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-rose-500 text-white shadow-md cursor-pointer hover:bg-rose-600 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-white/90 backdrop-blur-sm text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                    {salon.templateName.replace('StudioFlow ', '')}
                  </span>
                  <span className="flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow-sm">
                    <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                    {salon.rating}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{salon.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {salon.area} · {salon.distanceKm} km away
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">25% Advance</span>
                    <span className="text-xs font-black text-emerald-700">
                      ₹{Math.round((salon.services[0]?.price || 499) * 0.25)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSalonId(salon.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Menu
                    </button>
                    <button
                      onClick={() => startBookingForSalon(salon)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
