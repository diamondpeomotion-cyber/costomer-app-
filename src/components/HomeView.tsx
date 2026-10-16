import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Play, 
  Clock, 
  Tag, 
  Copy, 
  Check, 
  Compass, 
  Scissors, 
  Heart, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Filter,
  X,
  SlidersHorizontal,
  Flame,
  Percent,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  SERVICE_CATEGORIES_CONFIG, 
  PLATFORM_OFFERS, 
  POPULAR_FILTER_SERVICES 
} from '../data/mockSalons';
import { Salon, PromotionVideo, ServiceItem } from '../types';
import { FilterChip } from './FilterChip';

export const HomeView: React.FC = () => {
  const { 
    salons, 
    customer, 
    currentLocation, 
    setSelectedSalonId, 
    setActiveTab, 
    startBookingForSalon,
    setActiveReel,
    toggleFavoriteSalon,
    isSalonFavorite,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSpecificService,
    setSelectedSpecificService,
    filterDate,
    setFilterDate,
    filterTimeSlot,
    setFilterTimeSlot,
    filterPromotionType,
    setFilterPromotionType,
    maxDistance,
    setMaxDistance,
    selectedPrice,
    setSelectedPrice,
    minRating,
    setMinRating,
    minDiscountPercent,
    setMinDiscountPercent,
    resetAllFilters,
    activeFiltersCount,
    showToast
  } = useApp();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showQuickFilterModal, setShowQuickFilterModal] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyOfferCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Promo code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('explore');
  };

  const handleServiceChipClick = (serviceId: string) => {
    if (selectedSpecificService === serviceId) {
      setSelectedSpecificService(null);
    } else {
      setSelectedSpecificService(serviceId);
      setActiveTab('explore');
      showToast(`Filtering salons offering "${POPULAR_FILTER_SERVICES.find(s => s.id === serviceId)?.label}"`, 'info');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    if (searchQuery.trim()) {
      setActiveTab('explore');
    }
  };

  // Live Autocomplete Suggestions
  const query = searchQuery.trim().toLowerCase();
  const matchingSalons = query
    ? salons.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.area.toLowerCase().includes(query) ||
          s.tagline.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const matchingServices: { service: ServiceItem; salon: Salon }[] = [];
  if (query) {
    for (const salon of salons) {
      for (const srv of salon.services) {
        if (
          srv.name.toLowerCase().includes(query) ||
          srv.description.toLowerCase().includes(query)
        ) {
          matchingServices.push({ service: srv, salon });
          if (matchingServices.length >= 4) break;
        }
      }
      if (matchingServices.length >= 4) break;
    }
  }

  // Extract all promotion reels across salons
  const allReels: PromotionVideo[] = salons.flatMap((s) => s.promotions);

  // Check if a salon satisfies current home filter criteria
  const checkSalonMatchesFilters = (salon: Salon) => {
    // Specific service check
    if (selectedSpecificService) {
      const filterConfig = POPULAR_FILTER_SERVICES.find((f) => f.id === selectedSpecificService);
      if (filterConfig) {
        const matchesService = salon.services.some((s) =>
          filterConfig.keywords.some((kw) =>
            s.name.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)
          )
        );
        if (!matchesService) return false;
      }
    }

    // Date Availability check
    if (filterDate) {
      const targetDate = filterDate === 'today'
        ? new Date()
        : filterDate === 'tomorrow'
        ? new Date(Date.now() + 86400000)
        : new Date(filterDate);
      const dayOfWeek = targetDate.getDay();
      const hasStaff = salon.staff.some((st) => st.availableDays.includes(dayOfWeek));
      if (!hasStaff) return false;
    }

    // Time slot check
    if (filterTimeSlot === 'morning') {
      if (salon.openingHours.includes('10:00 AM') || salon.openingHours.includes('09:30 AM') || salon.openingHours.includes('09:00 AM') || salon.openingHours.includes('08:30 AM')) {
        // available morning
      } else {
        return false;
      }
    } else if (filterTimeSlot === 'evening') {
      if (salon.openingHours.includes('09:30 PM') || salon.openingHours.includes('10:00 PM') || salon.openingHours.includes('09:00 PM') || salon.openingHours.includes('08:30 PM')) {
        // available evening
      } else {
        return false;
      }
    }

    // Category check
    if (selectedCategory && selectedCategory !== 'all') {
      const hasCat = salon.categories.includes(selectedCategory as any);
      if (!hasCat) return false;
    }

    // Distance Radius check
    if (salon.distanceKm > maxDistance) return false;

    // Minimum Rating check
    if (minRating > 0 && salon.rating < minRating) return false;

    // Price Level check
    if (selectedPrice !== 'all' && salon.priceLevel !== selectedPrice) return false;

    // Promotion check
    if (filterPromotionType === 'any_offer') {
      if (!salon.offers || salon.offers.length === 0) return false;
    } else if (filterPromotionType === 'package_discount') {
      const hasDiscountedPkg = salon.packages.some((p) => p.discountPercent >= 20);
      if (!hasDiscountedPkg) return false;
    } else if (filterPromotionType === 'video_reels') {
      if (!salon.promotions || salon.promotions.length === 0) return false;
    }

    // Minimum discount percent
    if (minDiscountPercent > 0) {
      const offerDiscount = salon.offers?.[0]?.discountPercent || 0;
      const packageDiscount = salon.packages?.[0]?.discountPercent || 0;
      if (Math.max(offerDiscount, packageDiscount) < minDiscountPercent) return false;
    }

    return true;
  };

  // Recommended Salons (top rated)
  const recommendedSalons = [...salons]
    .filter(checkSalonMatchesFilters)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Nearby Salons sorted by distance
  const nearbySalons = [...salons]
    .filter(checkSalonMatchesFilters)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 pt-4 space-y-6 animate-fade-in">
      {/* Clean Simple Normal App Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Nexora Directory · Live Synced
            </span>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-[#242132] hover:bg-[#ECE7FF] flex items-center gap-1 cursor-pointer font-medium bg-[#FFFFFF] px-3.5 py-2.5 min-h-[44px] rounded-full border border-[#D8D0E7] transition-colors shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset {activeFiltersCount} Filters</span>
            </button>
          )}
        </div>

        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#242132] tracking-tight">
            Hello, {customer.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#65567E] mt-1">
            Discover nearby salons, check slot availability, and book appointments instantly.
          </p>
        </div>

      {/* Search Bar Form with Live Autocomplete */}
      <div ref={searchContainerRef} className="relative pt-2">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#766A83] absolute left-4" />
                <input
                  type="text"
                  placeholder="Search specific treatments, salons, skin fades, hydra facial, keratin..."
                  value={searchQuery}
                  onFocus={() => setShowSearchDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  className="w-full bg-[#FFFFFF] border border-[#D8D0E7] rounded-2xl pl-11 pr-26 py-3 min-h-[48px] text-xs sm:text-sm text-[#242132] placeholder-[#766A83] focus:outline-none focus:ring-2 focus:ring-[#A492F3] shadow-xs transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center justify-center"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSearchDropdown && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in space-y-3">
                {matchingSalons.length === 0 && matchingServices.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 text-center">
                    No exact match found. Press Enter to search all directory records.
                  </p>
                ) : (
                  <>
                    {/* Matching Salons */}
                    {matchingSalons.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block mb-1.5 px-1">
                          Salons
                        </span>
                        <div className="space-y-1">
                          {matchingSalons.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setShowSearchDropdown(false);
                                setSelectedSalonId(s.id);
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={s.bannerImage}
                                  alt={s.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-900 leading-tight">{s.name}</p>
                                  <p className="text-[10px] text-slate-500">{s.area} · {s.distanceKm} km</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-amber-700">★ {s.rating}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Specific Services */}
                    {matchingServices.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1.5 px-1">
                          Matching Services Offered
                        </span>
                        <div className="space-y-1">
                          {matchingServices.map(({ service, salon }) => (
                            <div
                              key={service.id}
                              onClick={() => {
                                setShowSearchDropdown(false);
                                startBookingForSalon(salon, service);
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div>
                                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                                  <Scissors className="w-3 h-3 text-emerald-600" />
                                  <span>{service.name}</span>
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  At {salon.name} ({salon.area}) · {service.durationMinutes} mins
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-slate-900">₹{service.price}</span>
                                <span className="text-[9px] text-emerald-600 block font-bold">Book Slot →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-[11px] text-slate-500">Showing suggestions</span>
                      <button
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setActiveTab('explore');
                        }}
                        className="text-violet-700 hover:text-violet-800 font-bold"
                      >
                        Explore All Results →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Filter Pill Toolbar (Services, Availability & Promotions) */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {/* Open Full Filter Drawer */}
            <button
              onClick={() => setShowQuickFilterModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                activeFiltersCount > 0
                  ? 'bg-[#5841E8] text-white font-bold'
                  : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#242132] border border-[#D8D0E7]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#5841E8] text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Availability: Today */}
            <button
              onClick={() => setFilterDate(filterDate === 'today' ? null : 'today')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterDate === 'today'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#242132] border border-[#D8D0E7]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available Today</span>
            </button>

            {/* Quick Availability: Evening Slots */}
            <button
              onClick={() => setFilterTimeSlot(filterTimeSlot === 'evening' ? null : 'evening')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterTimeSlot === 'evening'
                  ? 'bg-[#5841E8] text-white font-bold shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#242132] border border-[#D8D0E7]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#5841E8]" />
              <span>Evening Slots</span>
            </button>

            {/* Quick Promotion: Active Offers */}
            <button
              onClick={() => setFilterPromotionType(filterPromotionType === 'any_offer' ? null : 'any_offer')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterPromotionType === 'any_offer'
                  ? 'bg-amber-400 text-[#242132] font-bold shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#242132] border border-[#D8D0E7]'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Active Offers</span>
            </button>

            {/* Quick Promotion: Video Reels */}
            <button
              onClick={() => setFilterPromotionType(filterPromotionType === 'video_reels' ? null : 'video_reels')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterPromotionType === 'video_reels'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#242132] border border-[#D8D0E7]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Reels</span>
            </button>
          </div>

          {/* Quick Specific Service Chips Bar */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] uppercase font-bold text-[#65567E] shrink-0">
              Popular:
            </span>
            {POPULAR_FILTER_SERVICES.slice(0, 6).map((srv) => {
              const isSelected = selectedSpecificService === srv.id;
              return (
                <button
                  key={srv.id}
                  onClick={() => handleServiceChipClick(srv.id)}
                  className={`px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#5841E8] text-white font-bold shadow-xs'
                      : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#242132] border border-[#D8D0E7]'
                  }`}
                >
                  {srv.label}
                </button>
              );
            })}
          </div>
        </div>

      {/* Active Filter Criteria Summary Bar if filters applied on Home */}
      {activeFiltersCount > 0 && (
        <div className="p-3 bg-violet-50 border border-violet-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-violet-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-violet-800 mr-1">Active Criteria:</span>
            {selectedSpecificService && (
              <FilterChip
                category="Service"
                label={POPULAR_FILTER_SERVICES.find((f) => f.id === selectedSpecificService)?.label || selectedSpecificService}
                icon={<Scissors className="w-3.5 h-3.5 text-violet-400" />}
                variant="violet"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setSelectedSpecificService(null)}
              />
            )}
            {filterDate && (
              <FilterChip
                category="Date"
                label={filterDate === 'today' ? 'Available Today' : filterDate === 'tomorrow' ? 'Available Tomorrow' : filterDate}
                icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
                variant="emerald"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setFilterDate(null)}
              />
            )}
            {filterTimeSlot && (
              <FilterChip
                category="Slot"
                label={filterTimeSlot.charAt(0).toUpperCase() + filterTimeSlot.slice(1)}
                icon={<Clock className="w-3.5 h-3.5 text-indigo-400" />}
                variant="indigo"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setFilterTimeSlot(null)}
              />
            )}
            {filterPromotionType && (
              <FilterChip
                category="Deal"
                label={filterPromotionType.replace('_', ' ')}
                icon={<Tag className="w-3.5 h-3.5 text-amber-400" />}
                variant="amber"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setFilterPromotionType(null)}
              />
            )}
            {selectedCategory && (
              <FilterChip
                category="Category"
                label={selectedCategory.replace('_', ' ')}
                variant="violet"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setSelectedCategory(null)}
              />
            )}
            {selectedPrice !== 'all' && (
              <FilterChip
                category="Price"
                label={
                  selectedPrice === '₹'
                    ? 'Budget (₹)'
                    : selectedPrice === '₹₹'
                    ? 'Standard (₹₹)'
                    : 'Luxury (₹₹₹)'
                }
                variant="default"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setSelectedPrice('all')}
              />
            )}
            {maxDistance < 10 && (
              <FilterChip
                category="Distance"
                label={`Within ${maxDistance}km`}
                icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                variant="default"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setMaxDistance(10)}
              />
            )}
            {minRating > 0 && (
              <FilterChip
                category="Rating"
                label={`${minRating}+ ★`}
                icon={<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                variant="amber"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setMinRating(0)}
              />
            )}
            {minDiscountPercent > 0 && (
              <FilterChip
                category="Discount"
                label={`≥ ${minDiscountPercent}% OFF`}
                icon={<Percent className="w-3.5 h-3.5 text-amber-400" />}
                variant="amber"
                onClick={() => setActiveTab('explore')}
                onRemove={() => setMinDiscountPercent(0)}
              />
            )}
          </div>
          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer min-h-[44px] px-3 py-2 inline-flex items-center"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Festival Offers Banner matching screenshot */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Festival Offers ✨
            </h2>
          </div>
          {/* Pagination Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-1.5 bg-violet-600 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white shadow-lg p-5 sm:p-7 flex flex-col justify-between h-48 sm:h-56 group cursor-pointer border border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200"
            alt="Festive Grooming"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="relative z-10 space-y-1.5">
            <span className="inline-block bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
              ✨ Festive Grooming
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
              Festive Grooming Specials
            </h3>
            <p className="text-xs text-slate-200 line-clamp-1 max-w-md">
              Beard sculpting, hair restyle & royal facial for men
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Flat 25% OFF · Code: FESTIVE25
            </span>
            <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-violet-600 transition-colors shadow-md">
              →
            </div>
          </div>
        </div>
      </section>

      {/* AI Smart Recommendations matching screenshot */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ECE7FF] text-[#5841E8] flex items-center justify-center border border-[#D8D0E7] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#5841E8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#242132] tracking-tight">
                  AI Smart Recommendations
                </h2>
                <span className="bg-[#ECE7FF] text-[#5841E8] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D8D0E7]">
                  SMART AI
                </span>
              </div>
              <p className="text-xs text-[#65567E]">Picks based on your booking cycle & 2026 trending styles</p>
            </div>
          </div>
          <button
            onClick={() => showToast('Refreshed AI recommendations', 'success')}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[#FFFFFF] hover:bg-[#ECE7FF] border border-[#D8D0E7] text-[#65567E] hover:text-[#242132] transition-colors cursor-pointer shadow-xs"
            title="Refresh recommendations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All Picks', 'Hair', 'Beard', 'Skin Glow', 'Scalp & Spa'].map((chip, idx) => (
            <button
              key={chip}
              onClick={() => showToast(`Filtered by ${chip}`, 'info')}
              className={`px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                idx === 0
                  ? 'bg-[#5841E8] text-[#FFFFFF] font-bold shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#ECE7FF] text-[#65567E] border border-[#D8D0E7]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              badge: 'TRENDING #1',
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
              time: '35 mins',
              title: 'Textured Crop & Low Skin Fade',
              salon: 'Luxe Cut & Style Studio',
              tip: 'Top trending style this season. Low maintenance with modern sharp texture.',
              tipFooter: 'Tip: Ask for matte styling paste for...',
              price: 'Rs.149',
            },
            {
              badge: 'POPULAR COMBO',
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
              time: '30 mins',
              title: 'Beard Sculpting & Charcoal Spa',
              salon: 'Nexora At-Home Pro',
              tip: 'Pairs well with sharp haircuts. Activated charcoal deeply cleanses beard follicles.',
              tipFooter: 'Tip: Follow up with argan beard oil...',
              price: 'Rs.119',
            },
            {
              badge: 'TIME TO REFRESH',
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
              time: '45 mins',
              title: 'Aromatic Scalp Detox & Head...',
              salon: 'Urban Glow Unisex Lounge',
              tip: 'Ideal 3 weeks after your haircut to rejuvenate roots and release...',
              tipFooter: 'Tip: Includes 15-min essential oil massage',
              price: 'Rs.199',
            },
            {
              badge: 'INSTANT GLOW',
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
              time: '40 mins',
              title: 'Hydra-Facial Quick Glow &...',
              salon: 'Crown & Blade Barbershop',
              tip: 'Fast 40-minute de-tan & hydration session trending for...',
              tipFooter: 'Tip: Zero downtime, instant radiance',
              price: 'Rs.249',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-[#FFFFFF] border border-[#D8D0E7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#A492F3] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[#65567E]">
                    <Clock className="w-3 h-3 text-[#766A83]" />
                    <span>{card.time}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#242132] leading-tight">{card.title}</h3>
                  <p className="text-xs text-[#65567E] mt-0.5 flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-[#5841E8]" />
                    <span>{card.salon}</span>
                  </p>
                </div>

                {/* AI Tip Box */}
                <div className="bg-[#ECE7FF] border border-[#D8D0E7] rounded-xl p-3 space-y-1">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#5841E8] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#242132] leading-relaxed font-medium">
                      {card.tip}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#65567E] italic pl-5">
                    {card.tipFooter}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D8D0E7] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#766A83] uppercase tracking-wider block">ESTIMATED</span>
                  <span className="text-sm font-black text-[#242132] font-mono">{card.price}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('explore');
                  }}
                  className="flex items-center gap-1.5 bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-bold px-4 py-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <span>Book Style</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
            Service Categories
          </h2>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveTab('explore');
            }}
            className="text-xs text-[#5841E8] hover:text-[#4834d4] font-semibold cursor-pointer min-h-[44px] px-3 inline-flex items-center"
          >
            View All Services →
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {SERVICE_CATEGORIES_CONFIG.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:bg-slate-50 transition-all text-center group cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 group-hover:bg-violet-100 text-violet-600 flex items-center justify-center mb-1.5 transition-colors">
                <Scissors className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-semibold text-slate-800 leading-tight line-clamp-1">
                {cat.label}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">{cat.count} Options</span>
            </button>
          ))}
        </div>
      </section>

      {/* Promotion Video Reels Carousel */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Trending Salon Reels & Looks
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Tap to watch & book directly</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {allReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              className="relative min-w-[200px] sm:min-w-[240px] h-72 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 shrink-0 shadow-xs"
            >
              <img
                src={reel.videoThumbnail}
                alt={reel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

              {/* Reel Badge & Duration */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="bg-rose-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Reel
                </span>
                <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {reel.duration}
                </span>
              </div>

              {/* Play icon centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <span className="text-[10px] font-bold text-violet-300 block">
                  {reel.salonName}
                </span>
                <p className="text-xs font-semibold text-white line-clamp-1">
                  {reel.title}
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                  <span className="text-amber-300 font-bold">{reel.priceTag}</span>
                  <span className="text-emerald-400 font-semibold">{reel.discountTag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Salons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Recommended Salons {activeFiltersCount > 0 ? `(${recommendedSalons.length} match)` : ''}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs text-violet-600 hover:text-violet-700 font-semibold cursor-pointer"
          >
            Explore All ({salons.length}) →
          </button>
        </div>

        {recommendedSalons.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">No recommended salons match current filter selections.</p>
            <button
              onClick={resetAllFilters}
              className="text-xs text-violet-600 hover:text-violet-700 underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendedSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-violet-300 transition-all shadow-xs"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={salon.bannerImage}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteSalon(salon.id);
                    }}
                    className={`absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                      isSalonFavorite(salon.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/50 text-white hover:bg-black/80'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSalonFavorite(salon.id) ? 'fill-white' : ''}`} />
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
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{salon.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {salon.area} · {salon.distanceKm} km away
                      </span>
                    </p>
                    
                    {/* Filter Match Badge */}
                    {selectedSpecificService && (
                      <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1.5">
                        ✓ Offers {POPULAR_FILTER_SERVICES.find((f) => f.id === selectedSpecificService)?.label}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Services From</span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{salon.services[0]?.price || 499}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSalonId(salon.id)}
                        className="px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                      >
                        Menu
                      </button>
                      <button
                        onClick={() => startBookingForSalon(salon)}
                        className="px-4 py-2 min-h-[44px] inline-flex items-center rounded-xl bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
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
      </section>

      {/* Nearby Salons Directory */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Salons Near {currentLocation.area} ({nearbySalons.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Sorted by distance</span>
        </div>

        <div className="space-y-3">
          {nearbySalons.map((salon) => (
            <div
              key={salon.id}
              onClick={() => setSelectedSalonId(salon.id)}
              className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-xs"
            >
              <div className="flex items-start gap-3">
                <img
                  src={salon.bannerImage}
                  alt={salon.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {salon.name}
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                      ★ {salon.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{salon.address}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-medium">Open {salon.openingHours}</span>
                    <span>·</span>
                    <span>{salon.distanceKm} km away</span>
                    <span>·</span>
                    <span className="text-violet-700 font-medium">{salon.templateName.replace('StudioFlow ', '')}</span>
                  </div>

                  {/* Highlights for current active filter */}
                  {salon.offers[0] && (
                    <span className="inline-block text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      🏷️ {salon.offers[0].title} (Code: {salon.offers[0].code})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">25% Advance Starting</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    ₹{Math.round((salon.services[0]?.price || 499) * 0.25)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startBookingForSalon(salon);
                  }}
                  className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center bg-[#5841E8] hover:bg-[#4834d4] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Book Slot →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK FILTER MODAL / DRAWER */}
      {showQuickFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#D8D0E7] rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto text-[#242132]">
            <div className="flex justify-between items-center pb-3 border-b border-[#D8D0E7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ECE7FF] flex items-center justify-center text-[#5841E8]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#242132]">Filter Salons & Slots</h3>
              </div>
              <button
                onClick={() => setShowQuickFilterModal(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#766A83] hover:text-[#242132] hover:bg-[#ECE7FF] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Filter by Specific Service Offered */}
            <div>
              <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                Specific Service Offered
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_FILTER_SERVICES.map((srv) => {
                  const isSelected = selectedSpecificService === srv.id;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => setSelectedSpecificService(isSelected ? null : srv.id)}
                      className={`p-2.5 min-h-[44px] rounded-xl text-left text-xs transition-colors cursor-pointer flex items-center shadow-xs border ${
                        isSelected
                          ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold'
                          : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                      }`}
                    >
                      <span className="truncate">{srv.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Filter by Availability (Date & Time) */}
            <div>
              <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                Availability on Particular Date
              </label>
              <div className="flex gap-2">
                {['today', 'tomorrow'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDate(filterDate === d ? null : d)}
                    className={`flex-1 min-h-[44px] py-2 text-xs font-semibold rounded-xl capitalize transition-colors cursor-pointer flex items-center justify-center shadow-xs border ${
                      filterDate === d
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                        : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                Time Slot Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'morning', label: 'Morning (10am-1pm)' },
                  { id: 'afternoon', label: 'Afternoon (1pm-5pm)' },
                  { id: 'evening', label: 'Evening (5pm-9pm)' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setFilterTimeSlot(filterTimeSlot === slot.id ? null : slot.id)}
                    className={`p-2 min-h-[44px] text-center text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center shadow-xs border ${
                      filterTimeSlot === slot.id
                        ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold'
                        : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Filter by Current Promotions */}
            <div>
              <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                Current Promotions & Offers
              </label>
              <div className="space-y-2">
                {[
                  { id: 'any_offer', label: 'Active Promo Codes (e.g. FESTIVE25, 20% OFF)' },
                  { id: 'package_discount', label: 'Packages with Bundled Savings (20%+)' },
                  { id: 'video_reels', label: 'Salons with Video Transformation Reels' },
                ].map((promo) => (
                  <button
                    key={promo.id}
                    onClick={() => setFilterPromotionType(filterPromotionType === promo.id ? null : promo.id)}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer flex items-center justify-between shadow-xs border ${
                      filterPromotionType === promo.id
                        ? 'bg-[#ECE7FF] border-[#5841E8] text-[#5841E8] font-bold'
                        : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                    }`}
                  >
                    <span>{promo.label}</span>
                    {filterPromotionType === promo.id && <Check className="w-4 h-4 text-[#5841E8]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Filter by Service Category */}
            <div>
              <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                Service Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-xl text-xs font-semibold cursor-pointer shadow-xs border ${
                    selectedCategory === null
                      ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold'
                      : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                  }`}
                >
                  All Categories
                </button>
                {SERVICE_CATEGORIES_CONFIG.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-xl text-xs font-semibold cursor-pointer shadow-xs border ${
                      selectedCategory === cat.id
                        ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold'
                        : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Distance Radius & Price Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                  Distance: {maxDistance} km
                </label>
                <div className="flex gap-1.5">
                  {[3, 5, 10, 20].map((d) => (
                    <button
                      key={d}
                      onClick={() => setMaxDistance(d)}
                      className={`flex-1 min-h-[44px] py-2 text-xs rounded-xl font-bold cursor-pointer flex items-center justify-center shadow-xs border ${
                        maxDistance === d
                          ? 'bg-[#5841E8] border-[#5841E8] text-white'
                          : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#65567E] hover:text-[#242132] hover:bg-[#ECE7FF]'
                      }`}
                    >
                      {d}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                  Price Level
                </label>
                <div className="flex gap-1.5">
                  {['all', '₹', '₹₹', '₹₹₹'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPrice(p)}
                      className={`flex-1 min-h-[44px] py-2 text-xs rounded-xl font-bold cursor-pointer flex items-center justify-center shadow-xs border ${
                        selectedPrice === p
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#65567E] hover:text-[#242132] hover:bg-[#ECE7FF]'
                      }`}
                    >
                      {p === 'all' ? 'All' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Minimum Rating */}
            <div>
              <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[
                  { r: 0, label: 'All Ratings' },
                  { r: 4.5, label: '4.5+ ★ Superior' },
                  { r: 4.8, label: '4.8+ ★ Elite' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setMinRating(item.r)}
                    className={`flex-1 min-h-[44px] py-2 text-xs rounded-xl font-semibold cursor-pointer flex items-center justify-center shadow-xs border ${
                      minRating === item.r
                        ? 'bg-amber-400 border-amber-400 text-[#242132] font-bold'
                        : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-[#D8D0E7]">
              <button
                onClick={resetAllFilters}
                className="flex-1 min-h-[44px] py-2.5 bg-[#FFFFFF] hover:bg-[#ECE7FF] border border-[#D8D0E7] text-[#242132] text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Reset All
              </button>
              <button
                onClick={() => {
                  setShowQuickFilterModal(false);
                  setActiveTab('explore');
                }}
                className="flex-1 min-h-[44px] py-2.5 bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                View in Explore ({nearbySalons.length}) →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
