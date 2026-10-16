import React, { useState } from 'react';
import { 
  Coins, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Award, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_REWARD_VOUCHERS } from '../data/mockSalons';

export const RewardsView: React.FC = () => {
  const { customer, loyaltyLedger, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>([]);

  const referralLink = `https://nexora.app/invite/${customer.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customer.referralCode);
    setCopiedCode(true);
    showToast(`Referral code ${customer.referralCode} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Invite link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Get ₹100 OFF on your first salon appointment with 25% Advance QR on Nexora using my invite code ${customer.referralCode}: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleRedeemVoucher = (v: typeof MOCK_REWARD_VOUCHERS[0]) => {
    if (customer.loyaltyPoints < v.pointsRequired) {
      showToast(`You need ${v.pointsRequired} coins to redeem this voucher`, 'error');
      return;
    }
    setRedeemedVouchers((prev) => [...prev, v.id]);
    showToast(`Voucher redeemed! Use promo code "${v.code}" at checkout`, 'success');
  };

  // Tier progress
  const tierProgressPercent = Math.min(100, Math.round((customer.loyaltyPoints / 600) * 100));

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4 space-y-6 animate-fade-in">
      {/* Top Banner / Coin Card */}
      <div className="relative rounded-3xl bg-white border border-amber-200 p-5 sm:p-6 overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {customer.loyaltyTier} Tier Member
              </span>
              <span className="text-xs text-slate-500 font-medium">· 1 Coin = ₹0.50</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 flex items-center gap-2 mt-1">
              <span>{customer.loyaltyPoints}</span>
              <Coins className="w-8 h-8 text-amber-500 inline" />
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Worth ₹{(customer.loyaltyPoints * 0.5).toFixed(0)} in salon discounts & upgrades
            </p>
          </div>

          <div className="sm:max-w-xs w-full space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Tier: {customer.loyaltyTier}</span>
              <span className="text-amber-700">{customer.loyaltyPoints}/600 to Platinum</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${tierProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Platinum members enjoy priority salon slots and 10% extra savings on packages.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Program Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Invite Friends, Earn ₹200 Each
              </h2>
              <p className="text-xs text-slate-500">
                Give your friends ₹100 off on their first salon visit; earn 200 Nexora Coins after their appointment.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {customer.referralCount} Friends Joined
            </span>
            <span className="text-[10px] text-slate-400 block font-mono mt-1">Ledger synced</span>
          </div>
        </div>

        {/* Referral Code Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-xl font-mono text-sm font-black text-violet-800 tracking-wider">
              {customer.referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-slate-700 hover:text-violet-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Invite Link'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* Eligible Rewards / Vouchers Store */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Redeem Eligible Rewards
            </h2>
          </div>
          <span className="text-xs text-slate-500">Apply at booking summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOCK_REWARD_VOUCHERS.map((v) => {
            const isRedeemed = redeemedVouchers.includes(v.id);
            const canAfford = customer.loyaltyPoints >= v.pointsRequired;
            return (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                      {v.category} Voucher
                    </span>
                    <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                      {v.pointsRequired} Coins
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{v.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Min booking: ₹{v.minBooking} · Valid for {v.validDays} days
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    Code: <strong className="text-slate-900 font-bold">{v.code}</strong>
                  </span>
                  <button
                    onClick={() => handleRedeemVoucher(v)}
                    disabled={isRedeemed || !canAfford}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isRedeemed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : canAfford
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {isRedeemed ? 'Redeemed ✓' : canAfford ? 'Redeem Voucher' : 'Need More Coins'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Loyalty Ledger / Points History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Points History & Ledger
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">StudioFlow Database Ledger</span>
        </div>

        <div className="space-y-2">
          {loyaltyLedger.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
            >
              <div>
                <p className="font-bold text-slate-900">{entry.title}</p>
                <p className="text-[11px] text-slate-500">{entry.description}</p>
                <span className="text-[10px] text-slate-400 block mt-0.5">{entry.date}</span>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-black font-mono ${
                    entry.type === 'redeem' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {entry.type === 'redeem' ? '-' : '+'}
                  {entry.points}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">Coins</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
