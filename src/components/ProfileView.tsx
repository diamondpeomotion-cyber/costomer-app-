import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Coins, 
  Database, 
  Bell, 
  ShieldCheck, 
  Receipt, 
  ExternalLink, 
  Check, 
  RefreshCw,
  Sparkles,
  Edit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { customer, bookings, supabaseSyncStatus, showToast } = useApp();
  const [showDbArchitectureModal, setShowDbArchitectureModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(customer.name);
  const [phoneInput, setPhoneInput] = useState(customer.phone);
  const [emailInput, setEmailInput] = useState(customer.email);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    sms: true,
    promo: false,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    customer.name = nameInput;
    customer.phone = phoneInput;
    customer.email = emailInput;
    localStorage.setItem('nexora_customer', JSON.stringify(customer));
    setIsEditing(false);
    showToast('Profile information updated successfully!', 'success');
  };

  const handleDownloadInvoice = (bookingNumber: string) => {
    showToast(`Downloading receipt for ${bookingNumber}...`, 'success');
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-900">Customer Account & Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your personal details, notification preferences, and StudioFlow sync
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs">
        <div className="relative">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-violet-500 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 p-1 bg-violet-600 rounded-full text-white text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  {customer.loyaltyTier} Tier
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {customer.email} · {customer.phone}
              </p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="self-center sm:self-start px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              <span>
                {customer.city} ({customer.pincode})
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-slate-800">{customer.loyaltyPoints} Nexora Coins</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>StudioFlow Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form (Inline) */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="p-5 rounded-2xl bg-white border border-violet-200 space-y-3 shadow-xs"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-700">
            Update Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      )}

      {/* StudioFlow & Shared Supabase DB Integration Card */}
      <div className="p-5 rounded-3xl bg-white border border-emerald-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shared StudioFlow Database</h3>
              <p className="text-xs text-slate-500">
                Salon Websites ↔ Owner Dashboard ↔ Nexora Customer App
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Synced
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          This customer app connects directly to the same database as the 14 StudioFlow templates. When a salon owner publishes new services, modifies prices, adds staff, or opens slots, it updates in real time.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Schema: {supabaseSyncStatus.schemaVersion} ({supabaseSyncStatus.publishedSalonsCount} salons)
          </span>
          <button
            onClick={() => setShowDbArchitectureModal(true)}
            className="text-violet-600 hover:text-violet-700 font-bold cursor-pointer"
          >
            View Architecture Blueprint →
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Notification Alerts
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="text-slate-800 font-medium block">WhatsApp Slot Confirmations</span>
              <span className="text-[11px] text-slate-500">
                Receive instant check-in passes & reminders on WhatsApp
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.whatsapp}
              onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
              className="accent-violet-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="text-slate-800 font-medium block">SMS Rescheduling & Alerts</span>
              <span className="text-[11px] text-slate-500">
                Receive critical reminders 2 hours before your appointment
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
              className="accent-violet-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Payment & Invoices History */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Payment & Invoices History
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">25% Advance Escrow</span>
        </div>

        <div className="space-y-2">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{b.salonName}</p>
                <p className="text-[11px] text-slate-500">
                  {b.date} · 25% Advance Paid: ₹{b.advancePayable25} (Total ₹{b.totalPayable})
                </p>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                  Ref: {b.paymentOrderId}
                </span>
              </div>

              <button
                onClick={() => handleDownloadInvoice(b.bookingNumber)}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Download Receipt
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ARCHITECTURE BLUEPRINT MODAL */}
      {showDbArchitectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">StudioFlow Shared Database Architecture</h3>
              </div>
              <button
                onClick={() => setShowDbArchitectureModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Per specification, salon websites, owner dashboard, and the Nexora Customer App operate on one unified schema:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-violet-700 font-bold block mb-0.5">1. Identity & Profiles</span>
                <p className="text-[11px] text-slate-500">
                  Customer profiles, salon owners, and master stylists with role validation.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-amber-800 font-bold block mb-0.5">2. Salon Catalog (14 Templates)</span>
                <p className="text-[11px] text-slate-500">
                  Published salon metadata, categorized services, combos, staff schedules, and video reels.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-emerald-800 font-bold block mb-0.5">3. Live Availability & Slot Reservation</span>
                <p className="text-[11px] text-slate-500">
                  Temporary 10-minute hold reservation with countdown timer to prevent double-booking.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-cyan-800 font-bold block mb-0.5">4. Transactions & 25% Advance Escrow</span>
                <p className="text-[11px] text-slate-500">
                  Payment order ledger, Nexora UPI QR payload, and 75% remaining balance settlement.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-rose-800 font-bold block mb-0.5">5. Customer Engagement</span>
                <p className="text-[11px] text-slate-500">
                  Verified customer reviews with owner replies, customer referral link tracking, and loyalty coins ledger.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDbArchitectureModal(false)}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
