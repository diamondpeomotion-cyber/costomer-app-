import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  QrCode, 
  RotateCcw, 
  XCircle, 
  Star, 
  CheckCircle2, 
  FileText, 
  Navigation, 
  ShieldCheck, 
  Scissors, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

export const MyBookingsView: React.FC = () => {
  const { 
    bookings, 
    cancelBooking, 
    rescheduleBooking, 
    rebookBooking, 
    submitReview,
    setActiveTab,
    showToast 
  } = useApp();

  const [filterTab, setFilterTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'pending'>('upcoming');
  
  // Modals state
  const [selectedPassBooking, setSelectedPassBooking] = useState<Booking | null>(null);
  const [rescheduleTargetBooking, setRescheduleTargetBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('03:00 PM');
  
  const [cancelTargetBooking, setCancelTargetBooking] = useState<Booking | null>(null);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'upcoming') return b.paymentStatus === 'advance_paid';
    if (filterTab === 'completed') return b.paymentStatus === 'completed';
    if (filterTab === 'cancelled') return b.paymentStatus === 'cancelled';
    if (filterTab === 'pending') return b.paymentStatus === 'pending_payment';
    return true;
  });

  const handleOpenReschedule = (b: Booking) => {
    setRescheduleTargetBooking(b);
    setRescheduleDate(new Date(Date.now() + 172800000).toISOString().split('T')[0]); // 2 days ahead
    setRescheduleSlot(b.timeSlot);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTargetBooking) return;
    rescheduleBooking(rescheduleTargetBooking.id, rescheduleDate, rescheduleSlot);
    setRescheduleTargetBooking(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelTargetBooking) return;
    cancelBooking(cancelTargetBooking.id);
    setCancelTargetBooking(null);
  };

  const handleOpenReview = (b: Booking) => {
    setReviewTargetBooking(b);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetBooking) return;
    submitReview(reviewTargetBooking.id, reviewRating, reviewComment || 'Excellent service and great ambiance!');
    setReviewTargetBooking(null);
  };

  const availableSlots = ['11:00 AM', '12:30 PM', '02:15 PM', '03:45 PM', '05:30 PM', '07:00 PM'];

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900">My Salon Appointments</h1>
        <p className="text-xs text-slate-500">
          Track upcoming visits, check-in passes, reschedule slots, and view receipts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#ECE7FF] border border-[#D8D0E7] p-1.5 rounded-2xl gap-1.5 shadow-2xs">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'pending', label: 'Pending Advance' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`flex-1 py-2.5 min-h-[44px] flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterTab === tab.id
                ? 'bg-[#5841E8] text-white shadow-xs'
                : 'text-[#65567E] hover:text-[#242132]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#D8D0E7] p-6 space-y-3 shadow-xs">
            <Calendar className="w-10 h-10 text-[#766A83] mx-auto" />
            <h3 className="text-sm font-bold text-[#242132]">No appointments in this category</h3>
            <p className="text-xs text-[#65567E] max-w-xs mx-auto">
              Ready to treat yourself? Discover published salons and book with 25% advance.
            </p>
            <button
              onClick={() => setActiveTab('explore')}
              className="mt-2 px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center bg-[#5841E8] hover:bg-[#4834d4] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Explore Salons Now
            </button>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs"
            >
              {/* Header: Salon info & Booking number */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={b.salonImage}
                    alt={b.salonName}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-violet-700 block">
                      {b.bookingNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{b.salonName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{b.salonAddress}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {b.paymentStatus === 'advance_paid' && (
                    <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                      25% Advance Paid ✓
                    </span>
                  )}
                  {b.paymentStatus === 'completed' && (
                    <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md inline-block">
                      Service Completed
                    </span>
                  )}
                  {b.paymentStatus === 'cancelled' && (
                    <span className="text-[10px] uppercase font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md inline-block">
                      Cancelled & Refunded
                    </span>
                  )}
                  {b.paymentStatus === 'pending_payment' && (
                    <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                      Awaiting Advance
                    </span>
                  )}
                </div>
              </div>

              {/* Appointment Slot & Specialist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Date & Time</span>
                  <span className="font-bold text-slate-900">
                    {b.date} · {b.timeSlot}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Specialist</span>
                  <span className="font-bold text-slate-900">{b.staffName}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 font-medium block">Pass Code</span>
                  <span className="font-mono font-bold text-violet-700">{b.checkInCode}</span>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Booked Services
                </span>
                <div className="space-y-1">
                  {b.services.map((srv) => (
                    <div key={srv.serviceId} className="flex justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Scissors className="w-3 h-3 text-slate-400" />
                        {srv.name} ({srv.durationMinutes}m)
                      </span>
                      <span className="font-bold text-slate-900">₹{srv.price}</span>
                    </div>
                  ))}
                  {b.selectedPackage && (
                    <div className="flex justify-between text-amber-900 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <span>Package: {b.selectedPackage.name}</span>
                      <span>₹{b.selectedPackage.price}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Split Ledger Breakdown */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Bill: ₹{b.totalPayable}</span>
                  <span className="text-emerald-700 font-bold">
                    25% Advance Paid: ₹{b.advancePayable25}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Due at Salon (75%)</span>
                  <span className="font-bold text-slate-900">₹{b.remainingAtSalon75}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                {/* Check-in QR pass button */}
                {b.paymentStatus === 'advance_paid' && (
                  <button
                    onClick={() => setSelectedPassBooking(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-violet-600" />
                    <span>View Check-in QR Pass</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {b.paymentStatus === 'advance_paid' && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(b)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setCancelTargetBooking(b)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {b.paymentStatus === 'completed' && (
                    <>
                      <button
                        onClick={() => handleOpenReview(b)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Review & Earn Coins</span>
                      </button>
                      <button
                        onClick={() => rebookBooking(b)}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Rebook
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: CHECK-IN PASS */}
      {selectedPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                Nexora Verified Pass
              </span>
              <button
                onClick={() => setSelectedPassBooking(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedPassBooking.salonName}</h3>
              <p className="text-xs text-slate-500">{selectedPassBooking.date} at {selectedPassBooking.timeSlot}</p>
            </div>

            {/* Stylized QR Code container */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
              <div className="w-48 h-48 bg-white p-2 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
                  {/* Corner markers */}
                  <rect x="5" y="5" width="22" height="22" rx="3" fill="#0f172a" />
                  <rect x="9" y="9" width="14" height="14" rx="2" fill="#fff" />
                  <rect x="12" y="12" width="8" height="8" rx="1" fill="#7c3aed" />

                  <rect x="73" y="5" width="22" height="22" rx="3" fill="#0f172a" />
                  <rect x="77" y="9" width="14" height="14" rx="2" fill="#fff" />
                  <rect x="80" y="12" width="8" height="8" rx="1" fill="#7c3aed" />

                  <rect x="5" y="73" width="22" height="22" rx="3" fill="#0f172a" />
                  <rect x="9" y="77" width="14" height="14" rx="2" fill="#fff" />
                  <rect x="12" y="80" width="8" height="8" rx="1" fill="#7c3aed" />

                  {/* Modules */}
                  <rect x="35" y="10" width="6" height="6" rx="1" />
                  <rect x="45" y="10" width="6" height="6" rx="1" />
                  <rect x="55" y="10" width="6" height="6" rx="1" />
                  <rect x="35" y="25" width="6" height="6" rx="1" />
                  <rect x="50" y="25" width="6" height="6" rx="1" />

                  <rect x="10" y="35" width="6" height="6" rx="1" />
                  <rect x="25" y="35" width="6" height="6" rx="1" />
                  <rect x="75" y="35" width="6" height="6" rx="1" />

                  <rect x="40" y="45" width="20" height="20" rx="4" fill="#0f172a" />
                  <circle cx="50" cy="55" r="4" fill="#10b981" />

                  <rect x="35" y="75" width="6" height="6" rx="1" />
                  <rect x="50" y="75" width="6" height="6" rx="1" />
                  <rect x="65" y="75" width="6" height="6" rx="1" />
                  <rect x="80" y="75" width="6" height="6" rx="1" />
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Reception Code</span>
              <span className="text-xl font-mono font-black text-violet-700">
                {selectedPassBooking.checkInCode}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Show this QR code at front desk upon arrival for instant priority seat confirmation.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE APPOINTMENT */}
      {rescheduleTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Reschedule Appointment</h3>
              <button
                onClick={() => setRescheduleTargetBooking(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-800 font-bold">
                {rescheduleTargetBooking.salonName}
              </p>
              <p className="text-[11px] text-slate-500">
                Currently: {rescheduleTargetBooking.date} at {rescheduleTargetBooking.timeSlot}
              </p>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Choose New Date
              </label>
              <input
                type="date"
                value={rescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Choose New Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setRescheduleSlot(slot)}
                    className={`py-2 text-center rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      rescheduleSlot === slot
                        ? 'bg-violet-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 bg-violet-50 border border-violet-200 rounded-xl text-[11px] text-violet-800 font-medium">
              ✓ 25% Advance payment is safely carried over to your rescheduled slot.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRescheduleTargetBooking(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Keep Current Slot
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL BOOKING */}
      {cancelTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Cancel Appointment?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your slot at{' '}
              <strong className="text-slate-900">{cancelTargetBooking.salonName}</strong> on{' '}
              {cancelTargetBooking.date}?
            </p>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 text-xs">
              <span className="text-emerald-700 font-bold block">
                Refund Protection Guarantee:
              </span>
              <p className="text-slate-500 text-[11px] leading-tight">
                Your 25% advance of ₹{cancelTargetBooking.advancePayable25} will be refunded directly
                to your original UPI / payment source within 24 hours.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelTargetBooking(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: WRITE VERIFIED REVIEW */}
      {reviewTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Verified Customer Review</h3>
              </div>
              <button
                onClick={() => setReviewTargetBooking(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-800 font-bold">
                {reviewTargetBooking.salonName}
              </p>
              <p className="text-[11px] text-slate-500">
                Service by {reviewTargetBooking.staffName}
              </p>
            </div>

            {/* Star Rating Selector */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <span className={star <= reviewRating ? 'text-amber-500' : 'text-slate-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Your Feedback & Experience
              </label>
              <textarea
                rows={3}
                placeholder="How was the styling, hygiene, and timing? (e.g. Loved the haircut, zero wait time!)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
              <span>🪙 Earn +30 Nexora Coins on submitting verified review</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReviewTargetBooking(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Publish Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
