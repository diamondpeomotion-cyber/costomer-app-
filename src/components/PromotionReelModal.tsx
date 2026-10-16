import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  Sparkles, 
  Calendar, 
  MapPin,
  Play
} from 'lucide-react';
import { PromotionVideo } from '../types';
import { useApp } from '../context/AppContext';

interface PromotionReelModalProps {
  reel: PromotionVideo | null;
  onClose: () => void;
}

export const PromotionReelModal: React.FC<PromotionReelModalProps> = ({ reel, onClose }) => {
  const { salons, startBookingForSalon, setSelectedSalonId, showToast } = useApp();
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel ? reel.likesCount : 1200);

  if (!reel) return null;

  const targetSalon = salons.find((s) => s.id === reel.salonId);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      showToast('Added to liked transformation reels!', 'success');
    }
  };

  const handleBookFromReel = () => {
    if (!targetSalon) return;
    const targetService = targetSalon.services.find((s) => s.id === reel.serviceId);
    onClose();
    startBookingForSalon(targetSalon, targetService);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Promotion reel link copied to clipboard!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-800">
        {/* Background Image / Reel Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src={reel.videoThumbnail}
            alt={reel.title}
            className="w-full h-full object-cover brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        </div>

        {/* Top Controls */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Reel
            </span>
            <span className="bg-black/50 text-slate-200 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {reel.duration}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Play Simulation */}
        <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Right side floating interactions */}
        <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-4">
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 text-white group cursor-pointer"
          >
            <div className={`p-2.5 rounded-full transition-transform active:scale-125 ${
              liked ? 'bg-rose-600 text-white' : 'bg-black/60 text-white hover:bg-black/80'
            }`}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[10px] font-medium font-mono">{likesCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-white group cursor-pointer"
          >
            <div className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Share</span>
          </button>
        </div>

        {/* Bottom Salon & Booking Drawer */}
        <div className="relative z-10 p-4 space-y-3">
          {/* Salon Tag & Location */}
          <div className="flex items-center gap-2">
            <div className="bg-violet-600/80 p-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">{reel.salonName}</p>
              <p className="text-[10px] text-slate-300 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-violet-400" />
                {reel.salonCity}
              </p>
            </div>
          </div>

          {/* Reel Caption */}
          <p className="text-sm font-semibold text-white leading-snug drop-shadow-sm">
            {reel.title}
          </p>

          {/* Featured Service Pill with Price */}
          <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
            <div>
              <span className="text-[10px] uppercase text-violet-300 font-semibold block">
                Featured Treatment
              </span>
              <span className="text-white font-medium">{reel.serviceName}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-300">{reel.priceTag}</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">{reel.discountTag}</span>
            </div>
          </div>

          {/* Book CTA */}
          <button
            onClick={handleBookFromReel}
            type="button"
            className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book This Look (25% Advance QR)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
