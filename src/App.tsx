import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { SalonDetailView } from './components/SalonDetailView';
import { MyBookingsView } from './components/MyBookingsView';
import { RewardsView } from './components/RewardsView';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { BookingModal } from './components/BookingModal';
import { PromotionReelModal } from './components/PromotionReelModal';
import { Smartphone, Monitor, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    activeSalon, 
    activeReel, 
    setActiveReel, 
    notificationToast 
  } = useApp();

  const [deviceFrame, setDeviceFrame] = useState<'responsive' | 'mobile_preview'>('responsive');

  return (
    <div className="min-h-screen bg-[#F0EDF8] text-[#242132] flex flex-col selection:bg-violet-200 selection:text-violet-900">
      {/* Main Container Wrapper - Responsive & Native Mobile App Feel */}
      <div
        className={`flex-1 flex flex-col w-full transition-all ${
          deviceFrame === 'mobile_preview'
            ? 'max-w-[420px] mx-auto my-3 border border-[#D8D0E7] rounded-3xl shadow-xl overflow-hidden min-h-[92vh] bg-white relative'
            : 'max-w-5xl mx-auto bg-[#F0EDF8]'
        }`}
      >
        {/* Navigation Bar */}
        <Navbar />

        {/* View Routing */}
        <main className="flex-1 w-full">
          {activeSalon ? (
            <SalonDetailView />
          ) : (
            <>
              {activeTab === 'home' && <HomeView />}
              {activeTab === 'explore' && <ExploreView />}
              {activeTab === 'bookings' && <MyBookingsView />}
              {activeTab === 'rewards' && <RewardsView />}
              {activeTab === 'favorites' && <FavoritesView />}
              {activeTab === 'profile' && <ProfileView />}
            </>
          )}
        </main>

        {/* Bottom Navigation Tabs */}
        <BottomNavigation />
      </div>

      {/* Global Booking Flow Modal */}
      <BookingModal />

      {/* Promotion Reel Modal */}
      <PromotionReelModal
        reel={activeReel}
        onClose={() => setActiveReel(null)}
      />

      {/* Global Notification Toast */}
      {notificationToast && notificationToast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold border ${
              notificationToast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : notificationToast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-white text-slate-800 border-slate-200 shadow-md'
            }`}
          >
            {notificationToast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            {notificationToast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {notificationToast.type === 'info' && (
              <Info className="w-4 h-4 text-violet-600 shrink-0" />
            )}
            <span>{notificationToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
