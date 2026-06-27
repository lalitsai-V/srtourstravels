// =============================================
// TypeScript interfaces matching Supabase schema
// =============================================

export interface ItineraryItem {
  day: number
  title: string
  description: string
}

export interface ReviewItem {
  reviewer: string
  rating: number
  text: string
  date: string
}

export interface Tour {
  id: string
  slug: string
  name: string
  start_location: string
  places_count: number
  duration_days: number
  duration_nights: number
  price: number
  rating: number
  reviews_count: number
  image_url: string
  overview: string
  itinerary: ItineraryItem[]
  included: string[]
  excluded: string[]
  things_to_carry: string[]
  gallery: string[]
  reviews: ReviewItem[]
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  name: string
  type: string
  seat_count: number
  description: string
  image_url: string
  ac: boolean
  price_per_km: number
  gallery?: string[]
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface TourEnquiry {
  id: string
  customer_name: string
  phone: string
  email: string
  package_name: string
  tour_id: string | null
  travelers: number
  travel_date: string
  message: string
  status: "pending" | "contacted" | "completed"
  created_at: string
}

export interface TravelEnquiry {
  id: string
  customer_name: string
  phone: string
  email: string
  from_location: string
  destination_location: string
  distance: string
  vehicle_name: string
  travel_date: string
  trip_type: string
  message: string
  status: "pending" | "contacted" | "completed"
  created_at: string
}

// Unified enquiry type used in admin panel (combines both)
export interface Enquiry {
  id: string
  type: "tour" | "travel"
  name: string
  email: string
  phone: string
  details: {
    tour_id?: string
    tour_name?: string
    pickup?: string
    destination?: string
    date?: string
    vehicle?: string
    distance?: string
    travelers?: number
    message?: string
    subject?: string
  }
  status: "pending" | "contacted" | "completed"
  created_at: string
}

export interface Destination {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  popular: boolean
  created_at: string
}

export interface GalleryItem {
  id: string
  title: string
  image_url: string
  category: string
  sort_order: number
  created_at: string
}

export interface Testimonial {
  id: string
  reviewer_name: string
  rating: number
  review_text: string
  location: string
  avatar_url: string
  is_featured: boolean
  created_at: string
}

export interface WebsiteSettings {
  id: string
  company_name: string
  phone: string
  email: string
  whatsapp_number: string
  address: string
  facebook_url: string
  instagram_url: string
  youtube_url: string
  created_at: string
  updated_at: string
}

// Legacy AppSettings type (for backward compatibility with existing UI)
export interface AppSettings {
  whatsapp_number: string
  email_address: string
  facebook_link: string
  instagram_link: string
  youtube_link?: string
  phone?: string
  address?: string
  company_name?: string
}
