import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Share2, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Check, 
  Plus, 
  Trash2, 
  Info,
  Calendar,
  MessageSquareQuote
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceCategory, ServiceItem, PackageDeal } from '../types';

export const SalonDetailView: React.FC = () => {
  const { 
    activeSalon, 
    setSelectedSalonId, 
    toggleFavoriteSalon, 
    isSalonFavorite, 
    startBookingForSalon,
    setActiveReel,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'staff' | 'reviews' | 'policies'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartServices, setCartServices] = useState<ServiceItem[]>([]);
  const [cartPackage, setCartPackage] = useState<PackageDeal | null>(null);

  if (!activeSalon) return null;

  const isFav = isSalonFavorite(activeSalon.id);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast(`Direct share link for ${activeSalon.name} copied!`, 'success');
  };

  const handleToggleService = (srv: ServiceItem) => {
    setCartServices((prev) => {
      const exists = prev.some((s) => s.id === srv.id);
      if (exists) {
        return prev.filter((s) => s.id !== srv.id);
      } else {
        return [...prev, srv];
      }
    });
  };

  const handleTogglePackage = (pkg: PackageDeal) => {
    setCartPackage((prev) => (prev?.id === pkg.id ? null : pkg));
  };

  const cartSubtotal =
    cartServices.reduce((sum, s) => sum + s.price, 0) + (cartPackage ? cartPackage.packagePrice : 0);
  const cartDuration =
    cartServices.reduce((sum, s) => sum + s.durationMinutes, 0) + (cartPackage ? cartPackage.durationMinutes : 0);
  const advance25Estimate = Math.round((cartSubtotal * 1.05) * 0.25);

  const handleProceedToBook = () => {
    if (cartServices.length === 0 && !cartPackage) {
      // If nothing selected yet, start with the first popular service
      const defaultService = activeSalon.services[0];
      startBookingForSalon(activeSalon, defaultService);
    } else {
      // Start with selected items
      startBookingForSalon(activeSalon, cartServices[0], cartPackage || undefined);
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? activeSalon.services
    : activeSalon.services.filter((s) => s.categoryId === selectedCategory);

  return (
    <div className="pb-32 max-w-4xl mx-auto animate-fade-in bg-[#F0EDF8] min-h-screen">
      {/* Top Bar with Back and Actions */}
      <div className="flex items-center justify-between p-4 bg-white/95 sticky top-16 z-30 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <button
          onClick={() => setSelectedSalonId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-violet-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Share Salon Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavoriteSalon(activeSalon.id)}
            className={`p-2 rounded-full transition-colors cursor-pointer border ${
              isFav 
                ? 'bg-rose-50 border-rose-200 text-rose-500' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Banner Carousel & Overview */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
        <img
          src={activeSalon.bannerImage}
          alt={activeSalon.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* StudioFlow Template badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-white/90 backdrop-blur-md border border-slate-200 text-violet-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-violet-600" />
            {activeSalon.templateName}
          </span>
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Open Today
          </span>
        </div>

        {/* Video Reel Preview CTA */}
        {activeSalon.promotions[0] && (
          <button
            onClick={() => setActiveReel(activeSalon.promotions[0])}
            className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-900 border border-slate-200 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
            <span>Watch Reel</span>
          </button>
        )}

        {/* Title and Rating on bottom left of banner */}
        <div className="absolute bottom-4 left-4 right-16">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow-sm">
              <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
              {activeSalon.rating}
            </span>
            <span className="text-xs text-slate-200 font-medium">
              ({activeSalon.reviewCount} verified reviews)
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs font-mono text-slate-200 font-bold">{activeSalon.priceLevel}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
            {activeSalon.name}
          </h1>
          <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{activeSalon.tagline}</p>
        </div>
      </div>

      {/* Quick Info Strip */}
      <div className="bg-white border-b border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 text-xs text-slate-700">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
              <span className="font-medium text-slate-900">
                {activeSalon.address}, {activeSalon.area}
              </span>
              <span className="text-slate-500 font-mono">({activeSalon.distanceKm} km away)</span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Operating Hours: <strong className="text-slate-800">{activeSalon.openingHours}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${activeSalon.phone}`}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs flex items-center gap-1.5 font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Call</span>
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                activeSalon.name + ' ' + activeSalon.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs flex items-center gap-1.5 font-bold transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              <span className="hidden sm:inline">Map</span>
            </a>
          </div>
        </div>

        {/* Amenities Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          {activeSalon.amenities.map((am) => (
            <span
              key={am}
              className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
            >
              ✓ {am}
            </span>
          ))}
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="sticky top-28 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 flex overflow-x-auto no-scrollbar px-4 pt-2 shadow-2xs">
        {[
          { id: 'services', label: `Services (${activeSalon.services.length})` },
          { id: 'packages', label: `Packages (${activeSalon.packages.length})` },
          { id: 'staff', label: `Specialists (${activeSalon.staff.length})` },
          { id: 'reviews', label: `Reviews (${activeSalon.reviews.length})` },
          { id: 'policies', label: 'Safety & 25% Advance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="p-4 space-y-6">
        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Category Filter bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Menu
              </button>
              {activeSalon.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors capitalize ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {filteredServices.map((srv) => {
                const isSelected = cartServices.some((s) => s.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                      isSelected
                        ? 'bg-violet-50/70 border-violet-400 ring-1 ring-violet-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{srv.name}</h4>
                        {srv.popular && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            Bestseller
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{srv.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1 font-mono text-[11px] font-medium text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {srv.durationMinutes} mins
                        </span>
                        <span>·</span>
                        <span className="text-[11px] capitalize text-violet-700 font-semibold">
                          {srv.categoryId.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <div>
                        <span className="text-base font-black text-slate-900">₹{srv.price}</span>
                        {srv.originalPrice && (
                          <span className="text-xs text-slate-400 line-through ml-2 sm:ml-0 sm:block text-right">
                            ₹{srv.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleService(srv)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Combo packages include multiple synchronized services with bundled savings!
              </span>
            </div>

            <div className="space-y-3">
              {activeSalon.packages.map((pkg) => {
                const isSelected = cartPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-2xl border transition-all shadow-xs ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{pkg.name}</h4>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                            Save {pkg.discountPercent}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{pkg.description}</p>
                        
                        {/* Included services */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {pkg.includedServices.map((inc) => (
                            <span
                              key={inc}
                              className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium"
                            >
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-slate-900">₹{pkg.packagePrice}</span>
                        <span className="text-xs text-slate-400 line-through block">
                          ₹{pkg.originalPrice}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-violet-600" />
                        <span>Duration: {pkg.durationMinutes} mins</span>
                      </div>

                      <button
                        onClick={() => handleTogglePackage(pkg)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? 'Package Selected ✓' : '+ Select Package'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-3">
            {activeSalon.staff.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 shadow-xs"
              >
                <img
                  src={st.photo}
                  alt={st.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{st.name}</h4>
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {st.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{st.role}</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Specialties: <span className="text-violet-700 font-semibold">{st.specialties.join(', ')}</span> · {st.experienceYears} Years Experience
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">{activeSalon.rating}</span>
                  <div className="flex text-amber-400">
                    {'★'.repeat(Math.round(activeSalon.rating))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Based on {activeSalon.reviewCount} verified appointments via Nexora
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine Visits</span>
              </div>
            </div>

            <div className="space-y-3">
              {activeSalon.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                        {rev.verifiedAppointment && (
                          <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                            Verified Appointment
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{rev.date} · Treatment: {rev.serviceTag}</span>
                    </div>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                  {/* Owner Reply */}
                  {rev.ownerReply && (
                    <div className="bg-slate-50 border-l-2 border-violet-500 p-2.5 rounded-r-xl mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-violet-700 font-bold">
                        <span>Response from {rev.ownerReply.author}</span>
                        <span className="text-slate-400 font-normal">{rev.ownerReply.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{rev.ownerReply.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                <span>Nexora 25% Advance & Escrow Policy</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you book an appointment, 25% advance is securely held by Nexora Escrow to guarantee your slot and prepare sterilized tools. The remaining 75% balance is paid directly at the salon counter after service completion.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Cancellation & Rescheduling</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeSalon.cancellationPolicy}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Sanitization & Hygiene Standards</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {activeSalon.safetyPolicies.map((pol, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{pol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Booking Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {cartServices.length + (cartPackage ? 1 : 0) > 0
                  ? `${cartServices.length + (cartPackage ? 1 : 0)} items selected`
                  : 'Ready to book?'}
              </span>
              {cartDuration > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  {cartDuration} mins
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-slate-900">
                ₹{cartSubtotal > 0 ? cartSubtotal : activeSalon.services[0]?.price}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                25% Advance: ₹{advance25Estimate > 0 ? advance25Estimate : Math.round(activeSalon.services[0]?.price * 0.25)}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceedToBook}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment (25% Advance)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
