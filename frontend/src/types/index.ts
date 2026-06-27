export type CalendarStatus = 'available' | 'pending' | 'confirmed' | 'blocked';
export type BookingStatus  = 'pending' | 'confirmed' | 'rejected';
export type EventType      = 'wedding' | 'graduation' | 'commercial' | 'portrait';

export interface SlotCalendarEntry {
  id: number;
  slot_date: string;        // YYYY-MM-DD
  slot_time: string | null; // HH:MM:SS or null
  calendar_status: CalendarStatus;
  label: string | null;
}

export interface Booking {
  id: number;
  slot_id: number;
  full_name: string;
  phone_number: string;
  email: string | null;
  event_type: EventType;
  location: string;
  notes: string | null;
  status: BookingStatus;
  rejection_reason: string | null;
  slot_date: string;
  slot_time: string | null;
  created_at: string;
}

export interface BookingFormData {
  slot_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  event_type: EventType | '';
  location: string;
  notes: string;
  terms_accepted: boolean;
}

export interface AdminUser {
  username: string;
  accessToken: string;
  csrfToken: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
}

export interface GalleryPhoto {
  id: number;
  url: string;
  caption_ar: string | null;
  caption_en: string | null;
  sort_order: number;
}

export interface Package {
  id: number;
  name_ar: string;
  name_en: string;
  price: number;
  currency: string;
  description_ar: string | null;
  description_en: string | null;
  features_ar: string[];
  features_en: string[];
  is_featured: boolean;
  sort_order: number;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding:    'حفل زفاف',
  graduation: 'حفل تخرج',
  commercial: 'مناسبة تجارية',
  portrait:   'جلسة تصوير',
};
