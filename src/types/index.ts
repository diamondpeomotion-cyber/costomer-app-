export type ServiceCategory = 
  | 'haircut'
  | 'hair_color'
  | 'hair_spa'
  | 'facial'
  | 'beard_grooming'
  | 'massage_wellness'
  | 'bridal_makeup'
  | 'nails_pedicure';

export interface ServiceItem {
  id: string;
  salonId: string;
  categoryId: ServiceCategory;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  image?: string;
}

export interface PackageDeal {
  id: string;
  salonId: string;
  name: string;
  description: string;
  includedServices: string[];
  durationMinutes: number;
  packagePrice: number;
  originalPrice: number;
  discountPercent: number;
  badge?: string;
}

export interface StaffMember {
  id: string;
  salonId: string;
  name: string;
  role: string;
  photo: string;
  rating: number;
  experienceYears: number;
  specialties: string[];
  availableDays: number[]; // 0 for Sun, 1 for Mon, etc.
  breakSlots?: string[]; // e.g. ["13:00 - 14:00"]
}

export interface Offer {
  id: string;
  salonId?: string; // If undefined, platform-wide offer
  title: string;
  subtitle: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  validTill: string;
  badge: string;
  applicableCategories?: ServiceCategory[];
}

export interface PromotionVideo {
  id: string;
  salonId: string;
  salonName: string;
  salonCity: string;
  title: string;
  discountTag: string;
  videoThumbnail: string;
  videoUrl?: string;
  duration: string;
  serviceId?: string;
  packageId?: string;
  serviceName: string;
  priceTag: string;
  likesCount: number;
}

export interface SalonReview {
  id: string;
  salonId: string;
  bookingId?: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  serviceTag: string;
  verifiedAppointment: boolean;
  ownerReply?: {
    text: string;
    date: string;
    author: string;
  };
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  templateId: string; // e.g. 'luxury-aurum', 'urban-edge', 'scandi-minimal', 'ayurveda-botanical'
  templateName: string;
  rating: number;
  reviewCount: number;
  verifiedBadge: boolean;
  distanceKm: number;
  address: string;
  area: string;
  city: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  openingHours: string; // e.g. "09:30 AM - 09:00 PM"
  isOpenToday: boolean;
  priceLevel: '₹' | '₹₹' | '₹₹₹';
  bannerImage: string;
  galleryImages: string[];
  amenities: string[];
  safetyPolicies: string[];
  cancellationPolicy: string;
  categories: ServiceCategory[];
  services: ServiceItem[];
  packages: PackageDeal[];
  staff: StaffMember[];
  reviews: SalonReview[];
  offers: Offer[];
  promotions: PromotionVideo[];
}

export interface SelectedServiceBooking {
  serviceId: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "NX-BK-94821"
  salonId: string;
  salonName: string;
  salonAddress: string;
  salonCity: string;
  salonPhone: string;
  salonImage: string;
  services: SelectedServiceBooking[];
  selectedPackage?: {
    packageId: string;
    name: string;
    price: number;
    durationMinutes: number;
  };
  staffId: string;
  staffName: string;
  staffPhoto?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:30 AM"
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  specialNotes?: string;
  couponCode?: string;
  couponDiscount: number;
  subtotal: number;
  taxesAndFee: number;
  totalPayable: number;
  advancePayable25: number;
  remainingAtSalon75: number;
  paymentOrderId: string;
  paymentStatus: 'pending_payment' | 'verifying' | 'advance_paid' | 'completed' | 'cancelled';
  paymentMethod: 'nexora_qr' | 'upi' | 'card' | 'salon_pay';
  createdAt: string;
  checkInCode: string;
  reviewSubmitted?: boolean;
}

export interface LoyaltyLedgerEntry {
  id: string;
  type: 'earn' | 'redeem' | 'bonus';
  points: number;
  title: string;
  description: string;
  date: string;
  bookingId?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  city: string;
  pincode: string;
  loyaltyPoints: number;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
  referralCode: string;
  referralCount: number;
  savedSalonIds: string[];
  savedServiceIds: string[];
}

export type NavigationTab = 'home' | 'explore' | 'bookings' | 'rewards' | 'favorites' | 'profile';
