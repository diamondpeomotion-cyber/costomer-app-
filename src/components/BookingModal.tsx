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
      <div className="bg-[#FFFFFF] border border-[#D8D0E7] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#242132]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#D8D0E7] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            {bookingStep > 1 && bookingStep < 5 && (
              <button
                onClick={() => setBookingStep(bookingStep - 1)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#65567E] hover:text-[#242132] hover:bg-[#ECE7FF] transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5841E8]">
                  Step {bookingStep} of 5
                </span>
                <span className="text-[#D8D0E7]">·</span>
                <span className="text-xs text-[#65567E] font-medium">
                  {bookingStep === 1 && 'Select Services & Packages'}
                  {bookingStep === 2 && 'Choose Specialist & Time Slot'}
                  {bookingStep === 3 && 'Review Booking Summary'}
                  {bookingStep === 4 && 'Nexora 25% Advance Payment'}
                  {bookingStep === 5 && 'Appointment Confirmed'}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#242132] truncate max-w-xs sm:max-w-md">
                {currentSalon.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(false)}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#766A83] hover:text-[#242132] hover:bg-[#ECE7FF] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-[#ECE7FF] h-1">
          <div
            className="bg-[#5841E8] h-1 transition-all duration-300"
            style={{ width: `${(bookingStep / 5) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#FFFFFF]">
          {/* STEP 1: SERVICES & PACKAGES */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#242132]">Select Services for Your Visit</h3>
                  <p className="text-xs text-[#65567E]">
                    Add multiple services or a discounted package combo
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#242132] bg-[#ECE7FF] border border-[#D8D0E7] px-2.5 py-1 rounded-lg font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#5841E8]" />
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
                              ? 'bg-[#ECE7FF] border-[#5841E8] ring-1 ring-[#5841E8]'
                              : 'bg-[#FFFFFF] border-[#D8D0E7] hover:border-[#A492F3]'
                          }`}
                          onClick={() => selectPackageForDraft(isSelected ? null : pkg)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-[#242132]">{pkg.name}</h4>
                                {pkg.badge && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#65567E] mt-0.5">{pkg.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-[#766A83] mt-1 font-medium">
                                <span>{pkg.durationMinutes} mins</span>
                                <span>·</span>
                                <span className="text-emerald-700 font-bold">Save {pkg.discountPercent}%</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-black text-[#242132]">₹{pkg.packagePrice}</span>
                              <span className="text-[10px] text-[#766A83] line-through block">
                                ₹{pkg.originalPrice}
                              </span>
                              <span className={`text-[11px] font-bold block mt-1 ${
                                isSelected ? 'text-[#5841E8]' : 'text-[#65567E]'
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
                <p className="text-xs font-bold text-[#242132] uppercase tracking-wider mb-2">
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
                            ? 'bg-[#ECE7FF] border-[#5841E8] ring-1 ring-[#5841E8]'
                            : 'bg-[#FFFFFF] border-[#D8D0E7] hover:border-[#A492F3]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#242132]">{srv.name}</h4>
                            {srv.popular && (
                              <span className="text-[9px] font-bold bg-[#ECE7FF] text-[#5841E8] border border-[#A492F3] px-1.5 py-0.5 rounded">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#65567E] line-clamp-1 mt-0.5">
                            {srv.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[#766A83] mt-1">
                            <Clock className="w-3 h-3 text-[#766A83]" />
                            <span>{srv.durationMinutes} mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-[#242132]">₹{srv.price}</span>
                            {srv.originalPrice && (
                              <span className="text-[10px] text-[#766A83] line-through block">
                                ₹{srv.originalPrice}
                              </span>
                            )}
                          </div>

                          {isAdded ? (
                            <button
                              onClick={() => removeServiceFromDraft(srv.id)}
                              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl transition-colors cursor-pointer shadow-xs"
                              title="Remove service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => addServiceToDraft(srv)}
                              className="px-4 py-2.5 min-h-[44px] bg-[#5841E8] hover:bg-[#4834d4] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Plus className="w-4 h-4" />
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
                <div className="p-3 bg-[#ECE7FF] border border-[#D8D0E7] rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs text-[#242132] font-bold">
                    <span>Selected Services ({activeBookingDraft.services?.length || 0})</span>
                    <span>Subtotal: ₹{activeBookingDraft.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#65567E]">
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
                <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
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
                        ? 'bg-[#ECE7FF] border-[#5841E8] ring-1 ring-[#5841E8]'
                        : 'bg-[#FFFFFF] border-[#D8D0E7] hover:border-[#A492F3]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ECE7FF] flex items-center justify-center text-[#5841E8] border border-[#D8D0E7]">
                      <Sparkles className="w-5 h-5 text-[#5841E8]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#242132]">Any Available Specialist</p>
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
                            ? 'bg-[#ECE7FF] border-[#5841E8] ring-1 ring-[#5841E8]'
                            : 'bg-[#FFFFFF] border-[#D8D0E7] hover:border-[#A492F3]'
                        }`}
                      >
                        <img
                          src={st.photo}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#D8D0E7]"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#242132]">{st.name}</p>
                          <p className="text-[10px] text-[#65567E] truncate">{st.role}</p>
                          <div className="flex items-center gap-1 text-[10px] text-amber-900 font-bold">
                            <span>★ {st.rating}</span>
                            <span className="text-[#766A83] font-normal">· {st.experienceYears}y exp</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Selector */}
              <div>
                <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
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
                            ? 'bg-[#5841E8] text-white border-[#5841E8] shadow-xs font-bold'
                            : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
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
                <label className="text-xs font-bold text-[#242132] uppercase tracking-wider block mb-2">
                  3. Select Available Slot
                </label>

                {/* Morning */}
                <div className="mb-3">
                  <span className="text-[11px] font-semibold text-[#65567E] block mb-1.5">
                    Morning (10:00 AM - 12:30 PM)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.morning.map((slot) => {
                      const isSelected = activeBookingDraft.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => updateDraftDetails({ timeSlot: slot })}
                          className={`py-2.5 px-1 min-h-[44px] flex items-center justify-center text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold shadow-xs'
                              : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
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
                  <span className="text-[11px] font-semibold text-[#65567E] block mb-1.5">
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
                          className={`py-2.5 px-1 min-h-[44px] flex items-center justify-center text-center rounded-xl border text-xs font-semibold transition-all ${
                            isLunchBreak
                              ? 'bg-[#ECE7FF]/60 border-[#D8D0E7] text-[#766A83] line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold shadow-xs cursor-pointer'
                              : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF] cursor-pointer'
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
                  <span className="text-[11px] font-semibold text-[#65567E] block mb-1.5">
                    Evening (05:00 PM - 09:00 PM)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.evening.map((slot) => {
                      const isSelected = activeBookingDraft.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => updateDraftDetails({ timeSlot: slot })}
                          className={`py-2.5 px-1 min-h-[44px] flex items-center justify-center text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5841E8] border-[#5841E8] text-white font-bold shadow-xs'
                              : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#242132] hover:bg-[#ECE7FF]'
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
              <div className="bg-[#ECE7FF] border border-[#D8D0E7] rounded-2xl p-4 space-y-3">
                {/* Salon Details Section */}
                <div className="flex items-start justify-between pb-3 border-b border-[#D8D0E7]">
                  <div>
                    <span className="text-[10px] font-bold text-[#5841E8] uppercase tracking-wider block">
                      Salon Destination
                    </span>
                    <h4 className="text-sm font-bold text-[#242132]">{currentSalon.name}</h4>
                    <p className="text-xs text-[#65567E]">{currentSalon.address}</p>
                    <p className="text-[11px] text-[#65567E] font-mono mt-0.5">{currentSalon.phone}</p>
                  </div>
                </div>

                {/* Selected Services & Packages (With Edit Button) */}
                <div className="pb-3 border-b border-[#D8D0E7]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#5841E8] uppercase tracking-wider">
                      Selected Services & Packages
                    </span>
                    <button
                      onClick={() => setBookingStep(1)}
                      className="text-xs text-[#5841E8] hover:text-[#4834d4] font-bold cursor-pointer min-h-[44px] px-2 inline-flex items-center"
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
                      className="flex justify-between items-center text-xs py-1 text-[#242132]"
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Scissors className="w-3 h-3 text-[#766A83]" />
                        <span>{s.name}</span>
                        <span className="text-[10px] text-[#766A83] font-mono">({s.durationMinutes}m)</span>
                      </div>
                      <span className="font-bold text-[#242132]">₹{s.price}</span>
                    </div>
                  ))}

                  <div className="text-[11px] text-[#65567E] flex items-center gap-1 pt-1 font-medium">
                    <Clock className="w-3 h-3 text-[#5841E8]" />
                    <span>Total Duration: {totalDuration} minutes</span>
                  </div>
                </div>

                {/* Specialist & Appointment Slot (With Edit Button) */}
                <div className="pb-3 border-b border-[#D8D0E7]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#5841E8] uppercase tracking-wider">
                      Specialist & Slot
                    </span>
                    <button
                      onClick={() => setBookingStep(2)}
                      className="text-xs text-[#5841E8] hover:text-[#4834d4] font-bold cursor-pointer min-h-[44px] px-2 inline-flex items-center"
                    >
                      Change / Edit
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#242132]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#5841E8]" />
                      <span className="font-bold text-[#242132]">{activeBookingDraft.staffName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {activeBookingDraft.date} · {activeBookingDraft.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information & Instructions */}
                <div>
                  <span className="text-[10px] font-bold text-[#5841E8] uppercase tracking-wider block mb-2">
                    Guest Contact & Requests
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-[10px] text-[#65567E] font-bold block">Name</span>
                      <input
                        type="text"
                        value={activeBookingDraft.customerName || ''}
                        onChange={(e) => updateDraftDetails({ customerName: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#D8D0E7] rounded-xl px-3 py-2.5 min-h-[44px] text-[#242132] text-xs mt-0.5 focus:border-[#5841E8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#65567E] font-bold block">Phone</span>
                      <input
                        type="tel"
                        value={activeBookingDraft.customerPhone || ''}
                        onChange={(e) => updateDraftDetails({ customerPhone: e.target.value })}
                        className="w-full bg-[#FFFFFF] border border-[#D8D0E7] rounded-xl px-3 py-2.5 min-h-[44px] text-[#242132] text-xs mt-0.5 focus:border-[#5841E8] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#65567E] font-bold block">
                      Special instructions / Stylist preferences (Optional)
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Skin sensitive to hot water, prefers quiet session"
                      value={activeBookingDraft.specialNotes || ''}
                      onChange={(e) => updateDraftDetails({ specialNotes: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#D8D0E7] rounded-xl px-3 py-2.5 min-h-[44px] text-[#242132] text-xs mt-0.5 focus:border-[#5841E8] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="bg-[#FFFFFF] border border-[#D8D0E7] rounded-xl p-3">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#766A83] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. FESTIVE25, NEXORA50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-[#ECE7FF] border border-[#D8D0E7] rounded-xl pl-9 pr-3 py-2.5 min-h-[44px] text-xs text-[#242132] uppercase tracking-wider focus:outline-none focus:border-[#5841E8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 min-h-[44px] bg-[#5841E8] hover:bg-[#4834d4] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs inline-flex items-center justify-center"
                  >
                    Apply
                  </button>
                </form>

                {activeBookingDraft.couponCode && (
                  <div className="flex items-center justify-between text-xs text-emerald-800 mt-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 min-h-[44px]">
                    <span>
                      Promo <strong>{activeBookingDraft.couponCode}</strong> applied (-₹
                      {activeBookingDraft.couponDiscount})
                    </span>
                    <button
                      onClick={removeCouponFromDraft}
                      className="text-xs text-[#65567E] hover:text-[#242132] underline cursor-pointer min-h-[44px] px-2 inline-flex items-center"
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
              <div className="bg-[#FFFFFF] border border-[#D8D0E7] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-[#65567E]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#242132]">₹{activeBookingDraft.subtotal}</span>
                </div>
                {activeBookingDraft.couponDiscount ? (
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>Festival / Promo Discount</span>
                    <span>-₹{activeBookingDraft.couponDiscount}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-xs text-[#65567E]">
                  <span>Taxes & Hygiene Kit (5%)</span>
                  <span>₹{activeBookingDraft.taxesAndFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#242132] pt-2 border-t border-[#D8D0E7]">
                  <span>Total Payable Amount</span>
                  <span className="text-base font-black">₹{activeBookingDraft.totalPayable}</span>
                </div>

                {/* 25% Rule Callout Box */}
                <div className="mt-3 p-3 bg-[#ECE7FF] border border-[#A492F3] rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#5841E8]">
                    <span>25% Advance Amount Payable Now:</span>
                    <span className="text-base text-emerald-700 font-black font-mono">
                      ₹{activeBookingDraft.advancePayable25}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#65567E] font-medium">
                    <span>75% Remaining Amount to Pay at Salon:</span>
                    <span className="text-[#242132] font-bold">
                      ₹{activeBookingDraft.remainingAtSalon75}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#766A83] pt-1 leading-tight">
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
              <div className="w-16 h-16 rounded-full bg-[#ECE7FF] border-2 border-[#5841E8] flex items-center justify-center mx-auto text-[#5841E8] shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#5841E8] block mb-1">
                  25% Advance Verified · Appointment Confirmed!
                </span>
                <h3 className="text-xl font-black text-[#242132]">
                  Booking #{activeBookingDraft.bookingNumber}
                </h3>
                <p className="text-xs text-[#65567E] mt-1">
                  Confirmation sent to {activeBookingDraft.customerPhone} & {activeBookingDraft.customerEmail}
                </p>
              </div>

              {/* Digital Check-in QR Pass */}
              <div className="bg-[#ECE7FF] border border-[#D8D0E7] rounded-2xl p-4 text-left shadow-xs max-w-sm mx-auto">
                <div className="flex items-center justify-between border-b border-[#D8D0E7] pb-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5841E8]">Digital Check-in Pass</span>
                    <h4 className="text-sm font-bold text-[#242132] leading-tight">{activeBookingDraft.salonName}</h4>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D8D0E7] px-2.5 py-1 rounded text-center">
                    <span className="text-[9px] uppercase font-bold text-[#5841E8] block">Pass Code</span>
                    <span className="text-xs font-mono font-black text-[#242132]">{activeBookingDraft.checkInCode}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#242132]">
                  <div className="flex justify-between">
                    <span className="text-[#65567E]">Date & Slot:</span>
                    <span className="font-bold text-emerald-800">
                      {activeBookingDraft.date} at {activeBookingDraft.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65567E]">Specialist:</span>
                    <span className="font-bold">{activeBookingDraft.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65567E]">25% Advance Paid:</span>
                    <span className="text-emerald-700 font-black">₹{activeBookingDraft.advancePayable25} ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65567E]">Remaining to Pay at Salon:</span>
                    <span className="font-bold text-[#242132]">₹{activeBookingDraft.remainingAtSalon75}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#D8D0E7] flex items-center justify-between text-[11px] text-[#65567E]">
                  <span>Show this pass at front desk</span>
                  <span className="text-emerald-700 font-bold">Priority Seat Active</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                <button
                  onClick={handleDownloadCalendar}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl bg-[#ECE7FF] hover:bg-[#E0D8FA] border border-[#D8D0E7] text-[#242132] text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#5841E8]" />
                  <span>Add to Calendar</span>
                </button>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    activeBookingDraft.salonName + ' ' + activeBookingDraft.salonAddress
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl bg-[#ECE7FF] hover:bg-[#E0D8FA] border border-[#D8D0E7] text-[#242132] text-xs font-bold transition-colors shadow-xs"
                >
                  <NavigationIcon className="w-4 h-4 text-emerald-600" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#D8D0E7] bg-[#FFFFFF] flex items-center justify-between gap-3">
          {bookingStep === 1 && (
            <>
              <div className="text-xs">
                <span className="text-[#65567E]">Estimated Total:</span>{' '}
                <strong className="text-[#242132] text-sm font-black">₹{activeBookingDraft.totalPayable || 0}</strong>
              </div>
              <button
                disabled={
                  (!activeBookingDraft.services || activeBookingDraft.services.length === 0) &&
                  !activeBookingDraft.selectedPackage
                }
                onClick={() => setBookingStep(2)}
                className="bg-[#5841E8] hover:bg-[#4834d4] disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 min-h-[44px] inline-flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Choose Slot & Specialist →
              </button>
            </>
          )}

          {bookingStep === 2 && (
            <>
              <div className="text-xs text-[#65567E]">
                Slot: <strong className="text-[#5841E8] font-bold">{activeBookingDraft.timeSlot}</strong>
              </div>
              <button
                onClick={() => setBookingStep(3)}
                className="bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-bold py-2.5 px-4 min-h-[44px] inline-flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Proceed to Summary →
              </button>
            </>
          )}

          {bookingStep === 3 && (
            <>
              <div className="text-xs">
                <span className="text-[#65567E]">Advance (25%):</span>{' '}
                <strong className="text-emerald-700 text-sm font-black">₹{activeBookingDraft.advancePayable25}</strong>
              </div>
              <button
                onClick={() => setBookingStep(4)}
                className="bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-bold py-2.5 px-5 min-h-[44px] inline-flex items-center justify-center rounded-xl transition-all shadow-md cursor-pointer"
              >
                Pay 25% via Nexora QR →
              </button>
            </>
          )}

          {bookingStep === 4 && (
            <div className="w-full text-center text-xs text-[#65567E] font-medium py-2">
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
                className="flex-1 bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-bold py-3 px-4 min-h-[48px] inline-flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs"
              >
                View in My Bookings
              </button>
              <button
                onClick={() => {
                  setBookingModalOpen(false);
                  setSelectedSalonId(null);
                  setActiveTab('home');
                }}
                className="px-5 py-3 min-h-[48px] inline-flex items-center justify-center bg-[#ECE7FF] hover:bg-[#E0D8FA] border border-[#D8D0E7] text-[#242132] text-xs font-bold rounded-xl cursor-pointer shadow-xs"
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
