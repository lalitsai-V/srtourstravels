import { supabase } from "./supabase"

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
}

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
    trip_type?: string
    subject?: string
  }
  status: "pending" | "contacted" | "completed"
  created_at: string
}

export interface AppSettings {
  whatsapp_number: string
  email_address: string
  facebook_link: string
  instagram_link: string
  youtube_link?: string
}

// No seeded data — admin must add content via dashboard
const DEFAULT_TOURS: Tour[] = []
const DEFAULT_VEHICLES: Vehicle[] = []
export const DEFAULT_SETTINGS: AppSettings = {
  whatsapp_number: "",
  email_address: "",
  facebook_link: "",
  instagram_link: "",
  youtube_link: ""
}

let inMemoryTours: Tour[] = []
let inMemoryVehicles: Vehicle[] = []
let inMemoryEnquiries: Enquiry[] = []
let inMemorySettings: AppSettings = DEFAULT_SETTINGS

// Cache with timestamps (5 min TTL)
const CACHE_TTL = 5 * 60 * 1000
const cache: { [key: string]: { data: any; timestamp: number } } = {}
let pendingRequests: { [key: string]: Promise<any> } = {}

function getCached<T>(key: string): T | null {
  const item = cache[key]
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data as T
  }
  delete cache[key]
  return null
}

function setCached<T>(key: string, data: T): void {
  cache[key] = { data, timestamp: Date.now() }
}

function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error("Error reading localStorage key:", key, e)
    return defaultValue
  }
}

const SESSION_IMG_PREFIX = "sr_img_"

/** Stores a base64 data URI in sessionStorage and returns a reference key */
function storeImageInSession(id: string, field: string, dataUrl: string): string {
  const key = `${SESSION_IMG_PREFIX}${id}_${field}`
  try { sessionStorage.setItem(key, dataUrl) } catch (e) { /* ignore */ }
  return `session:${key}`
}

/** Resolves session: references back to the actual data URL */
function resolveImage(ref: string): string {
  if (typeof window === "undefined" || !ref?.startsWith("session:")) return ref || ""
  const key = ref.replace("session:", "")
  return sessionStorage.getItem(key) || ref
}

/** Sanitize an array of records for localStorage – extracts base64 into sessionStorage */
function sanitizeForStorage(items: any[]): any[] {
  return items.map((item: any) => {
    if (!item || typeof item !== "object") return item
    const cleaned = { ...item }
    // Offload main image_url base64
    if (cleaned.image_url?.startsWith("data:")) {
      cleaned.image_url = storeImageInSession(cleaned.id, "img", cleaned.image_url)
    }
    // Offload gallery base64
    if (Array.isArray(cleaned.gallery)) {
      cleaned.gallery = cleaned.gallery.map((url: string, idx: number) => {
        if (url?.startsWith("data:")) return storeImageInSession(cleaned.id, `g${idx}`, url)
        return url
      })
    }
    return cleaned
  })
}

/** Restore session: image references after reading from localStorage */
function resolveImages(items: any[]): any[] {
  if (typeof window === "undefined") return items
  return items.map((item: any) => {
    if (!item || typeof item !== "object") return item
    const resolved = { ...item }
    if (resolved.image_url) resolved.image_url = resolveImage(resolved.image_url)
    if (Array.isArray(resolved.gallery)) {
      resolved.gallery = resolved.gallery.map((url: string) => resolveImage(url))
    }
    return resolved
  })
}

function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    const sanitized = Array.isArray(value) ? sanitizeForStorage(value as any[]) : value
    localStorage.setItem(key, JSON.stringify(sanitized))
  } catch (e) {
    console.error("Error writing localStorage key:", key, e)
    // Last resort: strip all image data
    try {
      const minimal = Array.isArray(value)
        ? (value as any[]).map((item: any) => {
            if (!item || typeof item !== "object") return item
            const { gallery, ...rest } = item
            return { ...rest, image_url: item.image_url?.startsWith("data:") ? "" : (item.image_url || "") }
          })
        : value
      localStorage.setItem(key, JSON.stringify(minimal))
    } catch (e2) {
      console.error("localStorage still full after stripping images:", e2)
    }
  }
}


const isSupabaseConfigured = (): boolean => {
  return (
    typeof window !== "undefined" &&
    !!supabase &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  )
}

