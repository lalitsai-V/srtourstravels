-- =============================================
-- SR Tours & Travels - Supabase Database Schema
-- =============================================
-- Run this entire file in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- After running, create an admin user in Authentication > Users with:
--   Email: srtourstravels@admin.com
--   Password: Srsr2406

-- =============================================
-- 1. TOURS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  start_location TEXT NOT NULL DEFAULT '',
  places_count INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_nights INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  overview TEXT NOT NULL DEFAULT '',
  itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
  included JSONB NOT NULL DEFAULT '[]'::jsonb,
  excluded JSONB NOT NULL DEFAULT '[]'::jsonb,
  things_to_carry JSONB NOT NULL DEFAULT '[]'::jsonb,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 2. VEHICLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  seat_count INTEGER NOT NULL DEFAULT 4,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  ac BOOLEAN NOT NULL DEFAULT true,
  price_per_km NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. TOUR ENQUIRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tour_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  package_name TEXT NOT NULL DEFAULT '',
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  travelers INTEGER DEFAULT 1,
  travel_date TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4. TRAVEL ENQUIRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS travel_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  from_location TEXT NOT NULL DEFAULT '',
  destination_location TEXT NOT NULL DEFAULT '',
  distance TEXT DEFAULT '',
  vehicle_name TEXT NOT NULL DEFAULT '',
  travel_date TEXT DEFAULT '',
  trip_type TEXT DEFAULT 'one_way',
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 5. DESTINATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. GALLERY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 7. TESTIMONIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 8. WEBSITE SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 9. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 10. RLS POLICIES - PUBLIC READ
-- =============================================

-- Tours: Public can read active tours
DROP POLICY IF EXISTS "Public can read active tours" ON tours;
CREATE POLICY "Public can read active tours"
  ON tours FOR SELECT
  USING (status = 'active');

-- Vehicles: Public can read active vehicles
DROP POLICY IF EXISTS "Public can read active vehicles" ON vehicles;
CREATE POLICY "Public can read active vehicles"
  ON vehicles FOR SELECT
  USING (status = 'active');

-- Testimonials: Public can read all
DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
CREATE POLICY "Public can read testimonials"
  ON testimonials FOR SELECT
  USING (true);

-- Destinations: Public can read all
DROP POLICY IF EXISTS "Public can read destinations" ON destinations;
CREATE POLICY "Public can read destinations"
  ON destinations FOR SELECT
  USING (true);

-- Gallery: Public can read all
DROP POLICY IF EXISTS "Public can read gallery" ON gallery;
CREATE POLICY "Public can read gallery"
  ON gallery FOR SELECT
  USING (true);

-- Website Settings: Public can read
DROP POLICY IF EXISTS "Public can read settings" ON website_settings;
CREATE POLICY "Public can read settings"
  ON website_settings FOR SELECT
  USING (true);

-- Tour Enquiries: Public can INSERT (submit enquiry)
DROP POLICY IF EXISTS "Public can submit tour enquiries" ON tour_enquiries;
CREATE POLICY "Public can submit tour enquiries"
  ON tour_enquiries FOR INSERT
  WITH CHECK (true);

-- Travel Enquiries: Public can INSERT (submit enquiry)
DROP POLICY IF EXISTS "Public can submit travel enquiries" ON travel_enquiries;
CREATE POLICY "Public can submit travel enquiries"
  ON travel_enquiries FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 11. RLS POLICIES - ADMIN FULL ACCESS
-- =============================================

-- Admin policies for tours
DROP POLICY IF EXISTS "Admin full access to tours" ON tours;
CREATE POLICY "Admin full access to tours"
  ON tours FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for vehicles
DROP POLICY IF EXISTS "Admin full access to vehicles" ON vehicles;
CREATE POLICY "Admin full access to vehicles"
  ON vehicles FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for tour_enquiries
DROP POLICY IF EXISTS "Admin full access to tour_enquiries" ON tour_enquiries;
CREATE POLICY "Admin full access to tour_enquiries"
  ON tour_enquiries FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for travel_enquiries
DROP POLICY IF EXISTS "Admin full access to travel_enquiries" ON travel_enquiries;
CREATE POLICY "Admin full access to travel_enquiries"
  ON travel_enquiries FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for destinations
DROP POLICY IF EXISTS "Admin full access to destinations" ON destinations;
CREATE POLICY "Admin full access to destinations"
  ON destinations FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for gallery
DROP POLICY IF EXISTS "Admin full access to gallery" ON gallery;
CREATE POLICY "Admin full access to gallery"
  ON gallery FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for testimonials
DROP POLICY IF EXISTS "Admin full access to testimonials" ON testimonials;
CREATE POLICY "Admin full access to testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'authenticated');

-- Admin policies for website_settings
DROP POLICY IF EXISTS "Admin full access to settings" ON website_settings;
CREATE POLICY "Admin full access to settings"
  ON website_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- 12. STORAGE BUCKETS (Run in SQL or create in Dashboard)
-- =============================================
-- NOTE: Storage buckets are best created via the Supabase Dashboard:
--   1. Go to Storage in your Supabase Dashboard
--   2. Create buckets named: 'tours', 'vehicles', 'gallery'
--   3. Set them as Public buckets for public read access
--   4. Add a policy: Allow authenticated users to upload/delete

-- If you prefer SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('tours', 'tours', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicles', 'vehicles', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;

-- Storage policies for public read
DROP POLICY IF EXISTS "Public read tours storage" ON storage.objects;
CREATE POLICY "Public read tours storage" ON storage.objects FOR SELECT USING (bucket_id = 'tours');
DROP POLICY IF EXISTS "Public read vehicles storage" ON storage.objects;
CREATE POLICY "Public read vehicles storage" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');
DROP POLICY IF EXISTS "Public read gallery storage" ON storage.objects;
CREATE POLICY "Public read gallery storage" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

-- Storage policies for authenticated upload/delete
DROP POLICY IF EXISTS "Auth upload tours storage" ON storage.objects;
CREATE POLICY "Auth upload tours storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tours' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth delete tours storage" ON storage.objects;
CREATE POLICY "Auth delete tours storage" ON storage.objects FOR DELETE USING (bucket_id = 'tours' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth upload vehicles storage" ON storage.objects;
CREATE POLICY "Auth upload vehicles storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicles' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth delete vehicles storage" ON storage.objects;
CREATE POLICY "Auth delete vehicles storage" ON storage.objects FOR DELETE USING (bucket_id = 'vehicles' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth upload gallery storage" ON storage.objects;
CREATE POLICY "Auth upload gallery storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth delete gallery storage" ON storage.objects;
CREATE POLICY "Auth delete gallery storage" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- =============================================
-- 13. AUTO-UPDATE updated_at TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON website_settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON website_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 14. CREATE INDEXES FOR FASTER QUERIES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_tour_enquiries_created_at ON tour_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_enquiries_created_at ON travel_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_enquiries_status ON tour_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_travel_enquiries_status ON travel_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_website_settings_created_at ON website_settings(created_at DESC);

-- =============================================
-- SEED DATA (Optional - uncomment to insert sample tours)
-- =============================================
-- INSERT INTO tours (slug, name, start_location, places_count, duration_days, duration_nights, price, rating, reviews_count, image_url, overview, itinerary, included, excluded, things_to_carry, gallery, reviews)
-- VALUES (...);
