"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Compass,
  Car,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  Search,
  Award,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  CheckCircle2,
  Wind,
  Phone
} from "lucide-react"
import { getTours, getVehicles, Tour, Vehicle } from "@/lib/db"
import TourCard from "@/components/TourCard"
import VehicleCard from "@/components/VehicleCard"

export default function Home() {
  const router = useRouter()

  // State
  const [tours, setTours] = useState<Tour[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTab, setSearchTab] = useState<"tours" | "travels">("tours")
  const [loading, setLoading] = useState(true)

  // Search Form State (Tours)
  const [tourDestination, setTourDestination] = useState("")
  const [tourDuration, setTourDuration] = useState("")
  const [tourBudget, setTourBudget] = useState("")
  const [tourDate, setTourDate] = useState("")

  // Search Form State (Travels)
  const [travelFrom, setTravelFrom] = useState("")
  const [travelTo, setTravelTo] = useState("")
  const [travelDate, setTravelDate] = useState("")


  useEffect(() => {
    async function fetchData() {
      try {
        const toursData = await getTours()
        const vehiclesData = await getVehicles()
        setTours(toursData || [])
        setVehicles(vehiclesData || [])
      } catch (e) {
        console.error("Error loading home page data:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleTourSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Scroll to tours section and filter
    const element = document.getElementById("popular-packages")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleTravelSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to travels page with query parameters
    router.push(`/travels?from=${encodeURIComponent(travelFrom)}&to=${encodeURIComponent(travelTo)}&date=${encodeURIComponent(travelDate)}`)
  }


  return (
    <div className="w-full bg-slate-50 font-sans pb-10">
      {/* 1. HERO SECTION WITH INTEGRATED SEARCH WIDGET */}
      <section className="relative w-full min-h-[580px] lg:h-[650px] bg-slate-900 overflow-hidden flex items-center py-16 lg:py-0">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/car_img.png"
            alt="SR Tours & Travels Car"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 flex flex-col text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight select-none">
              Your Journey <br />
              <span className="text-blue-400 italic font-serif font-normal" style={{ fontFamily: "Brush Script MT, cursive" }}>
                Our Responsibility
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mt-6 max-w-lg leading-relaxed">
              Discover amazing tour packages across Tamil Nadu with safe & comfortable travel services. We specialize in hassle-free vacations.
            </p>

            {/* Quick benefits */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {[
                { label: "Best Price Guarantee", desc: "Best value" },
                { label: "Safe & Reliable", desc: "Verified drivers" },
                { label: "Comfortable Vehicles", desc: "AC fleet" },
                { label: "24/7 Support", desc: "Always online" }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                    {item.label.split(" ")[0]}
                  </span>
                  <span className="text-[11px] font-semibold mt-1 text-white truncate">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Search Widget */}
          <div className="lg:col-span-6 w-full max-w-xl justify-self-center lg:justify-self-end">
            <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-800 border border-slate-100 flex flex-col">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSearchTab("tours")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${searchTab === "tours" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Tours</span>
                </button>
                <button
                  onClick={() => setSearchTab("travels")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${searchTab === "travels" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Travels</span>
                </button>
              </div>

              {/* Form Content */}
              {searchTab === "tours" ? (
                <form onSubmit={handleTourSearch} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Where do you want to go?</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <select
                          value={tourDestination}
                          onChange={(e) => setTourDestination(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 appearance-none focus:outline-none focus:border-blue-600"
                        >
                          <option value="">Search destinations</option>
                          {tours.map(tour => (
                            <option key={tour.id} value={tour.slug}>{tour.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Duration</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <select
                          value={tourDuration}
                          onChange={(e) => setTourDuration(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 appearance-none focus:outline-none focus:border-blue-600"
                        >
                          <option value="">Select duration</option>
                          <option value="2">2 Days / 1 Night</option>
                          <option value="3">3 Days / 2 Nights</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Budget</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                        <select
                          value={tourBudget}
                          onChange={(e) => setTourBudget(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 appearance-none focus:outline-none focus:border-blue-600"
                        >
                          <option value="">Select budget</option>
                          <option value="5000">Under ₹5,000</option>
                          <option value="7000">Under ₹7,000</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Travel Date</label>
                      <input
                        type="date"
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 text-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Tours</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleTravelSearch} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">From Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={travelFrom}
                          onChange={(e) => setTravelFrom(e.target.value)}
                          placeholder="Pickup location"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 font-bold">Destination *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-500" />
                        <input
                          type="text"
                          required
                          value={travelTo}
                          onChange={(e) => setTravelTo(e.target.value)}
                          placeholder="Drop location"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold">Travel Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 text-xs"
                  >
                    <Car className="w-4 h-4" />
                    <span>Find Cabs / Rental Cabs</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[30px] md:h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#f8fafc" d="M0,160 C240,320 480,320 720,160 C960,0 1200,0 1440,160 L1440,320 L0,320 Z"></path>
          </svg>
        </div>
      </section>

      {/* 2. CHOOSE YOUR SERVICE (WHAT ARE YOU LOOKING FOR?) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Choose Your Service</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">What are you looking for?</h2>
          <div className="w-12 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tours Block */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-12">
            <div className="sm:col-span-5 relative min-h-[200px]">
              <Image
                src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
                alt="Temple Architecture"
                fill
                className="object-cover"
              />
            </div>
            <div className="sm:col-span-7 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Tours</h3>
                    <p className="text-[11px] text-gray-400">Handpicked tour packages</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Relaxing and guided vacations. Includes local stays, sightseeing, and premium transportation.
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-600 mb-6">
                  {["Domestic Tours", "Family Tours", "International Tours", "Adventure Tours", "Honeymoon Packages", "Pilgrimage Tours"].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a href="#popular-packages" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group">
                <span>Explore Tours</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Travels Block */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-12">
            <div className="sm:col-span-7 p-6 flex flex-col justify-between order-2 sm:order-1">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Travels</h3>
                    <p className="text-[11px] text-gray-400">Comfortable & reliable transit</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Need a clean vehicle for an outbound family journey? Pick from our versatile fleet matching your group size.
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-600 mb-6">
                  {["Taxi (1-4 Seats)", "12 Seater Traveller", "SUV (5-7 Seats)", "14 Seater Traveller", "9 Seater Traveller", "16 Seater Traveller"].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/travels" className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group">
                <span>Book Travel</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="sm:col-span-5 relative min-h-[200px] order-1 sm:order-2">
              <Image
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
                alt="Traveller Van"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR TOUR PACKAGES IN TAMIL NADU */}
      <section id="popular-packages" className="w-full bg-[#f8fafc] border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Top Packages</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Popular Tour Packages in Tamil Nadu</h2>
            </div>
            <a href="#popular-packages" className="border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-transparent text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
              <span>View All Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 h-96"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.slice(0, 6).map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. TRAVEL IN COMFORT (OUR VEHICLES) */}
      <section id="vehicle-fleet" className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-sans">Our Vehicles</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">Travel in Comfort</h2>
          </div>
          <Link href="/travels" className="border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-transparent text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            <span>View All Vehicles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 h-72"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* 5. TRUST BADGES / FEATURES */}
      <section className="w-full bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            {
              title: "Best Price Guarantee",
              desc: "Get the best rates for your trips",
              icon: <Award className="w-7 h-7 text-blue-400" />
            },
            {
              title: "Safe & Secure",
              desc: "Well maintained vehicles and experienced drivers",
              icon: <ShieldCheck className="w-7 h-7 text-green-400" />
            },
            {
              title: "Handpicked Packages",
              desc: "Carefully curated for best experience",
              icon: <Compass className="w-7 h-7 text-purple-400" />
            },
            {
              title: "Easy Booking",
              desc: "Simple, fast & hassle free booking",
              icon: <Check className="w-7 h-7 text-cyan-400" />
            },
            {
              title: "24/7 Support",
              desc: "We are here to help you anytime",
              icon: <Phone className="w-7 h-7 text-pink-400" />
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center px-2">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-white mb-2">{item.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[160px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


    </div>
  )
}