export async function getTours(): Promise<Tour[]> {
  const cached = getCached<Tour[]>("tours")
  if (cached) return cached
  
  if (await pendingRequests["tours"]) return pendingRequests["tours"]
  
  const request = (async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("tours").select("*")
        if (!error && data) {
          setCached("tours", data)
          return data as Tour[]
        }
        if (error) console.warn("Supabase tours fetch error:", error.message)
      } catch (e) { console.warn("Supabase tours fetch failed:", e) }
    }
    if (inMemoryTours.length === 0) {
      const stored = getLocalStorage("sr_tours", DEFAULT_TOURS)
      inMemoryTours = resolveImages(stored)
    }
    return inMemoryTours
  })()
  
  pendingRequests["tours"] = request
  request.finally(() => delete pendingRequests["tours"])
  return request
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("tours").select("*").eq("slug", slug).maybeSingle()
      if (!error && data) return data as Tour
    } catch (e) { console.warn("Supabase single tour query failed:", e) }
  }
  const tours = await getTours()
  return tours.find(t => t.slug === slug) || null
}

export async function saveTour(tour: Tour): Promise<Tour> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("tours").upsert(tour).select().maybeSingle()
      if (!error && data) {
        delete cache["tours"]
        return data as Tour
      }
      if (error) console.warn("Supabase tour upsert failed:", error.message)
    } catch (e) { console.warn("Supabase tour upsert error:", e) }
  }
  const tours = await getTours()
  const idx = tours.findIndex(t => t.id === tour.id)
  if (idx !== -1) tours[idx] = tour
  else tours.push(tour)
  setLocalStorage("sr_tours", tours)
  inMemoryTours = tours
  delete cache["tours"]
  return tour
}

export async function deleteTour(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("tours").delete().eq("id", id)
      if (!error) {
        delete cache["tours"]
        return true
      }
    } catch (e) { console.warn("Supabase tour delete failed:", e) }
  }
  const tours = await getTours()
  const filtered = tours.filter(t => t.id !== id)
  setLocalStorage("sr_tours", filtered)
  inMemoryTours = filtered
  delete cache["tours"]
  return true
}

export async function getVehicles(): Promise<Vehicle[]> {
  const cached = getCached<Vehicle[]>("vehicles")
  if (cached) return cached
  
  if (await pendingRequests["vehicles"]) return pendingRequests["vehicles"]
  
  const request = (async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("vehicles").select("*")
        if (!error && data) {
          setCached("vehicles", data)
          return data as Vehicle[]
        }
        if (error) console.warn("Supabase vehicles fetch error:", error.message)
      } catch (e) { console.warn("Supabase vehicles fetch failed:", e) }
    }
    if (inMemoryVehicles.length === 0) {
      const stored = getLocalStorage("sr_vehicles", DEFAULT_VEHICLES)
      inMemoryVehicles = resolveImages(stored)
    }
    return inMemoryVehicles
  })()
  
  pendingRequests["vehicles"] = request
  request.finally(() => delete pendingRequests["vehicles"])
  return request
}

export async function saveVehicle(vehicle: Vehicle): Promise<Vehicle> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("vehicles").upsert(vehicle).select().maybeSingle()
      if (!error && data) {
        delete cache["vehicles"]
        return data as Vehicle
      }
      if (error) console.warn("Supabase vehicle upsert failed:", error.message)
    } catch (e) { console.warn("Supabase vehicle upsert failed:", e) }
  }
  const vehicles = await getVehicles()
  const idx = vehicles.findIndex(v => v.id === vehicle.id)
  if (idx !== -1) vehicles[idx] = vehicle
  else vehicles.push(vehicle)
  setLocalStorage("sr_vehicles", vehicles)
  inMemoryVehicles = vehicles
  delete cache["vehicles"]
  return vehicle
}

