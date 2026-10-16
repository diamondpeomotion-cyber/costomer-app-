import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal, 
  Map as MapIcon, 
  List, 
  Sparkles, 
  Check, 
  X, 
  Heart, 
  Calendar, 
  Clock, 
  Tag, 
  Percent, 
  Play, 
  Scissors,
  Copy,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  SERVICE_CATEGORIES_CONFIG, 
  POPULAR_FILTER_SERVICES, 
  PROMOTION_FILTER_TYPES 
} from '../data/mockSalons';
import { Salon, ServiceItem } from '../types';
import { FilterChip } from './FilterChip';
import { SalonDiscoveryMap } from './SalonDiscoveryMap';

export const ExploreView: React.FC = () => {
  const { 
    salons, 
    setSelectedSalonId, 
    startBookingForSalon, 
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

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'rating' | 'price'>('recommended');
  const [selectedMapSalon, setSelectedMapSalon] = useState<Salon | null>(null);
  
  // Advanced Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [modalActiveTab, setModalActiveTab] = useState<'services' | 'availability' | 'promotions' | 'general'>('services');
  const [serviceSearchInput, setServiceSearchInput] = useState<string>('');

  // Generate next 7 days for the interactive date selector
  const next7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayName = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      return {
        key: isToday ? 'today' : isTomorrow ? 'tomorrow' : iso,
        label: dayName,
        dateNumber: dateNum,
        month: monthStr,
        dayOfWeek: d.getDay(),
      };
    });
  }, []);

  // Filter salons logic
  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = salon.name.toLowerCase().includes(q);
        const matchArea = salon.area.toLowerCase().includes(q);
        const matchCity = salon.city.toLowerCase().includes(q);
        const matchService = salon.services.some(
          (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        );
        if (!matchName && !matchArea && !matchCity && !matchService) return false;
      }

      // 2. Category
      if (selectedCategory && selectedCategory !== 'all') {
        const hasCat = salon.categories.includes(selectedCategory as any);
        if (!hasCat) return false;
      }

      // 3. Distance Radius
      if (salon.distanceKm > maxDistance) return false;

      // 4. Rating
      if (minRating > 0 && salon.rating < minRating) return false;

      // 5. Price Level
      if (selectedPrice !== 'all' && salon.priceLevel !== selectedPrice) return false;

      // 6. Specific Service Filter
      if (selectedSpecificService) {
        const filterConfig = POPULAR_FILTER_SERVICES.find((f) => f.id === selectedSpecificService);
        if (filterConfig) {
          const hasService = salon.services.some((s) =>
            filterConfig.keywords.some((kw) =>
              s.name.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)
            )
          );
          if (!hasService) return false;
        } else {
          // Direct name match
          const hasExact = salon.services.some((s) =>
            s.name.toLowerCase().includes(selectedSpecificService.toLowerCase())
          );
          if (!hasExact) return false;
        }
      }

      // 7. Date Availability Filter
      if (filterDate) {
        let dayOfWeek: number;
        if (filterDate === 'today') {
          dayOfWeek = new Date().getDay();
        } else if (filterDate === 'tomorrow') {
          const tmr = new Date();
          tmr.setDate(tmr.getDate() + 1);
          dayOfWeek = tmr.getDay();
        } else {
          dayOfWeek = new Date(filterDate).getDay();
        }

        const hasStaffAvailable = salon.staff.some((st) => st.availableDays.includes(dayOfWeek));
        if (!hasStaffOnDay(salon, dayOfWeek) && !hasStaffAvailable) return false;
      }

      // 8. Time Slot Availability Filter
      if (filterTimeSlot === 'morning') {
        const hrs = salon.openingHours.toLowerCase();
        const opensEarly = hrs.includes('08:30') || hrs.includes('09:00') || hrs.includes('09:30') || hrs.includes('10:00');
        if (!opensEarly) return false;
      } else if (filterTimeSlot === 'afternoon') {
        // All published salons in directory operate in afternoon
      } else if (filterTimeSlot === 'evening') {
        const hrs = salon.openingHours.toLowerCase();
        const openLate = hrs.includes('08:30 pm') || hrs.includes('09:00 pm') || hrs.includes('09:30 pm') || hrs.includes('10:00 pm');
        if (!openLate) return false;
      } else if (filterTimeSlot) {
        // Specific time slot check (e.g. '07:00 PM')
        if (filterTimeSlot.includes('PM') && parseInt(filterTimeSlot) >= 9) {
          const hrs = salon.openingHours.toLowerCase();
          if (!hrs.includes('09:30 pm') && !hrs.includes('10:00 pm')) return false;
        }
      }

      // 9. Current Promotions Filter
      if (filterPromotionType === 'any_offer') {
        const hasOffer = salon.offers && salon.offers.length > 0;
        if (!hasOffer) return false;
      } else if (filterPromotionType === 'exclusive_code') {
        const hasCode = salon.offers && salon.offers.some((o) => o.code && o.discountPercent >= 15);
        if (!hasCode) return false;
      } else if (filterPromotionType === 'package_discount') {
        const hasPkg = salon.packages && salon.packages.some((p) => p.discountPercent >= 20);
        if (!hasPkg) return false;
      } else if (filterPromotionType === 'video_reels') {
        const hasReels = salon.promotions && salon.promotions.length > 0;
        if (!hasReels) return false;
      }

      // Minimum Discount Threshold
      if (minDiscountPercent > 0) {
        const offerDiscount = salon.offers?.[0]?.discountPercent || 0;
        const packageDiscount = salon.packages?.[0]?.discountPercent || 0;
        if (Math.max(offerDiscount, packageDiscount) < minDiscountPercent) return false;
      }

      return true;
    });
  }, [
    salons,
    searchQuery,
    selectedCategory,
    maxDistance,
    minRating,
    selectedPrice,
    selectedSpecificService,
    filterDate,
    filterTimeSlot,
    filterPromotionType,
    minDiscountPercent
  ]);

  function hasStaffOnDay(salon: Salon, dayOfWeek: number): boolean {
    return salon.staff.some((st) => st.availableDays.includes(dayOfWeek));
  }

  // Sort salons
  const sortedSalons = useMemo(() => {
    return [...filteredSalons].sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') {
        const pA = a.services[0]?.price || 0;
        const pB = b.services[0]?.price || 0;
        return pA - pB;
      }
      return b.reviewCount - a.reviewCount; // Recommended default
    });
  }, [filteredSalons, sortBy]);

  // Helper to find matching service for display badge
  const getMatchingService = (salon: Salon): ServiceItem | undefined => {
    if (!selectedSpecificService) return undefined;
    const filterConfig = POPULAR_FILTER_SERVICES.find((f) => f.id === selectedSpecificService);
    if (filterConfig) {
      return salon.services.find((s) =>
        filterConfig.keywords.some((kw) =>
          s.name.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)
        )
      );
    }
    return salon.services.find((s) =>
      s.name.toLowerCase().includes(selectedSpecificService.toLowerCase())
    );
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    showToast(`Code "${code}" copied to clipboard!`, 'success');
  };

  const allFilteredServicesList = useMemo(() => {
    const list: { name: string; salonName: string; category: string; price: number }[] = [];
    salons.forEach((s) => {
      s.services.forEach((srv) => {
        if (!list.some((item) => item.name === srv.name)) {
          list.push({
            name: srv.name,
            salonName: s.name,
            category: srv.categoryId,
            price: srv.price,
          });
        }
      });
    });
    return list;
  }, [salons]);

  const visibleServicesSearch = allFilteredServicesList.filter((srv) =>
    srv.name.toLowerCase().includes(serviceSearchInput.toLowerCase()) ||
    srv.category.toLowerCase().includes(serviceSearchInput.toLowerCase())
  );

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 pt-4 space-y-5 animate-fade-in">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">Explore & Discover Salons</h1>
            {activeFiltersCount > 0 && (
              <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                {activeFiltersCount} Active Filters
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {sortedSalons.length} published salons match your exact requirements
          </p>
        </div>

        {/* View Toggle (List vs Map) */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => {
              setViewMode('map');
              if (!selectedMapSalon && sortedSalons[0]) {
                setSelectedMapSalon(sortedSalons[0]);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'map'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar with Filter Modal Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by salon name, specific treatment, area, or stylist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Advanced Filters Button */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeFiltersCount > 0
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-violet-900 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === null
              ? 'bg-violet-600 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {SERVICE_CATEGORIES_CONFIG.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick Interactive Filter Controls Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Date Availability Pill Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 font-medium">Date:</span>
            <div className="flex gap-1">
              {[
                { id: null, label: 'Any' },
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => setFilterDate(d.id)}
                  className={`px-2 py-0.5 rounded-md text-xs cursor-pointer ${
                    filterDate === d.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Time Slot Selector */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-500 font-medium">Slot:</span>
            <div className="flex gap-1">
              {[
                { id: null, label: 'Any' },
                { id: 'morning', label: 'Morning' },
                { id: 'afternoon', label: 'Afternoon' },
                { id: 'evening', label: 'Evening' },
              ].map((slot) => (
                <button
                  key={slot.label}
                  onClick={() => setFilterTimeSlot(slot.id)}
                  className={`px-2 py-0.5 rounded-md text-xs cursor-pointer ${
                    filterTimeSlot === slot.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Promotions Selector */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-slate-500 font-medium">Deals:</span>
            <div className="flex gap-1">
              {[
                { id: null, label: 'All' },
                { id: 'any_offer', label: 'Active Codes' },
                { id: 'package_discount', label: 'Packages (20%+)' },
              ].map((promo) => (
                <button
                  key={promo.label}
                  onClick={() => setFilterPromotionType(promo.id)}
                  className={`px-2 py-0.5 rounded-md text-xs cursor-pointer ${
                    filterPromotionType === promo.id
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {promo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
            >
              <option value="recommended">Recommended</option>
              <option value="distance">Nearest Distance</option>
              <option value="rating">Highest Rating</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Quick Popular Specific Services Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Scissors className="w-3 h-3 text-violet-600" />
            <span>Treatments:</span>
          </span>
          {POPULAR_FILTER_SERVICES.map((srv) => {
            const isSelected = selectedSpecificService === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => setSelectedSpecificService(isSelected ? null : srv.id)}
                className={`px-2.5 py-0.5 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {srv.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Chips Bar (Powered by reusable FilterChip component) */}
      {(activeFiltersCount > 0 || selectedPrice !== 'all' || minRating > 0 || maxDistance < 10 || minDiscountPercent > 0) && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Filter Criteria
              </span>
            </div>

            <button
              onClick={() => {
                resetAllFilters();
                setSelectedPrice('all');
                setMinRating(0);
                setMaxDistance(10);
                setMinDiscountPercent(0);
                showToast('All filters reset', 'info');
              }}
              className="text-xs text-rose-300 hover:text-rose-200 font-semibold cursor-pointer underline transition-colors"
            >
              Clear All Filters
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Service Type FilterChip */}
            {selectedSpecificService && (
              <FilterChip
                category="Service"
                label={
                  POPULAR_FILTER_SERVICES.find((f) => f.id === selectedSpecificService)?.label ||
                  selectedSpecificService
                }
                icon={<Scissors className="w-3.5 h-3.5 text-violet-400" />}
                variant="violet"
                onClick={() => {
                  setModalActiveTab('services');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setSelectedSpecificService(null);
                  showToast('Service filter removed', 'info');
                }}
              />
            )}

            {/* 2. Category FilterChip */}
            {selectedCategory && (
              <FilterChip
                category="Category"
                label={selectedCategory.replace('_', ' ')}
                icon={<Layers className="w-3.5 h-3.5 text-violet-400" />}
                variant="violet"
                onRemove={() => {
                  setSelectedCategory(null);
                  showToast('Category filter cleared', 'info');
                }}
              />
            )}

            {/* 3. Date Availability FilterChip */}
            {filterDate && (
              <FilterChip
                category="Date"
                label={
                  filterDate === 'today'
                    ? 'Available Today'
                    : filterDate === 'tomorrow'
                    ? 'Available Tomorrow'
                    : filterDate
                }
                icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
                variant="emerald"
                onClick={() => {
                  setModalActiveTab('availability');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setFilterDate(null);
                  showToast('Date filter cleared', 'info');
                }}
              />
            )}

            {/* 4. Time Slot FilterChip */}
            {filterTimeSlot && (
              <FilterChip
                category="Slot"
                label={filterTimeSlot.charAt(0).toUpperCase() + filterTimeSlot.slice(1)}
                icon={<Clock className="w-3.5 h-3.5 text-indigo-400" />}
                variant="indigo"
                onClick={() => {
                  setModalActiveTab('availability');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setFilterTimeSlot(null);
                  showToast('Time slot filter cleared', 'info');
                }}
              />
            )}

            {/* 5. Price Range FilterChip */}
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
                icon={<Tag className="w-3.5 h-3.5 text-slate-400" />}
                variant="default"
                onClick={() => {
                  setModalActiveTab('general');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setSelectedPrice('all');
                  showToast('Price filter cleared', 'info');
                }}
              />
            )}

            {/* 6. Current Promotions FilterChip */}
            {filterPromotionType && (
              <FilterChip
                category="Deal"
                label={
                  filterPromotionType === 'any_offer'
                    ? 'Active Promo Codes'
                    : filterPromotionType === 'exclusive_code'
                    ? 'Exclusive Salon Codes'
                    : filterPromotionType === 'package_discount'
                    ? 'Combo Packages (20%+)'
                    : 'Video Reels'
                }
                icon={<Tag className="w-3.5 h-3.5 text-amber-400" />}
                variant="amber"
                onClick={() => {
                  setModalActiveTab('promotions');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setFilterPromotionType(null);
                  showToast('Promotion filter cleared', 'info');
                }}
              />
            )}

            {/* 7. Minimum Discount FilterChip */}
            {minDiscountPercent > 0 && (
              <FilterChip
                category="Discount"
                label={`≥ ${minDiscountPercent}% OFF`}
                icon={<Percent className="w-3.5 h-3.5 text-amber-400" />}
                variant="amber"
                onRemove={() => {
                  setMinDiscountPercent(0);
                  showToast('Discount filter cleared', 'info');
                }}
              />
            )}

            {/* 8. Distance Radius FilterChip */}
            {maxDistance < 10 && (
              <FilterChip
                category="Distance"
                label={`Within ${maxDistance} km`}
                icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                variant="default"
                onClick={() => {
                  setModalActiveTab('general');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setMaxDistance(10);
                  showToast('Distance filter reset to default', 'info');
                }}
              />
            )}

            {/* 9. Minimum Rating FilterChip */}
            {minRating > 0 && (
              <FilterChip
                category="Rating"
                label={`${minRating}+ ★`}
                icon={<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                variant="amber"
                onClick={() => {
                  setModalActiveTab('general');
                  setIsFilterModalOpen(true);
                }}
                onRemove={() => {
                  setMinRating(0);
                  showToast('Rating filter cleared', 'info');
                }}
              />
            )}

            {/* 10. Search Query FilterChip */}
            {searchQuery.trim() && (
              <FilterChip
                category="Search"
                label={`"${searchQuery}"`}
                variant="default"
                onRemove={() => {
                  setSearchQuery('');
                  showToast('Search query cleared', 'info');
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {sortedSalons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No salons match this combination</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your distance radius, switching dates, or clearing specific services.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            sortedSalons.map((salon) => {
              const matchedService = getMatchingService(salon);

              return (
                <div
                  key={salon.id}
                  onClick={() => setSelectedSalonId(salon.id)}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 transition-all flex flex-col justify-between gap-4 cursor-pointer group shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                        <img
                          src={salon.bannerImage}
                          alt={salon.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteSalon(salon.id);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70 transition-colors"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isSalonFavorite(salon.id) ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                            {salon.name}
                          </h3>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                            ★ {salon.rating} ({salon.reviewCount})
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">{salon.address}</p>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                          <span className="text-violet-700 font-medium">
                            {salon.templateName.replace('StudioFlow ', '')}
                          </span>
                          <span>·</span>
                          <span>{salon.distanceKm} km away</span>
                          <span>·</span>
                          <span className="font-mono text-slate-700">{salon.priceLevel}</span>
                          <span>·</span>
                          <span className="text-emerald-700 font-medium">Open {salon.openingHours}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">25% Advance Online</span>
                        <span className="text-sm font-bold text-emerald-700 font-mono">
                          ₹
                          {matchedService
                            ? Math.round(matchedService.price * 0.25)
                            : Math.round((salon.services[0]?.price || 499) * 0.25)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchedService) {
                            startBookingForSalon(salon, matchedService);
                          } else {
                            startBookingForSalon(salon);
                          }
                        }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        {matchedService ? 'Book Treatment →' : 'Book Slot →'}
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Filter Match Highlights Strip */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Matched Service Banner */}
                      {matchedService && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1 text-emerald-800 flex items-center gap-2 font-medium">
                          <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Treatment Offered: <strong className="text-slate-900">{matchedService.name}</strong> · ₹{matchedService.price} ({matchedService.durationMinutes}m)
                          </span>
                        </div>
                      )}

                      {/* Date Availability Indicator */}
                      {filterDate && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-1 text-indigo-800 flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Verified Open & Available ({filterDate})</span>
                        </div>
                      )}

                      {/* Active Promo Code Highlight with Copy Button */}
                      {salon.offers[0] && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-amber-800 flex items-center gap-2 font-medium">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          <span>{salon.offers[0].title}</span>
                          <button
                            onClick={(e) => handleCopyCode(salon.offers[0].code, e)}
                            className="bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-900 cursor-pointer flex items-center gap-1 border border-amber-300"
                            title="Copy promo code"
                          >
                            <span>{salon.offers[0].code}</span>
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedSalonId(salon.id)}
                      className="text-violet-600 hover:text-violet-700 text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <span>View Full Menu ({salon.services.length} items)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* INTERACTIVE MAP VIEW */}
      {viewMode === 'map' && (
        <SalonDiscoveryMap
          salons={sortedSalons}
          selectedSalon={selectedMapSalon || sortedSalons[0] || null}
          onSelectSalon={(salon) => setSelectedMapSalon(salon)}
          matchedService={getMatchingService}
        />
      )}

      {/* COMPREHENSIVE ADVANCED FILTERS MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-violet-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Advanced Salon Filters</h2>
                  <p className="text-xs text-slate-400">
                    Filter by specific treatments, available dates/times, and salon promotions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 overflow-x-auto no-scrollbar gap-1">
              {[
                { id: 'services' as const, label: 'Services & Treatments', icon: Scissors },
                { id: 'availability' as const, label: 'Date & Time Slot', icon: Calendar },
                { id: 'promotions' as const, label: 'Promotions & Deals', icon: Tag },
                { id: 'general' as const, label: 'Radius & Rating', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = modalActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                      isActive
                        ? 'border-violet-500 text-violet-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: SPECIFIC SERVICES OFFERED */}
              {modalActiveTab === 'services' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Search Treatment / Service
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search specific treatments (e.g. Balayage, HydraFacial, Shirodhara...)"
                        value={serviceSearchInput}
                        onChange={(e) => setServiceSearchInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Popular Service Chips */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Popular Treatment Packages
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POPULAR_FILTER_SERVICES.map((srv) => {
                        const isSelected = selectedSpecificService === srv.id;
                        return (
                          <button
                            key={srv.id}
                            onClick={() => setSelectedSpecificService(isSelected ? null : srv.id)}
                            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-violet-600/20 border-violet-500 text-violet-200 font-bold ring-1 ring-violet-500/40'
                                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-xs block leading-tight">{srv.label}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {isSelected ? 'Selected ✓' : '+ Select'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Catalog Services Search Results */}
                  {visibleServicesSearch.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Directory Treatments Catalog ({visibleServicesSearch.length})
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {visibleServicesSearch.map((srv) => {
                          const isSelected = selectedSpecificService?.toLowerCase() === srv.name.toLowerCase();
                          return (
                            <div
                              key={srv.name}
                              onClick={() => setSelectedSpecificService(isSelected ? null : srv.name)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-violet-600/20 border-violet-500 text-white font-semibold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                              }`}
                            >
                              <div>
                                <p className="font-medium text-white">{srv.name}</p>
                                <p className="text-[10px] text-slate-400">Available at {srv.salonName}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-white">₹{srv.price}</span>
                                <span className="text-[10px] text-violet-400 block font-semibold">
                                  {isSelected ? 'Selected' : 'Select'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DATE & TIME AVAILABILITY */}
              {modalActiveTab === 'availability' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      1. Select Specific Date
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {next7Days.map((d) => {
                        const isSelected = filterDate === d.key;
                        return (
                          <button
                            key={d.key}
                            onClick={() => setFilterDate(isSelected ? null : d.key)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow'
                                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-medium">{d.label}</span>
                            <span className="text-xs font-black mt-0.5">{d.dateNumber}</span>
                            <span className="text-[9px] text-slate-400">{d.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      2. Time of Day Preference
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'morning', label: 'Morning Slots', desc: '10:00 AM – 01:00 PM', icon: '☀️' },
                        { id: 'afternoon', label: 'Afternoon Slots', desc: '01:00 PM – 05:00 PM', icon: '🌤️' },
                        { id: 'evening', label: 'Evening Slots', desc: '05:00 PM – 09:30 PM', icon: '🌙' },
                      ].map((slot) => {
                        const isSelected = filterTimeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setFilterTimeSlot(isSelected ? null : slot.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-sm mr-1">{slot.icon}</span>
                            <span className="text-xs font-bold">{slot.label}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{slot.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live Availability Guarantee</span>
                    </span>
                    <p className="text-[11px] text-slate-300">
                      When you select a date and slot, salons verify their staff rosters, operating hours, and active appointments in real-time.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: PROMOTIONS & DEALS */}
              {modalActiveTab === 'promotions' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Filter by Active Offers & Code Types
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'any_offer',
                          title: 'Any Active Promotion / Promo Code',
                          desc: 'Salons with platform or exclusive checkout discount codes',
                          icon: Tag,
                        },
                        {
                          id: 'exclusive_code',
                          title: 'Exclusive Salon Codes (Save 15% – 25%)',
                          desc: 'Salons with custom coupon codes (e.g. AURUM20, URBAN15, GLAMOUR500)',
                          icon: Percent,
                        },
                        {
                          id: 'package_discount',
                          title: 'Multi-Service Combo Packages (Save 20%+)',
                          desc: 'Full day beauty and grooming packages with bundled savings',
                          icon: Sparkles,
                        },
                        {
                          id: 'video_reels',
                          title: 'Salons with Video Transformation Reels',
                          desc: 'Salons with verified before/after short videos to preview work',
                          icon: Play,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = filterPromotionType === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setFilterPromotionType(isSelected ? null : item.id)}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40 text-amber-200'
                                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 mt-0.5">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minimum Discount Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-slate-300">Minimum Discount:</span>
                      <span className="font-bold text-amber-400">
                        {minDiscountPercent === 0 ? 'Any Discount' : `${minDiscountPercent}% OFF or higher`}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 15, 20, 25].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setMinDiscountPercent(pct)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            minDiscountPercent === pct
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {pct === 0 ? 'Any' : `${pct}%+`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GENERAL (RADIUS, RATING, BUDGET) */}
              {modalActiveTab === 'general' && (
                <div className="space-y-4">
                  {/* Distance Radius */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-slate-300">Distance Radius</span>
                      <span className="font-bold text-violet-400">Within {maxDistance} km</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>1 km</span>
                      <span>5 km</span>
                      <span>10 km</span>
                      <span>15 km</span>
                    </div>
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Minimum Verified Rating
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 0, label: 'All Ratings' },
                        { id: 4.5, label: '4.5+ ★ (Great)' },
                        { id: 4.8, label: '4.8+ ★ (Exceptional)' },
                      ].map((rat) => (
                        <button
                          key={rat.label}
                          onClick={() => setMinRating(rat.id)}
                          className={`p-2 rounded-xl text-center text-xs transition-colors cursor-pointer ${
                            minRating === rat.id
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {rat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Level */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Budget Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'all', label: 'All Budgets' },
                        { id: '₹', label: '₹ (Budget)' },
                        { id: '₹₹', label: '₹₹ (Standard)' },
                        { id: '₹₹₹', label: '₹₹₹ (Luxury)' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPrice(p.id)}
                          className={`p-2 rounded-xl text-center text-xs transition-colors cursor-pointer ${
                            selectedPrice === p.id
                              ? 'bg-slate-700 text-white font-bold border border-slate-600'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-300 hover:text-white font-semibold cursor-pointer underline"
              >
                Reset All Filters
              </button>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Show {sortedSalons.length} Matching Salons →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
