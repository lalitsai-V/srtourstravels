"use client"

import { getTourBySlug } from "@/lib/db"
import { Tour } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useState, use } from "react"
import {
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  ShieldCheck,
  Award,
  Phone,
  MessageSquare,
  Mail,
  ChevronRight,
  Info,
  Map,
  ListChecks,
  Image as ImageIcon
} from "lucide-react"

export default function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTour() {
      try {
        const data = await getTourBySlug(resolvedParams.slug)
        setTour(data)
      } catch (e) {
        console.error("Error loading tour:", e)
      } finally {
        setLoading(false)
      }
    }
    loadTour()
  }, [resolvedParams.slug])

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tour) {
    notFound()
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[400px] md:h-[500px]">
        <div className="absolute inset-0 z-0">
          <Image
            src={tour.image_url || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=80"}
            alt={tour.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>
        </div>

        <div className="absolute inset-0 z-10 flex flex-col justify-end max-w-7xl mx-auto px-4 md:px-8 pb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-xs font-semibold mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/#popular-packages" className="hover:text-white transition-colors">Tours</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{tour.name}</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">{tour.name}</h1>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-white/90 text-sm md:text-base font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>{tour.duration_days} Days / {tour.duration_nights} Nights</span>
            </div>
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-green-400" />
              <span>{tour.places_count} Places</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              <span>{tour.start_location} Departure</span>
            </div>
          </div>


        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm overflow-x-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 min-w-max">
          {[
            { id: "overview", label: "Overview", icon: Info },
            { id: "itinerary", label: "Itinerary", icon: Calendar },
            { id: "inclusions", label: "Inclusions", icon: ListChecks },
            { id: "exclusions", label: "Exclusions", icon: XCircle },
            { id: "gallery", label: "Gallery", icon: ImageIcon }
          ].map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="px-6 py-4 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b-2 border-transparent hover:border-blue-600"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">About This Package</h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
              {tour.overview}
            </p>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Award, label: "Best Price Guarantee", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
                { icon: Car, label: "Comfortable Vehicles", color: "text-green-500", bg: "bg-green-50", border: "border-green-100" },
                { icon: ShieldCheck, label: "Experienced Drivers", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
                { icon: Phone, label: "24/7 Customer Support", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-full ${feature.bg} ${feature.color} flex items-center justify-center mb-3 border ${feature.border}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 leading-tight">{feature.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Places You'll Visit */}
          {tour.gallery && tour.gallery.length > 0 && (
            <section className="scroll-mt-24">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Places You'll Visit</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {tour.gallery.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative h-24 md:h-32 rounded-xl overflow-hidden border border-slate-200">
                    <Image src={img} alt={`Place ${idx + 1}`} fill className="object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
                {tour.gallery.length > 4 && (
                  <a href="#gallery" className="relative h-24 md:h-32 rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center text-white hover:bg-blue-600 transition-colors group cursor-pointer border border-slate-800">
                    <Image src={tour.gallery[4]} alt="More" fill className="object-cover opacity-40 group-hover:opacity-20 transition-opacity" />
                    <span className="relative z-10 text-2xl font-extrabold">+{tour.gallery.length - 4}</span>
                    <span className="relative z-10 text-[11px] font-bold mt-1">More Places</span>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Itinerary */}
          {tour.itinerary && tour.itinerary.length > 0 && (
            <section id="itinerary" className="scroll-mt-24">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Itinerary</h2>
              <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-[1.375rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {tour.itinerary.map((item, idx) => (
                  <div key={idx} className="relative flex items-start group">
                    
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl border-4 border-white bg-blue-600 text-white shadow shrink-0 z-10 mt-1">
                      <span className="text-xs font-bold">Day {item.day}</span>
                    </div>

                    {/* Content */}
                    <div className="w-[calc(100%-4rem)] bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all group-hover:border-blue-100 ml-4">
                      <h3 className="font-extrabold text-slate-800 text-lg mb-3">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inclusions & Exclusions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="inclusions" className="scroll-mt-24 bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                Inclusions
              </h3>
              <ul className="flex flex-col gap-4">
                {tour.included && tour.included.length > 0 ? (
                  tour.included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-400 italic">No inclusions listed</li>
                )}
              </ul>
            </div>
            
            <div id="exclusions" className="scroll-mt-24 bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                Exclusions
              </h3>
              <ul className="flex flex-col gap-4">
                {tour.excluded && tour.excluded.length > 0 ? (
                  tour.excluded.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-400 italic">No exclusions listed</li>
                )}
              </ul>
            </div>
          </section>

          {/* Things to Carry */}
          {tour.things_to_carry && tour.things_to_carry.length > 0 && (
            <section className="bg-blue-50/50 border border-blue-100 p-6 md:p-8 rounded-3xl">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Things to Carry
              </h3>
              <div className="flex flex-wrap gap-2">
                {tour.things_to_carry.map((item, i) => (
                  <span key={i} className="bg-white text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {tour.gallery && tour.gallery.length > 0 && (
            <section id="gallery" className="scroll-mt-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900">Gallery</h2>
                <button className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                  View All Photos <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tour.gallery.map((img, idx) => (
                  <div key={idx} className="relative h-40 md:h-48 rounded-2xl overflow-hidden shadow-sm group">
                    <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN (STICKY SIDEBAR) */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-28 flex flex-col gap-6">
            
            {/* Pricing Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Package Price</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-extrabold text-blue-600">₹{tour.price.toLocaleString("en-IN")}</span>
                <span className="text-xs text-slate-500 font-bold mb-1.5">/ Person</span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-slate-400 line-through font-semibold">₹{(tour.price + 3000).toLocaleString("en-IN")}</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">Save ₹3,000</span>
              </div>
              
              <div className="h-px w-full bg-slate-100 mb-6"></div>
              
              <ul className="flex flex-col gap-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {tour.duration_days} Days / {tour.duration_nights} Nights
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <Map className="w-4 h-4 text-blue-500" />
                  {tour.places_count} Places to Visit
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {tour.start_location} Departure
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Customizable Package
                </li>
              </ul>
              
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/919876543210?text=Hi, I am interested in the ${tour.name} package.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0052FF] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Enquire on WhatsApp</span>
                </a>
                
                <Link
                  href={`/contact?tour=${tour.slug}`}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>Send Enquiry (Email)</span>
                </Link>
              </div>
            </div>

            {/* Package Highlights */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
              <h3 className="font-extrabold text-slate-900 text-lg mb-6">Package Highlights</h3>
              <ul className="flex flex-col gap-4">
                {[
                  "Scenic Route Views",
                  "Comfortable AC Vehicle",
                  "Well Planned Itinerary",
                  "Carefully Selected Hotels",
                  "Best for Family & Couples"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Star className="w-3 h-3 text-blue-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 text-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">Need Help?</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Our travel experts are here to help you plan the perfect trip.
                </p>
                <div className="flex flex-col gap-4 w-full">
                  <a href="tel:+919876543210" className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Call Us</p>
                      <p className="text-sm font-extrabold text-slate-700">+91 98765 43210</p>
                    </div>
                  </a>
                  <a href="mailto:info@srtours.com" className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                      <p className="text-sm font-extrabold text-slate-700">info@srtours.com</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