export async function deleteVehicle(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id)
      if (!error) {
        delete cache["vehicles"]
        return true
      }
    } catch (e) { console.warn("Supabase vehicle delete failed:", e) }
  }
  const vehicles = await getVehicles()
  const filtered = vehicles.filter(v => v.id !== id)
  setLocalStorage("sr_vehicles", filtered)
  inMemoryVehicles = filtered
  delete cache["vehicles"]
  return true
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const cached = getCached<Enquiry[]>("enquiries")
  if (cached) return cached
  
  if (await pendingRequests["enquiries"]) return pendingRequests["enquiries"]
  
  const request = (async () => {
    if (isSupabaseConfigured()) {
      try {
        const [{ data: tourData, error: tourErr }, { data: travelData, error: travelErr }] = await Promise.all([
          supabase.from("tour_enquiries").select("*").order("created_at", { ascending: false }),
          supabase.from("travel_enquiries").select("*").order("created_at", { ascending: false })
        ])
        if (tourErr) console.warn("Supabase tour_enquiries fetch error:", tourErr.message)
        if (travelErr) console.warn("Supabase travel_enquiries fetch error:", travelErr.message)

        const mappedTour = (tourData || []).map((t: any): Enquiry => ({
          id: t.id,
          type: "tour",
          name: t.customer_name,
          email: t.email || "",
          phone: t.phone,
          details: {
            tour_id: t.tour_id,
            tour_name: t.package_name,
            date: t.travel_date,
            travelers: t.travelers,
            message: t.message,
            subject: t.subject
          },
          status: t.status,
          created_at: t.created_at
        }))

        const mappedTravel = (travelData || []).map((r: any): Enquiry => ({
          id: r.id,
          type: "travel",
          name: r.customer_name,
          email: r.email || "",
          phone: r.phone,
          details: {
            pickup: r.from_location,
            destination: r.destination_location,
            distance: r.distance,
            vehicle: r.vehicle_name,
            date: r.travel_date,
            message: r.message
          },
          status: r.status,
          created_at: r.created_at
        }))

        const result = [...mappedTour, ...mappedTravel].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setCached("enquiries", result)
        return result
      } catch (e) { console.warn("Supabase enquiries query failed:", e) }
    }
    if (inMemoryEnquiries.length === 0) inMemoryEnquiries = getLocalStorage("sr_enquiries", [])
    return inMemoryEnquiries
  })()
  
  pendingRequests["enquiries"] = request
  request.finally(() => delete pendingRequests["enquiries"])
  return request
}

export async function submitEnquiry(enquiry: Omit<Enquiry, "id" | "created_at">): Promise<Enquiry> {
  const newEnquiry: Enquiry = { ...enquiry, id: "enq-" + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }
  if (isSupabaseConfigured()) {
    try {
      if (enquiry.type === "tour") {
        const payload = {
          customer_name: enquiry.name,
          phone: enquiry.phone,
          email: enquiry.email,
          package_name: enquiry.details.tour_name || enquiry.details.tour_id || "",
          tour_id: enquiry.details.tour_id || null,
          travelers: enquiry.details.travelers || 1,
          travel_date: enquiry.details.date || null,
          message: enquiry.details.message || "",
          subject: enquiry.details.subject || "",
          status: enquiry.status
        }
        const { data, error } = await supabase.from("tour_enquiries").insert(payload).select().maybeSingle()
        if (!error && data) return {
          id: data.id, type: "tour", name: data.customer_name, email: data.email || "", phone: data.phone,
          details: { tour_id: data.tour_id, tour_name: data.package_name, date: data.travel_date, travelers: data.travelers, message: data.message, subject: data.subject },
          status: data.status, created_at: data.created_at
        }
        if (error) console.warn("Supabase tour_enquiries insert failed:", error.message)
      } else {
        const payload = {
          customer_name: enquiry.name,
          phone: enquiry.phone,
          email: enquiry.email,
          from_location: enquiry.details.pickup || "",
          destination_location: enquiry.details.destination || "",
          distance: enquiry.details.distance || "",
          vehicle_name: enquiry.details.vehicle || "",
          travel_date: enquiry.details.date || null,
          trip_type: enquiry.details.trip_type || "one_way",
          message: enquiry.details.message || "",
          status: enquiry.status
        }
        const { data, error } = await supabase.from("travel_enquiries").insert(payload).select().maybeSingle()
        if (!error && data) return {
          id: data.id, type: "travel", name: data.customer_name, email: data.email || "", phone: data.phone,
          details: { pickup: data.from_location, destination: data.destination_location, distance: data.distance, vehicle: data.vehicle_name, date: data.travel_date, message: data.message },
          status: data.status, created_at: data.created_at
        }
        if (error) console.warn("Supabase travel_enquiries insert failed:", error.message)
      }
    } catch (e) { console.warn("Supabase enquiry insert failed:", e) }
  }

  const enquiries = await getEnquiries()
  enquiries.unshift(newEnquiry)
  setLocalStorage("sr_enquiries", enquiries)
  inMemoryEnquiries = enquiries
  return newEnquiry
}

