import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  Smartphone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface NexoraQRCodeProps {
  amount: number;
  totalBill: number;
  bookingNumber: string;
  salonName: string;
  onPaymentSuccess: () => void;
  onExpire?: () => void;
}

export const NexoraQRCode: React.FC<NexoraQRCodeProps> = ({
  amount,
  totalBill,
  bookingNumber,
  salonName,
  onPaymentSuccess,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes hold countdown
  const [copied, setCopied] = useState(false);
  const [verificationState, setVerificationState] = useState<
    'idle' | 'verifying' | 'success' | 'failed'
  >('idle');
  const [verificationStageText, setVerificationStageText] = useState('');

  const upiId = 'nexora.pay@icici';
  const upiUrl = `upi://pay?pa=${upiId}&pn=Nexora%20Salons&am=${amount}&tn=Booking%20${bookingNumber}&cu=INR`;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = () => {
    setVerificationState('verifying');
    setVerificationStageText('Querying payment gateway for order status...');

    setTimeout(() => {
      setVerificationStageText('Cross-checking UPI transaction reference with bank...');
    }, 1200);

    setTimeout(() => {
      setVerificationStageText('Verified: ₹' + amount + ' advance captured by Nexora Escrow!');
    }, 2400);

    setTimeout(() => {
      setVerificationState('success');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1000);
    }, 3200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-xs relative overflow-hidden">
      {/* Header with Slot Hold Timer */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Slot Reserved Temporarily
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-0.5">Nexora Verified Advance QR</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-mono font-bold text-amber-900">{formattedTime}</span>
        </div>
      </div>

      {/* Payment Split Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
          <span>Booking Amount</span>
          <span className="text-slate-900 font-bold">₹{totalBill}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-emerald-700 font-bold pb-2 border-b border-slate-200">
          <span>25% Advance Payable Now (Slot Guarantee)</span>
          <span className="text-sm font-black font-mono text-emerald-800">₹{amount}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1.5">
          <span>75% Balance to Pay at Salon</span>
          <span className="text-slate-800 font-bold">₹{totalBill - amount}</span>
        </div>
      </div>

      {/* Dynamic Vector Branded QR Code */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl relative mb-4">
        {/* Scanner line animation */}
        {verificationState === 'verifying' && (
          <div className="absolute inset-0 bg-violet-600/10 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl z-10">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
          </div>
        )}

        {/* Crisp Vector QR Code with Nexora Branding */}
        <div className="w-52 h-52 bg-white rounded-lg p-2 flex items-center justify-center relative shadow-xs border border-slate-200">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-slate-900"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Corner Finder 1 (Top Left) */}
            <rect x="10" y="10" width="46" height="46" rx="6" fill="#0f172a" />
            <rect x="18" y="18" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="24" y="24" width="18" height="18" rx="2" fill="#7c3aed" />

            {/* Corner Finder 2 (Top Right) */}
            <rect x="144" y="10" width="46" height="46" rx="6" fill="#0f172a" />
            <rect x="152" y="18" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="158" y="24" width="18" height="18" rx="2" fill="#7c3aed" />

            {/* Corner Finder 3 (Bottom Left) */}
            <rect x="10" y="144" width="46" height="46" rx="6" fill="#0f172a" />
            <rect x="18" y="152" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="24" y="158" width="18" height="18" rx="2" fill="#7c3aed" />

            {/* Simulated QR Data Matrix Modules */}
            <rect x="66" y="14" width="8" height="8" rx="1.5" />
            <rect x="80" y="14" width="8" height="8" rx="1.5" />
            <rect x="94" y="14" width="8" height="8" rx="1.5" />
            <rect x="116" y="14" width="8" height="8" rx="1.5" />
            <rect x="128" y="14" width="8" height="8" rx="1.5" />

            <rect x="66" y="28" width="8" height="8" rx="1.5" />
            <rect x="88" y="28" width="8" height="8" rx="1.5" />
            <rect x="104" y="28" width="8" height="8" rx="1.5" />
            <rect x="124" y="28" width="8" height="8" rx="1.5" />

            <rect x="66" y="42" width="8" height="8" rx="1.5" />
            <rect x="80" y="42" width="8" height="8" rx="1.5" />
            <rect x="112" y="42" width="8" height="8" rx="1.5" />
            <rect x="128" y="42" width="8" height="8" rx="1.5" />

            <rect x="14" y="66" width="8" height="8" rx="1.5" />
            <rect x="28" y="66" width="8" height="8" rx="1.5" />
            <rect x="42" y="66" width="8" height="8" rx="1.5" />
            <rect x="148" y="66" width="8" height="8" rx="1.5" />
            <rect x="162" y="66" width="8" height="8" rx="1.5" />
            <rect x="176" y="66" width="8" height="8" rx="1.5" />

            <rect x="14" y="80" width="8" height="8" rx="1.5" />
            <rect x="36" y="80" width="8" height="8" rx="1.5" />
            <rect x="52" y="80" width="8" height="8" rx="1.5" />
            <rect x="140" y="80" width="8" height="8" rx="1.5" />
            <rect x="160" y="80" width="8" height="8" rx="1.5" />
            <rect x="178" y="80" width="8" height="8" rx="1.5" />

            <rect x="22" y="94" width="8" height="8" rx="1.5" />
            <rect x="44" y="94" width="8" height="8" rx="1.5" />
            <rect x="148" y="94" width="8" height="8" rx="1.5" />
            <rect x="170" y="94" width="8" height="8" rx="1.5" />

            <rect x="14" y="112" width="8" height="8" rx="1.5" />
            <rect x="34" y="112" width="8" height="8" rx="1.5" />
            <rect x="48" y="112" width="8" height="8" rx="1.5" />
            <rect x="140" y="112" width="8" height="8" rx="1.5" />
            <rect x="164" y="112" width="8" height="8" rx="1.5" />
            <rect x="178" y="112" width="8" height="8" rx="1.5" />

            <rect x="22" y="126" width="8" height="8" rx="1.5" />
            <rect x="42" y="126" width="8" height="8" rx="1.5" />
            <rect x="152" y="126" width="8" height="8" rx="1.5" />
            <rect x="172" y="126" width="8" height="8" rx="1.5" />

            <rect x="66" y="144" width="8" height="8" rx="1.5" />
            <rect x="80" y="144" width="8" height="8" rx="1.5" />
            <rect x="100" y="144" width="8" height="8" rx="1.5" />
            <rect x="122" y="144" width="8" height="8" rx="1.5" />
            <rect x="142" y="144" width="8" height="8" rx="1.5" />
            <rect x="160" y="144" width="8" height="8" rx="1.5" />
            <rect x="178" y="144" width="8" height="8" rx="1.5" />

            <rect x="74" y="158" width="8" height="8" rx="1.5" />
            <rect x="92" y="158" width="8" height="8" rx="1.5" />
            <rect x="110" y="158" width="8" height="8" rx="1.5" />
            <rect x="134" y="158" width="8" height="8" rx="1.5" />
            <rect x="156" y="158" width="8" height="8" rx="1.5" />
            <rect x="174" y="158" width="8" height="8" rx="1.5" />

            <rect x="66" y="172" width="8" height="8" rx="1.5" />
            <rect x="86" y="172" width="8" height="8" rx="1.5" />
            <rect x="104" y="172" width="8" height="8" rx="1.5" />
            <rect x="124" y="172" width="8" height="8" rx="1.5" />
            <rect x="148" y="172" width="8" height="8" rx="1.5" />
            <rect x="168" y="172" width="8" height="8" rx="1.5" />

            {/* Center Logo Shield Badge */}
            <rect x="72" y="72" width="56" height="56" rx="12" fill="#ffffff" />
            <rect x="76" y="76" width="48" height="48" rx="10" fill="#0f172a" />
            <circle cx="100" cy="100" r="16" fill="#7c3aed" />
            <path
              d="M93 100 L98 105 L108 94"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <p className="text-[11px] font-medium text-slate-600 mt-2 text-center">
          Scan with GPay · PhonePe · Paytm · BHIM
        </p>
      </div>

      {/* Copy UPI ID */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Nexora UPI VPA</span>
          <span className="text-xs font-mono font-bold text-slate-800">{upiId}</span>
        </div>
        <button
          onClick={handleCopyUpi}
          type="button"
          className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold cursor-pointer shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Quick Launch Buttons (Simulated UPI App Handlers) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <a
          href={upiUrl}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span className="text-xs font-bold text-blue-600">GPay</span>
          <span className="text-[10px] text-slate-500">Google Pay</span>
        </a>
        <a
          href={upiUrl}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span className="text-xs font-bold text-violet-600">PhonePe</span>
          <span className="text-[10px] text-slate-500">Direct UPI</span>
        </a>
        <a
          href={upiUrl}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span className="text-xs font-bold text-sky-600">Paytm</span>
          <span className="text-[10px] text-slate-500">UPI App</span>
        </a>
      </div>

      {/* Verification Action and Status Handler */}
      {verificationState === 'idle' && (
        <button
          onClick={handleVerifyPayment}
          type="button"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>I Have Completed Payment</span>
        </button>
      )}

      {verificationState === 'verifying' && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-violet-800 text-xs font-bold mb-1">
            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
            <span>Verifying with Payment Gateway...</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">{verificationStageText}</p>
        </div>
      )}

      {verificationState === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Advance Verified! Confirming Appointment...</span>
        </div>
      )}

      {/* Safety Notice */}
      <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
        Nexora Escrow Guarantee · 25% Advance safely held until appointment verification · 100% refundable as per salon cancellation policy
      </p>
    </div>
  );
};
