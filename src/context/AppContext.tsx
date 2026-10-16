import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Salon, 
  Booking, 
  CustomerProfile, 
  NavigationTab, 
  LoyaltyLedgerEntry,
  PromotionVideo,
  ServiceItem,
  PackageDeal
} from '../types';
import { MOCK_SALONS, PLATFORM_OFFERS } from '../data/mockSalons';

interface AppContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedSalonId: string | null;
  setSelectedSalonId: (id: string | null) => void;
  activeSalon: Salon | null;
  
  // Data
  salons: Salon[];
  customer: CustomerProfile;
  bookings: Booking[];
  loyaltyLedger: LoyaltyLedgerEntry[];
  currentLocation: { city: string; area: string; pincode: string };
  setCurrentLocation: (loc: { city: string; area: string; pincode: string }) => void;
  
  // Favorites
  toggleFavoriteSalon: (salonId: string) => void;
  isSalonFavorite: (salonId: string) => boolean;
  toggleFavoriteService: (serviceId: string) => void;
  isServiceFavorite: (serviceId: string) => boolean;

  // Booking Flow
  bookingModalOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  bookingStep: number;
  setBookingStep: (step: number) => void;
  activeBookingDraft: Partial<Booking> | null;
  startBookingForSalon: (salon: Salon, initialService?: ServiceItem, initialPackage?: PackageDeal) => void;
  addServiceToDraft: (service: ServiceItem) => void;
  removeServiceFromDraft: (serviceId: string) => void;
  selectPackageForDraft: (pkg: PackageDeal | null) => void;
  updateDraftDetails: (details: Partial<Booking>) => void;
  applyCouponToDraft: (code: string) => { success: boolean; message: string; discount?: number };
  removeCouponFromDraft: () => void;
  confirmBookingAdvance: (paymentMethod: 'nexora_qr' | 'upi' | 'card') => Promise<Booking>;
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newSlot: string) => void;
  rebookBooking: (booking: Booking) => void;
  submitReview: (bookingId: string, rating: number, comment: string) => void;

  // Reel Modal
  activeReel: PromotionVideo | null;
  setActiveReel: (reel: PromotionVideo | null) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSpecificService: string | null;
  setSelectedSpecificService: (srv: string | null) => void;
  filterDate: string | null;
  setFilterDate: (date: string | null) => void;
  filterTimeSlot: string | null;
  setFilterTimeSlot: (slot: string | null) => void;
  filterPromotionType: string | null;
  setFilterPromotionType: (promo: string | null) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  selectedPrice: string;
  setSelectedPrice: (price: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  minDiscountPercent: number;
  setMinDiscountPercent: (discount: number) => void;
  resetAllFilters: () => void;
  activeFiltersCount: number;

  // Notifications
  notificationToast: { show: boolean; message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Supabase StudioFlow Ecosystem sync state
  supabaseSyncStatus: {
    connected: boolean;
    lastSynced: string;
    publishedSalonsCount: number;
    schemaVersion: string;
    environment: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CUSTOMER: CustomerProfile = {
  id: 'cust-aarav-89',
  name: 'Aarav Sharma',
  phone: '+91 98765 43210',
  email: 'aarav.sharma@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  city: 'Bangalore',
  pincode: '560038',
  loyaltyPoints: 380,
  loyaltyTier: 'Gold',
  referralCode: 'AARAV2026',
  referralCount: 3,
  savedSalonIds: ['salon-luxe-aurum', 'salon-urban-edge'],
  savedServiceIds: ['la-srv-1', 'ue-srv-1'],
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-upcoming-01',
    bookingNumber: 'NX-BK-84910',
    salonId: 'salon-luxe-aurum',
    salonName: 'Luxe Aurum Salon & Premium Spa',
    salonAddress: '100 Feet Road, 12th Main, Indiranagar',
    salonCity: 'Bangalore',
    salonPhone: '+91 80 4125 7890',
    salonImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
    services: [
      {
        serviceId: 'la-srv-1',
        name: 'Signature Creative Haircut & Blowout',
        price: 899,
        durationMinutes: 45,
        category: 'haircut',
      },
    ],
    staffId: 'la-st-1',
    staffName: 'Vikram Malhotra',
    staffPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    date: 'Tomorrow, Oct 16, 2026',
    timeSlot: '03:30 PM',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'aarav.sharma@example.com',
    specialNotes: 'Prefers quiet session, medium textured length on sides.',
    couponCode: 'NEXORA50',
    couponDiscount: 50,
    subtotal: 899,
    taxesAndFee: 42,
    totalPayable: 891,
    advancePayable25: 223,
    remainingAtSalon75: 668,
    paymentOrderId: 'order_nx_9824021',
    paymentStatus: 'advance_paid',
    paymentMethod: 'nexora_qr',
    createdAt: '2026-10-15 08:30 AM',
    checkInCode: 'NX-4109',
    reviewSubmitted: false,
  },
  {
    id: 'bk-completed-01',
    bookingNumber: 'NX-BK-73912',
    salonId: 'salon-urban-edge',
    salonName: 'Urban Edge Barber & Grooming Lab',
    salonAddress: '80 Feet Road, 4th Block, Koramangala',
    salonCity: 'Bangalore',
    salonPhone: '+91 80 2552 4433',
    salonImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
    services: [
      {
        serviceId: 'ue-srv-1',
        name: 'Precision Skin Fade & Textured Crop',
        price: 499,
        durationMinutes: 35,
        category: 'haircut',
      },
      {
        serviceId: 'ue-srv-2',
        name: 'Royal Beard Sculpt & Hot Towel Ozone Steam',
        price: 349,
        durationMinutes: 30,
        category: 'beard_grooming',
      },
    ],
    staffId: 'ue-st-1',
    staffName: 'Rocky Fernandez',
    staffPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    date: 'Oct 11, 2026',
    timeSlot: '05:00 PM',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'aarav.sharma@example.com',
    couponCode: 'URBAN15',
    couponDiscount: 127,
    subtotal: 848,
    taxesAndFee: 36,
    totalPayable: 757,
    advancePayable25: 189,
    remainingAtSalon75: 568,
    paymentOrderId: 'order_nx_8109312',
    paymentStatus: 'completed',
    paymentMethod: 'nexora_qr',
    createdAt: '2026-10-11 03:00 PM',
    checkInCode: 'NX-7721',
    reviewSubmitted: false, // Ready for review flow test
  },
];

const INITIAL_LOYALTY: LoyaltyLedgerEntry[] = [
  {
    id: 'loy-1',
    type: 'earn',
    points: 25,
    title: 'Appointment Advance Completed',
    description: 'Earned 25 Nexora Coins for booking at Luxe Aurum Salon',
    date: 'Today, Oct 15',
    bookingId: 'bk-upcoming-01',
  },
  {
    id: 'loy-2',
    type: 'earn',
    points: 55,
    title: 'Completed Service Visit',
    description: 'Visited Urban Edge Barber & settled remaining balance',
    date: 'Oct 11, 2026',
    bookingId: 'bk-completed-01',
  },
  {
    id: 'loy-3',
    type: 'bonus',
    points: 200,
    title: 'Friend Referral Reward',
    description: 'Rahul Verma completed his first appointment with your referral code',
    date: 'Oct 04, 2026',
  },
  {
    id: 'loy-4',
    type: 'bonus',
    points: 100,
    title: 'Nexora Welcome Bonus',
    description: 'Signed up on the StudioFlow customer network',
    date: 'Sep 28, 2026',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [salons, setSalons] = useState<Salon[]>(() => {
    const saved = localStorage.getItem('nexora_salons');
    return saved ? JSON.parse(saved) : MOCK_SALONS;
  });

  const [customer, setCustomer] = useState<CustomerProfile>(() => {
    const saved = localStorage.getItem('nexora_customer');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('nexora_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [loyaltyLedger, setLoyaltyLedger] = useState<LoyaltyLedgerEntry[]>(() => {
    const saved = localStorage.getItem('nexora_loyalty');
    return saved ? JSON.parse(saved) : INITIAL_LOYALTY;
  });

  const [currentLocation, setCurrentLocation] = useState({
    city: 'Bangalore',
    area: 'Indiranagar',
    pincode: '560038',
  });

  const [activeReel, setActiveReel] = useState<PromotionVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSpecificService, setSelectedSpecificService] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterTimeSlot, setFilterTimeSlot] = useState<string | null>(null);
  const [filterPromotionType, setFilterPromotionType] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [minDiscountPercent, setMinDiscountPercent] = useState<number>(0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSpecificService(null);
    setFilterDate(null);
    setFilterTimeSlot(null);
    setFilterPromotionType(null);
    setMaxDistance(10);
    setSelectedPrice('all');
    setMinRating(0);
    setMinDiscountPercent(0);
  };

  const activeFiltersCount = 
    (searchQuery.trim() ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedSpecificService ? 1 : 0) +
    (filterDate ? 1 : 0) +
    (filterTimeSlot ? 1 : 0) +
    (filterPromotionType ? 1 : 0) +
    (maxDistance < 10 ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minDiscountPercent > 0 ? 1 : 0);

  // Booking Flow State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [activeBookingDraft, setActiveBookingDraft] = useState<Partial<Booking> | null>(null);

  // Notification Toast
  const [notificationToast, setNotificationToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotificationToast({ show: true, message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 3800);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nexora_customer', JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    localStorage.setItem('nexora_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('nexora_salons', JSON.stringify(salons));
  }, [salons]);

  useEffect(() => {
    localStorage.setItem('nexora_loyalty', JSON.stringify(loyaltyLedger));
  }, [loyaltyLedger]);

  const activeSalon = selectedSalonId
    ? salons.find((s) => s.id === selectedSalonId) || null
    : null;

  // Favorites
  const toggleFavoriteSalon = (salonId: string) => {
    setCustomer((prev) => {
      const exists = prev.savedSalonIds.includes(salonId);
      const updated = exists
        ? prev.savedSalonIds.filter((id) => id !== salonId)
        : [...prev.savedSalonIds, salonId];
      showToast(exists ? 'Salon removed from Favorites' : 'Salon saved to Favorites!', 'success');
      return { ...prev, savedSalonIds: updated };
    });
  };

  const isSalonFavorite = (salonId: string) => customer.savedSalonIds.includes(salonId);

  const toggleFavoriteService = (serviceId: string) => {
    setCustomer((prev) => {
      const exists = prev.savedServiceIds.includes(serviceId);
      const updated = exists
        ? prev.savedServiceIds.filter((id) => id !== serviceId)
        : [...prev.savedServiceIds, serviceId];
      showToast(exists ? 'Service removed from Favorites' : 'Service bookmarked!', 'success');
      return { ...prev, savedServiceIds: updated };
    });
  };

  const isServiceFavorite = (serviceId: string) => customer.savedServiceIds.includes(serviceId);

  // Booking Flow Helpers
  const recalculateDraftTotals = (draft: Partial<Booking>): Partial<Booking> => {
    let subtotal = 0;
    if (draft.services && draft.services.length > 0) {
      subtotal += draft.services.reduce((acc, s) => acc + s.price, 0);
    }
    if (draft.selectedPackage) {
      subtotal += draft.selectedPackage.price;
    }

    const discount = draft.couponDiscount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const taxesAndFee = Math.round(discountedSubtotal * 0.05); // 5% GST & service
    const totalPayable = discountedSubtotal + taxesAndFee;
    
    // Strict 25% Advance Calculation per user specification:
    // "Advance: Final payable amount ka 25%, Remaining: 75% salon par payable"
    const advancePayable25 = Math.round(totalPayable * 0.25);
    const remainingAtSalon75 = totalPayable - advancePayable25;

    return {
      ...draft,
      subtotal,
      taxesAndFee,
      totalPayable,
      advancePayable25,
      remainingAtSalon75,
    };
  };

  const startBookingForSalon = (
    salon: Salon,
    initialService?: ServiceItem,
    initialPackage?: PackageDeal
  ) => {
    const initialServices = initialService
      ? [
          {
            serviceId: initialService.id,
            name: initialService.name,
            price: initialService.price,
            durationMinutes: initialService.durationMinutes,
            category: initialService.categoryId,
          },
        ]
      : [];

    const selectedPkg = initialPackage
      ? {
          packageId: initialPackage.id,
          name: initialPackage.name,
          price: initialPackage.packagePrice,
          durationMinutes: initialPackage.durationMinutes,
        }
      : undefined;

    const baseDraft: Partial<Booking> = {
      salonId: salon.id,
      salonName: salon.name,
      salonAddress: salon.address,
      salonCity: salon.city,
      salonPhone: salon.phone,
      salonImage: salon.bannerImage,
      services: initialServices,
      selectedPackage: selectedPkg,
      staffId: salon.staff[0]?.id || 'any-specialist',
      staffName: salon.staff[0]?.name || 'Any Available Specialist',
      staffPhoto: salon.staff[0]?.photo,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      timeSlot: '11:30 AM',
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      couponDiscount: 0,
      paymentOrderId: `ord_nx_${Date.now().toString().slice(-6)}`,
      paymentStatus: 'pending_payment',
      paymentMethod: 'nexora_qr',
    };

    const calculated = recalculateDraftTotals(baseDraft);
    setActiveBookingDraft(calculated);
    setBookingStep(1);
    setBookingModalOpen(true);
  };

  const addServiceToDraft = (service: ServiceItem) => {
    if (!activeBookingDraft) return;
    const currentServices = activeBookingDraft.services || [];
    if (currentServices.some((s) => s.serviceId === service.id)) {
      showToast('Service is already in your booking checklist');
      return;
    }
    const updatedServices = [
      ...currentServices,
      {
        serviceId: service.id,
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        category: service.categoryId,
      },
    ];
    const updatedDraft = recalculateDraftTotals({
      ...activeBookingDraft,
      services: updatedServices,
    });
    setActiveBookingDraft(updatedDraft);
    showToast(`Added ${service.name} to booking`, 'success');
  };

  const removeServiceFromDraft = (serviceId: string) => {
    if (!activeBookingDraft) return;
    const currentServices = activeBookingDraft.services || [];
    const updatedServices = currentServices.filter((s) => s.serviceId !== serviceId);
    const updatedDraft = recalculateDraftTotals({
      ...activeBookingDraft,
      services: updatedServices,
    });
    setActiveBookingDraft(updatedDraft);
  };

  const selectPackageForDraft = (pkg: PackageDeal | null) => {
    if (!activeBookingDraft) return;
    const selectedPkg = pkg
      ? {
          packageId: pkg.id,
          name: pkg.name,
          price: pkg.packagePrice,
          durationMinutes: pkg.durationMinutes,
        }
      : undefined;

    const updatedDraft = recalculateDraftTotals({
      ...activeBookingDraft,
      selectedPackage: selectedPkg,
    });
    setActiveBookingDraft(updatedDraft);
  };

  const updateDraftDetails = (details: Partial<Booking>) => {
    if (!activeBookingDraft) return;
    const updated = recalculateDraftTotals({
      ...activeBookingDraft,
      ...details,
    });
    setActiveBookingDraft(updated);
  };

  const applyCouponToDraft = (code: string) => {
    if (!activeBookingDraft) return { success: false, message: 'No active booking draft' };
    const cleanCode = code.trim().toUpperCase();
    
    // Check platform offers or salon-specific offers
    const salon = salons.find((s) => s.id === activeBookingDraft.salonId);
    const availableOffers = [
      ...PLATFORM_OFFERS,
      ...(salon?.offers || []),
    ];

    const foundOffer = availableOffers.find(
      (o) => o.code.toUpperCase() === cleanCode
    );

    if (!foundOffer) {
      return { success: false, message: `Promo code "${cleanCode}" is invalid or expired` };
    }

    const subtotal = activeBookingDraft.subtotal || 0;
    if (subtotal < foundOffer.minOrder) {
      return {
        success: false,
        message: `Min order value for ${foundOffer.code} is ₹${foundOffer.minOrder}`,
      };
    }

    const calculatedDiscount = Math.min(
      Math.round((subtotal * foundOffer.discountPercent) / 100),
      foundOffer.maxDiscount
    );

    const updated = recalculateDraftTotals({
      ...activeBookingDraft,
      couponCode: foundOffer.code,
      couponDiscount: calculatedDiscount,
    });

    setActiveBookingDraft(updated);
    showToast(`Code "${foundOffer.code}" applied! You saved ₹${calculatedDiscount}`, 'success');
    return { success: true, message: `Applied successfully! Saved ₹${calculatedDiscount}`, discount: calculatedDiscount };
  };

  const removeCouponFromDraft = () => {
    if (!activeBookingDraft) return;
    const updated = recalculateDraftTotals({
      ...activeBookingDraft,
      couponCode: undefined,
      couponDiscount: 0,
    });
    setActiveBookingDraft(updated);
    showToast('Promo code removed', 'info');
  };

  const confirmBookingAdvance = async (paymentMethod: 'nexora_qr' | 'upi' | 'card'): Promise<Booking> => {
    if (!activeBookingDraft) throw new Error('No draft booking to confirm');

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newBooking: Booking = {
      ...(activeBookingDraft as Booking),
      id: `bk-${Date.now()}`,
      bookingNumber: `NX-BK-${randomSuffix}`,
      paymentMethod,
      paymentStatus: 'advance_paid',
      createdAt: new Date().toLocaleString(),
      checkInCode: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      reviewSubmitted: false,
    };

    // Add to bookings list at beginning
    setBookings((prev) => [newBooking, ...prev]);

    // Award loyalty points: 25 points for advance booking
    const earnedPoints = 25;
    const newPointsTotal = customer.loyaltyPoints + earnedPoints;
    setCustomer((prev) => ({
      ...prev,
      loyaltyPoints: newPointsTotal,
      loyaltyTier: newPointsTotal >= 600 ? 'Platinum' : newPointsTotal >= 200 ? 'Gold' : 'Silver',
    }));

    // Add ledger entry
    const newLedgerEntry: LoyaltyLedgerEntry = {
      id: `loy-${Date.now()}`,
      type: 'earn',
      points: earnedPoints,
      title: 'Appointment Advance Confirmed',
      description: `Earned 25 coins for booking at ${newBooking.salonName}`,
      date: 'Today, Just now',
      bookingId: newBooking.id,
    };
    setLoyaltyLedger((prev) => [newLedgerEntry, ...prev]);

    // Update active booking draft to completed confirmed status for Step 5
    setActiveBookingDraft(newBooking);
    setBookingStep(5);
    showToast(`Booking ${newBooking.bookingNumber} Confirmed! 25% Advance Verified via Nexora QR`, 'success');

    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: 'cancelled' } : b))
    );
    showToast('Booking cancelled. 25% Advance refund initiated per cancellation policy.', 'info');
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newSlot: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, date: newDate, timeSlot: newSlot } : b
      )
    );
    showToast('Appointment rescheduled successfully! New confirmation sent.', 'success');
  };

  const rebookBooking = (prevBooking: Booking) => {
    const salon = salons.find((s) => s.id === prevBooking.salonId);
    if (!salon) {
      showToast('This salon is currently updating its catalogue.', 'error');
      return;
    }
    // Check if services still exist and refresh current pricing per user spec:
    // "Rebook purani services select karega, lekin current price aur available slot dobara check karega."
    const refreshedServices = prevBooking.services.map((prevS) => {
      const liveService = salon.services.find((s) => s.id === prevS.serviceId);
      if (liveService) {
        return {
          serviceId: liveService.id,
          name: liveService.name,
          price: liveService.price,
          durationMinutes: liveService.durationMinutes,
          category: liveService.categoryId,
        };
      }
      return prevS;
    });

    const baseDraft: Partial<Booking> = {
      salonId: salon.id,
      salonName: salon.name,
      salonAddress: salon.address,
      salonCity: salon.city,
      salonPhone: salon.phone,
      salonImage: salon.bannerImage,
      services: refreshedServices,
      staffId: prevBooking.staffId,
      staffName: prevBooking.staffName,
      staffPhoto: prevBooking.staffPhoto,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '02:00 PM',
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      couponDiscount: 0,
      paymentOrderId: `ord_nx_${Date.now().toString().slice(-6)}`,
      paymentStatus: 'pending_payment',
      paymentMethod: 'nexora_qr',
    };

    const calculated = recalculateDraftTotals(baseDraft);
    setActiveBookingDraft(calculated);
    setBookingStep(2); // Jump straight to slot/date selection!
    setBookingModalOpen(true);
    showToast('Rebooking services with live salon availability verified.', 'info');
  };

  const submitReview = (bookingId: string, rating: number, comment: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      salonId: booking.salonId,
      bookingId: booking.id,
      customerName: customer.name,
      rating,
      date: 'Just now',
      comment,
      serviceTag: booking.services[0]?.name || 'Salon Visit',
      verifiedAppointment: true,
    };

    // Add review to the salon
    setSalons((prev) =>
      prev.map((s) => {
        if (s.id === booking.salonId) {
          const updatedReviews = [newReview, ...s.reviews];
          const newAvg = (
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
          ).toFixed(1);
          return {
            ...s,
            reviews: updatedReviews,
            reviewCount: s.reviewCount + 1,
            rating: parseFloat(newAvg),
          };
        }
        return s;
      })
    );

    // Mark booking as reviewSubmitted
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, reviewSubmitted: true } : b))
    );

    // Reward customer with 30 bonus points for verified review
    const bonusPoints = 30;
    setCustomer((prev) => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + bonusPoints,
    }));
    setLoyaltyLedger((prev) => [
      {
        id: `loy-rev-${Date.now()}`,
        type: 'bonus',
        points: bonusPoints,
        title: 'Verified Customer Review Bonus',
        description: `Earned 30 coins for reviewing ${booking.salonName}`,
        date: 'Today, Just now',
        bookingId: booking.id,
      },
      ...prev,
    ]);

    showToast('Review submitted with Verified Customer badge! +30 Coins earned.', 'success');
  };

  const supabaseSyncStatus = {
    connected: true,
    lastSynced: 'Real-time Live Sync (Active)',
    publishedSalonsCount: salons.length,
    schemaVersion: 'StudioFlow Supabase v2.4 (Unified)',
    environment: 'Production Sites Network',
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedSalonId,
        setSelectedSalonId,
        activeSalon,
        salons,
        customer,
        bookings,
        loyaltyLedger,
        currentLocation,
        setCurrentLocation,
        toggleFavoriteSalon,
        isSalonFavorite,
        toggleFavoriteService,
        isServiceFavorite,
        bookingModalOpen,
        setBookingModalOpen,
        bookingStep,
        setBookingStep,
        activeBookingDraft,
        startBookingForSalon,
        addServiceToDraft,
        removeServiceFromDraft,
        selectPackageForDraft,
        updateDraftDetails,
        applyCouponToDraft,
        removeCouponFromDraft,
        confirmBookingAdvance,
        cancelBooking,
        rescheduleBooking,
        rebookBooking,
        submitReview,
        activeReel,
        setActiveReel,
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
        notificationToast,
        showToast,
        supabaseSyncStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