export async function updateEnquiryStatus(id: string, status: "pending" | "contacted" | "completed"): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error: tourErr } = await supabase.from("tour_enquiries").update({ status }).eq("id", id)
      if (!tourErr) {
        delete cache["enquiries"]
        return true
      }
      const { error: travelErr } = await supabase.from("travel_enquiries").update({ status }).eq("id", id)
      if (!travelErr) {
        delete cache["enquiries"]
        return true
      }
    } catch (e) { console.warn("Supabase enquiry status update failed:", e) }
  }
  const enquiries = await getEnquiries()
  const idx = enquiries.findIndex(e => e.id === id)
  if (idx !== -1) {
    enquiries[idx].status = status
    setLocalStorage("sr_enquiries", enquiries)
    inMemoryEnquiries = enquiries
    delete cache["enquiries"]
    return true
  }
  return false
}

export async function getSettings(): Promise<AppSettings> {
  const cached = getCached<AppSettings>("settings")
  if (cached) return cached
  
  if (await pendingRequests["settings"]) return pendingRequests["settings"]
  
  const request = (async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("website_settings").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle()
        if (!error && data) {
          const result = {
            whatsapp_number: data.whatsapp_number || data.phone || "",
            email_address: data.email || "",
            facebook_link: data.facebook_url || "",
            instagram_link: data.instagram_url || "",
            youtube_link: data.youtube_url || ""
          } as AppSettings
          setCached("settings", result)
          return result
        }
        if (error) console.warn("Supabase website_settings fetch error:", error.message)
      } catch (e) { console.warn("Supabase settings query failed:", e) }
    }
    const result = getLocalStorage("sr_settings", DEFAULT_SETTINGS)
    setCached("settings", result)
    return result
  })()
  
  pendingRequests["settings"] = request
  request.finally(() => delete pendingRequests["settings"])
  return request
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from("website_settings").select("id").order("created_at", { ascending: false }).limit(1).maybeSingle()
      if (data && data.id) {
        const { error } = await supabase.from("website_settings").update({
          whatsapp_number: settings.whatsapp_number,
          phone: settings.whatsapp_number,
          email: settings.email_address,
          facebook_url: settings.facebook_link,
          instagram_url: settings.instagram_link,
          youtube_url: settings.youtube_link
        }).eq("id", data.id)
        if (!error) {
          delete cache["settings"]
          return settings
        }
      } else {
        const { error } = await supabase.from("website_settings").insert({
          whatsapp_number: settings.whatsapp_number,
          phone: settings.whatsapp_number,
          email: settings.email_address,
          facebook_url: settings.facebook_link,
          instagram_url: settings.instagram_link,
          youtube_url: settings.youtube_link
        })
        if (!error) {
          delete cache["settings"]
          return settings
        }
      }
    } catch (e) { console.warn("Supabase settings upsert failed:", e) }
  }
  setLocalStorage("sr_settings", settings)
  inMemorySettings = settings
  delete cache["settings"]
  return settings
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be less than 5MB")
  }

  // Try Supabase Storage first
  if (isSupabaseConfigured()) {
    try {
      const ext = file.name.split(".").pop() || "jpg"
      const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from("images").upload(filename, file, { upsert: true })
      if (!error && data) {
        const { data: publicData } = supabase.storage.from("images").getPublicUrl(data.path)
        return publicData.publicUrl
      }
      if (error) console.warn("Supabase storage upload failed:", error.message)
    } catch (e) { console.warn("Supabase storage error:", e) }
  }

  // Fallback: convert to base64 data URI for local use
  // NOTE: base64 data URIs are stored in sessionStorage (cleared on tab close)
  // to avoid exceeding localStorage's 5MB quota.
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (typeof window !== "undefined") {
        try {
          // Use sessionStorage — much larger quota (up to 50MB) and no persistence issues
          const imageKey = `sr_image_${folder}_${Date.now()}`
          sessionStorage.setItem(imageKey, dataUrl)
        } catch (err) {
          console.warn("Could not cache image in sessionStorage:", err)
        }
      }
      resolve(dataUrl)
    }
    reader.onerror = () => reject(new Error("Failed to read image file"))
    reader.readAsDataURL(file)
  })
}
