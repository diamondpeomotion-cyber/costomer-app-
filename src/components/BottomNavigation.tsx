import React from 'react';
import { 
  Home, 
  Compass, 
  CalendarCheck, 
  Gift, 
  Heart, 
  User 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';

export const BottomNavigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setSelectedSalonId, 
    bookings, 
    customer 
  } = useApp();

  const upcomingCount = bookings.filter(
    (b) => b.paymentStatus === 'advance_paid' || b.paymentStatus === 'pending_payment'
  ).length;

  const handleNav = (tab: NavigationTab) => {
    setSelectedSalonId(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { 
      id: 'bookings' as const, 
      label: 'My Bookings', 
      icon: CalendarCheck,
      badge: upcomingCount > 0 ? upcomingCount : undefined,
    },
    { 
      id: 'rewards' as const, 
      label: 'Rewards', 
      icon: Gift,
      chip: `${customer.loyaltyPoints}`,
    },
    { 
      id: 'favorites' as const, 
      label: 'Favorites', 
      icon: Heart,
      badge: customer.savedSalonIds.length > 0 ? customer.savedSalonIds.length : undefined,
    },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-violet-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-violet-600' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-full ${
                isActive ? 'text-violet-700 font-bold' : 'text-slate-500'
              }`}>
                {item.label}
              </span>

              {/* Active subtle indicator dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
