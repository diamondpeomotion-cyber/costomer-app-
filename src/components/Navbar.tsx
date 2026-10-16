import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  Search, 
  Heart, 
  Coins, 
  Database,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationModal } from './LocationModal';

export const Navbar: React.FC = () => {
  const { 
    currentLocation, 
    customer, 
    activeTab, 
    setActiveTab, 
    setSelectedSalonId,
    supabaseSyncStatus,
    showToast
  } = useApp();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  const handleBrandClick = () => {
    setSelectedSalonId(null);
    setActiveTab('home');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-colors shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & StudioFlow Ecosystem sync */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 p-0.5 shadow-sm shadow-violet-500/20">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-600 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">Nexora</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200">
                    StudioFlow
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">
                  Salon Discovery & Advance Booking
                </p>
              </div>
            </button>

            {/* StudioFlow Live Status Pill */}
            <button
              onClick={() => setShowSyncInfo(!showSyncInfo)}
              type="button"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Shared Database connected: Salons, Bookings & Rewards live synced"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3 h-3 text-emerald-600" />
              <span>StudioFlow DB Synced</span>
            </button>
          </div>

          {/* Location Selector */}
          <button
            onClick={() => setLocationModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 px-3 py-1.5 rounded-full transition-all text-xs font-semibold cursor-pointer max-w-[190px] sm:max-w-[240px] truncate shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span className="truncate">
              {currentLocation.area}, {currentLocation.city}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </button>

          {/* Quick Actions (Rewards coin pill, Favorites, Profile) */}
          <div className="flex items-center gap-2">
            {/* Rewards Coin Chip (0 pts style) */}
            <button
              onClick={() => {
                setSelectedSalonId(null);
                setActiveTab('rewards');
              }}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
              title="Nexora Loyalty Points"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold font-mono text-amber-900">{customer.loyaltyPoints} pts</span>
            </button>

            {/* Language Toggle (हिंदी) */}
            <button
              onClick={() => showToast('Switched language to हिंदी (Hindi)', 'info')}
              type="button"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              title="Change Language"
            >
              <span className="text-xs">🌐</span>
              <span>हिंदी</span>
            </button>

            {/* Notification Bell with red dot */}
            <button
              onClick={() => showToast('No new notifications', 'info')}
              type="button"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 relative cursor-pointer transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            </button>

            {/* Profile Avatar Quick Link */}
            <button
              onClick={() => {
                setSelectedSalonId(null);
                setActiveTab('profile');
              }}
              type="button"
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer shadow-2xs ${
                activeTab === 'profile'
                  ? 'border-violet-600 ring-2 ring-violet-500/30'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
              title="Customer Profile"
            >
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Sync Info Banner (Accordion) */}
        {showSyncInfo && (
          <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-900 animate-fade-in">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong className="text-emerald-950 font-bold">Unified Supabase Database:</strong> Salon Websites, StudioFlow Owner Dashboard & Nexora Customer App share live catalog & instant bookings.
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-emerald-800">
                <span>{supabaseSyncStatus.publishedSalonsCount} Salons Published</span>
                <span>·</span>
                <span className="text-emerald-950 font-semibold font-mono">25% Advance Escrow Online</span>
                <button
                  onClick={() => setShowSyncInfo(false)}
                  className="text-emerald-700 hover:text-emerald-950 underline cursor-pointer font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
};
