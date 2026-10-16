import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Check, 
  Clock, 
  Calendar, 
  User, 
  Sparkles, 
  MapPin, 
  Tag, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  Mail, 
  FileText,
  Navigation as NavigationIcon,
  Download,
  AlertTriangle,
  Scissors
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NexoraQRCode } from './NexoraQRCode';
import { ServiceItem } from '../types';

export const BookingModal: React.FC = () => {
  const { 
    bookingModalOpen, 
    setBookingModalOpen, 
    bookingStep, 
    setBookingStep, 
    activeBookingDraft, 
    salons,
    addServiceToDraft,
    removeServiceFromDraft,
    selectPackageForDraft,
    updateDraftDetails,
    applyCouponToDraft,
    removeCouponFromDraft,
    confirmBookingAdvance,
    setActiveTab,
    setSelectedSalonId,
    showToast
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string }>({});

  if (!bookingModalOpen || !activeBookingDraft) return null;

  const currentSalon = salons.find((s) => s.id === activeBookingDraft.salonId);
  if (!currentSalon) return null;

  // Calculate total duration in minutes
  const totalDuration = (activeBookingDraft.services?.reduce((sum, s) => sum + s.durationMinutes, 0) || 0) +
    (activeBookingDraft.selectedPackage?.durationMinutes || 0);

  // Generate 7 days starting today
  const nextDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dateNum = d.getDate();
    const dateString = d.toISOString().split('T')[0];
    return {
      dateString,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName,
      subtitle: `${monthName} ${dateNum}`,
    };
  });

  const timeSlots = {
    morning: ['10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM'],
    afternoon: ['01:00 PM', '02:00 PM', '03:15 PM', '04:30 PM'],
    evening: ['05:30 PM', '06:15 PM', '07:00 PM', '07:45 PM'],
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponToDraft(couponInput.trim());
    setCouponFeedback(res);
  };

  const handlePaymentSuccess = () => {
    confirmBookingAdvance('nexora_qr');
  };

  const handleDownloadCalendar = () => {
    if (!activeBookingDraft.bookingNumber) return;
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nexora Salons//Booking//EN\nBEGIN:VEVENT\nSUMMARY:Salon Appointment: ${activeBookingDraft.salonName}\nDESCRIPTION:Nexora Verified Appointment: ${activeBookingDraft.bookingNumber}\\nTotal: ₹${activeBookingDraft.totalPayable}\\nRemaining at Salon: ₹${activeBookingDraft.remainingAtSalon75}\nLOCATION:${activeBookingDraft.salonAddress}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeBookingDraft.bookingNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Appointment added to calendar file (.ics)', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            {bookingStep > 1 && bookingStep < 5 && (
              <button
                onClick={() => setBookingStep(bookingStep - 1)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                  Step {bookingStep} of 5
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  {bookingStep === 1 && 'Select Services & Packages'}
                  {bookingStep === 2 && 'Choose Specialist & Time Slot'}
                  {bookingStep === 3 && 'Review Booking Summary'}
                  {bookingStep === 4 && 'Nexora 25% Advance Payment'}
                  {bookingStep === 5 && 'Appointment Confirmed'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {currentSalon.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-violet-600 h-1 transition-all duration-300"
            style={{ width: `${(bookingStep / 5) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-white">
          {/* STEP 1: SERVICES & PACKAGES */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Select Services for Your Visit</h3>
                  <p className="text-xs text-slate-500">
                    Add multiple services or a discounted package combo
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                  <Clock className="w-3.5 h-3.5 text-violet-600" />
                  <span>Est. {totalDuration} mins</span>
                </div>
              </div>

              {/* Package combos if available */}
              {currentSalon.packages.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Exclusive Package Deals
                    </span>
                  </div>
                  <div className="space-y-2">
                    {currentSalon.packages.map((pkg) => {
                      const isSelected = activeBookingDraft.selectedPackage?.packageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => selectPackageForDraft(isSelected ? null : pkg)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{pkg.name}</h4>
                                {pkg.badge && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{pkg.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-medium">
                                <span>{pkg.durationMinutes} mins</span>
                                <span>·</span>
                                <span className="text-emerald-700 font-bold">Save {pkg.discountPercent}%</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-black text-slate-900">₹{pkg.packagePrice}</span>
                              <span className="text-[10px] text-slate-400 line-through block">
                                ₹{pkg.originalPrice}
                              </span>
                              <span className={`text-[11px] font-bold block mt-1 ${
                                isSelected ? 'text-amber-700' : 'text-slate-500'
                              }`}>
                                {isSelected ? 'Selected ✓' : '+ Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Individual Services Menu */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Individual Menu Items
                </p>
                <div className="space-y-2">
                  {currentSalon.services.map((srv) => {
                    const isAdded = activeBookingDraft.services?.some((s) => s.serviceId === srv.id);
                    return (
                      <div
                        key={srv.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors shadow-xs ${
                          isAdded
                            ? 'bg-violet-50/70 border-violet-400 ring-1 ring-violet-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{srv.name}</h4>
                            {srv.popular && (
                              <span className="text-[9px] font-bold bg-violet-100 text-violet-800 border border-violet-200 px-1.5 py-0.5 rounded">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {srv.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{srv.durationMinutes} mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900">₹{srv.price}</span>
                            {srv.originalPrice && (
                              <span className="text-[10px] text-slate-400 line-through block">
                                ₹{srv.originalPrice}
                              </span>
                            )}
                          </div>

                          {isAdded ? (
                            <button
                              onClick={() => removeServiceFromDraft(srv.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title="Remove service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => addServiceToDraft(srv)}
                              className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected List Summary */}
              {((activeBookingDraft.services?.length || 0) > 0 || activeBookingDraft.selectedPackage) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-700 font-bold">
                    <span>Selected Services ({activeBookingDraft.services?.length || 0})</span>
                    <span>Subtotal: ₹{activeBookingDraft.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Total Service Duration</span>
                    <span>{totalDuration} minutes</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: STAFF & SLOT SELECTION */}
          {bookingStep === 2 && (
            <div className="space-y-4">
              {/* Specialist Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  1. Select Specialist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() =>
                      updateDraftDetails({
                        staffId: 'any-specialist',
                        staffName: 'Any Available Specialist',
                        staffPhoto: undefined,
                      })
                    }
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all shadow-xs ${
                      activeBookingDraft.staffId === 'any-specialist'
                        ? 'bg-violet-50/70 border-violet-400 ring-1 ring-violet-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                      <Sparkles className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Any Available Specialist</p>
                      <p className="text-[10px] text-emerald-700 font-bold">Fastest availability</p>
                    </div>
                  </div>

                  {currentSalon.staff.map((st) => {
                    const isSelected = activeBookingDraft.staffId === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() =>
                          updateDraftDetails({
                            staffId: st.id,
                            staffName: st.name,
                            staffPhoto: st.photo,
                          })
                        }
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all shadow-xs ${
                          isSelected
                            ? 'bg-violet-50/70 border-violet-400 ring-1 ring-violet-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={st.photo}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{st.role}</p>
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                            <span>★ {st.rating}</span>
                            <span className="text-slate-400 font-normal">· {st.experienceYears}y exp</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  2. Select Appointment Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {nextDays.map((d) => {
                    const isSelected = activeBookingDraft.date === d.dateString;
                    return (
                      <button
                        key={d.dateString}
                        onClick={() => updateDraftDetails({ date: d.dateString })}
                        className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[10px] font-semibold">{d.label}</span>
                        <span className="text-xs font-bold mt-0.5">{d.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Availability Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  3. Select Available Slot
                </label>

                {/* Morning */}
                <div className="mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Morning (10:00 AM - 12:30 PM)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.morning.map((slot) => {
                      const isSelected = activeBookingDraft.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => updateDraftDetails({ timeSlot: slot })}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 border-violet-600 text-white font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Afternoon (01:00 PM - 05:00 PM)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.afternoon.map((slot, idx) => {
                      const isSelected = activeBookingDraft.timeSlot === slot;
                      const isLunchBreak = idx === 0;
                      return (
                        <button
                          key={slot}
                          disabled={isLunchBreak}
                          onClick={() => updateDraftDetails({ timeSlot: slot })}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all ${
                            isLunchBreak
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-violet-600 border-violet-600 text-white font-bold shadow-xs cursor-pointer'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Evening */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Evening (05:00 PM - 09:00 PM)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.evening.map((slot) => {
                      const isSelected = activeBookingDraft.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => updateDraftDetails({ timeSlot: slot })}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 border-violet-600 text-white font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BOOKING SUMMARY (WITH EDIT BUTTONS) */}
          {bookingStep === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                {/* Salon Details Section */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">
                      Salon Destination
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{currentSalon.name}</h4>
                    <p className="text-xs text-slate-500">{currentSalon.address}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentSalon.phone}</p>
                  </div>
                </div>

                {/* Selected Services & Packages (With Edit Button) */}
                <div className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">
                      Selected Services & Packages
                    </span>
                    <button
                      onClick={() => setBookingStep(1)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-bold cursor-pointer"
                    >
                      Change / Edit
                    </button>
                  </div>

                  {activeBookingDraft.selectedPackage && (
                    <div className="flex justify-between items-center text-xs py-1 text-amber-900 font-bold">
                      <span>{activeBookingDraft.selectedPackage.name} (Package)</span>
                      <span>₹{activeBookingDraft.selectedPackage.price}</span>
                    </div>
                  )}

                  {activeBookingDraft.services?.map((s) => (
                    <div
                      key={s.serviceId}
                      className="flex justify-between items-center text-xs py-1 text-slate-700"
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Scissors className="w-3 h-3 text-slate-400" />
                        <span>{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({s.durationMinutes}m)</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{s.price}</span>
                    </div>
                  ))}

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 font-medium">
                    <Clock className="w-3 h-3 text-violet-600" />
                    <span>Total Duration: {totalDuration} minutes</span>
                  </div>
                </div>

                {/* Specialist & Appointment Slot (With Edit Button) */}
                <div className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">
                      Specialist & Slot
                    </span>
                    <button
                      onClick={() => setBookingStep(2)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-bold cursor-pointer"
                    >
                      Change / Edit
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                      <span className="font-bold text-slate-900">{activeBookingDraft.staffName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {activeBookingDraft.date} · {activeBookingDraft.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information & Instructions */}
                <div>
                  <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block mb-2">
                    Guest Contact & Requests
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Name</span>
                      <input
                        type="text"
                        value={activeBookingDraft.customerName || ''}
                        onChange={(e) => updateDraftDetails({ customerName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs mt-0.5 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Phone</span>
                      <input
                        type="tel"
                        value={activeBookingDraft.customerPhone || ''}
                        onChange={(e) => updateDraftDetails({ customerPhone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs mt-0.5 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      Special instructions / Stylist preferences (Optional)
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Skin sensitive to hot water, prefers quiet session"
                      value={activeBookingDraft.specialNotes || ''}
                      onChange={(e) => updateDraftDetails({ specialNotes: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs mt-0.5 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. FESTIVE25, NEXORA50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 uppercase tracking-wider focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </form>

                {activeBookingDraft.couponCode && (
                  <div className="flex items-center justify-between text-xs text-emerald-800 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span>
                      Promo <strong>{activeBookingDraft.couponCode}</strong> applied (-₹
                      {activeBookingDraft.couponDiscount})
                    </span>
                    <button
                      onClick={removeCouponFromDraft}
                      className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponFeedback.message && !activeBookingDraft.couponCode && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{couponFeedback.message}</p>
                )}
              </div>

              {/* Financial Calculation & 25% Advance Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{activeBookingDraft.subtotal}</span>
                </div>
                {activeBookingDraft.couponDiscount ? (
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>Festival / Promo Discount</span>
                    <span>-₹{activeBookingDraft.couponDiscount}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Taxes & Hygiene Kit (5%)</span>
                  <span>₹{activeBookingDraft.taxesAndFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable Amount</span>
                  <span className="text-base font-black">₹{activeBookingDraft.totalPayable}</span>
                </div>

                {/* 25% Rule Callout Box */}
                <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-violet-900">
                    <span>25% Advance Amount Payable Now:</span>
                    <span className="text-base text-emerald-700 font-black font-mono">
                      ₹{activeBookingDraft.advancePayable25}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
                    <span>75% Remaining Amount to Pay at Salon:</span>
                    <span className="text-slate-900 font-bold">
                      ₹{activeBookingDraft.remainingAtSalon75}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 leading-tight">
                    *Nexora Escrow protects your advance. 100% refundable if cancelled up to 2 hours before appointment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NEXORA QR & PAYMENT SCREEN */}
          {bookingStep === 4 && (
            <div className="space-y-4">
              <NexoraQRCode
                amount={activeBookingDraft.advancePayable25 || 250}
                totalBill={activeBookingDraft.totalPayable || 1000}
                bookingNumber={activeBookingDraft.paymentOrderId || 'NX-ORD-9021'}
                salonName={currentSalon.name}
                onPaymentSuccess={handlePaymentSuccess}
                onExpire={() => {
                  showToast('Hold slot reservation expired. Please choose your slot again.', 'error');
                  setBookingStep(2);
                }}
              />
            </div>
          )}

          {/* STEP 5: BOOKING CONFIRMATION & CHECK-IN PASS */}
          {bookingStep === 5 && (
            <div className="space-y-5 text-center py-2 animate-fade-in">
              {/* Celebration Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 block mb-1">
                  25% Advance Verified · Appointment Confirmed!
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Booking #{activeBookingDraft.bookingNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confirmation sent to {activeBookingDraft.customerPhone} & {activeBookingDraft.customerEmail}
                </p>
              </div>

              {/* Digital Check-in QR Pass */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-xs max-w-sm mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-violet-700">Digital Check-in Pass</span>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{activeBookingDraft.salonName}</h4>
                  </div>
                  <div className="bg-violet-50 border border-violet-200 px-2.5 py-1 rounded text-center">
                    <span className="text-[9px] uppercase font-bold text-violet-700 block">Pass Code</span>
                    <span className="text-xs font-mono font-black text-violet-900">{activeBookingDraft.checkInCode}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="font-bold text-emerald-800">
                      {activeBookingDraft.date} at {activeBookingDraft.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialist:</span>
                    <span className="font-bold">{activeBookingDraft.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">25% Advance Paid:</span>
                    <span className="text-emerald-700 font-black">₹{activeBookingDraft.advancePayable25} ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining to Pay at Salon:</span>
                    <span className="font-bold text-slate-900">₹{activeBookingDraft.remainingAtSalon75}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Show this pass at front desk</span>
                  <span className="text-emerald-700 font-bold">Priority Seat Active</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                <button
                  onClick={handleDownloadCalendar}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-violet-600" />
                  <span>Add to Calendar</span>
                </button>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    activeBookingDraft.salonName + ' ' + activeBookingDraft.salonAddress
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <NavigationIcon className="w-4 h-4 text-emerald-600" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          {bookingStep === 1 && (
            <>
              <div className="text-xs">
                <span className="text-slate-500">Estimated Total:</span>{' '}
                <strong className="text-slate-900 text-sm font-black">₹{activeBookingDraft.totalPayable || 0}</strong>
              </div>
              <button
                disabled={
                  (!activeBookingDraft.services || activeBookingDraft.services.length === 0) &&
                  !activeBookingDraft.selectedPackage
                }
                onClick={() => setBookingStep(2)}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Choose Slot & Specialist →
              </button>
            </>
          )}

          {bookingStep === 2 && (
            <>
              <div className="text-xs text-slate-600">
                Slot: <strong className="text-violet-700 font-bold">{activeBookingDraft.timeSlot}</strong>
              </div>
              <button
                onClick={() => setBookingStep(3)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Proceed to Summary →
              </button>
            </>
          )}

          {bookingStep === 3 && (
            <>
              <div className="text-xs">
                <span className="text-slate-500">Advance (25%):</span>{' '}
                <strong className="text-emerald-700 text-sm font-black">₹{activeBookingDraft.advancePayable25}</strong>
              </div>
              <button
                onClick={() => setBookingStep(4)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Pay 25% via Nexora QR →
              </button>
            </>
          )}

          {bookingStep === 4 && (
            <div className="w-full text-center text-xs text-slate-500 font-medium">
              Awaiting UPI transaction confirmation...
            </div>
          )}

          {bookingStep === 5 && (
            <div className="w-full flex gap-2">
              <button
                onClick={() => {
                  setBookingModalOpen(false);
                  setActiveTab('bookings');
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                View in My Bookings
              </button>
              <button
                onClick={() => {
                  setBookingModalOpen(false);
                  setSelectedSalonId(null);
                  setActiveTab('home');
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
