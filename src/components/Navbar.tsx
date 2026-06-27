"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Mail, Menu, X, ChevronDown, MessageSquare, Compass, Car, Users, Info, PhoneCall } from "lucide-react"
import { getSettings, getTours, AppSettings, DEFAULT_SETTINGS, Tour } from "@/lib/db"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [toursDropdownOpen, setToursDropdownOpen] = useState(false)
  const [travelsDropdownOpen, setTravelsDropdownOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [tours, setTours] = useState<Tour[]>([])

  const pathname = usePathname()
  const isAdminPath = pathname.startsWith("/admin")

  useEffect(() => {
    getSettings().then(setSettings)
    getTours().then(setTours)
  }, [])

  // Close menus on path change
  useEffect(() => {
    setIsOpen(false)
    setToursDropdownOpen(false)
    setTravelsDropdownOpen(false)
  }, [pathname])

  if (isAdminPath) return null

  const isActive = (path: string) => pathname === path

  return (
    <header className="w-full bg-white shadow-sm font-sans z-50 sticky top-0">
      {/* Top bar */}
      <div className="w-full bg-[#f8fafc] border-b border-gray-100 py-2 px-4 md:px-8 text-xs text-gray-600 hidden sm:flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Explore Tamil Nadu with SR Tours & Travels</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-blue-600">24/7 Customer Support:</span>
            <a href={`tel:${settings.whatsapp_number}`} className="hover:text-blue-600 transition-colors font-medium">
              {settings.whatsapp_number}
            </a>
          </div>
          <div className="h-3 w-px bg-gray-200"></div>
          <div className="flex items-center gap-3 text-gray-500">
            <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.512 1.977 14.053.953 11.5.953c-5.442 0-9.87 4.372-9.874 9.8.001 2.036.541 4.021 1.562 5.751L2.13 21.82l5.517-1.443z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logosr.png" 
            alt="SR Tours & Travels Logo" 
            className="w-12 h-12 object-contain transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 tracking-tight text-base md:text-lg leading-tight uppercase">
              Tours & Travels
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide">
              Travel More, Worry Less
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-700">
          <Link href="/" className={`hover:text-blue-600 transition-colors ${isActive("/") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : ""}`}>
            Home
          </Link>

          {/* Tours Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setToursDropdownOpen(!toursDropdownOpen)
                setTravelsDropdownOpen(false)
              }}
              onMouseEnter={() => setToursDropdownOpen(true)}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none ${pathname.startsWith("/tours") ? "text-blue-600" : ""}`}
            >
              Tours <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toursDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {toursDropdownOpen && (
              <div
                onMouseLeave={() => setToursDropdownOpen(false)}
                className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <Link href="/#popular-packages" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <Compass className="w-4 h-4 text-blue-500" /> Popular Packages
                </Link>
                {tours.length > 0 ? (
                  tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 block text-xs pl-8"
                    >
                      {tour.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-xs pl-8">
                    No tours available yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Travels Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setTravelsDropdownOpen(!travelsDropdownOpen)
                setToursDropdownOpen(false)
              }}
              onMouseEnter={() => setTravelsDropdownOpen(true)}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none ${pathname === "/travels" ? "text-blue-600" : ""}`}
            >
              Travels <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${travelsDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {travelsDropdownOpen && (
              <div
                onMouseLeave={() => setTravelsDropdownOpen(false)}
                className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <Link href="/travels" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <Car className="w-4 h-4 text-blue-500" /> Book Vehicle Taxi
                </Link>
                <Link href="/#vehicle-fleet" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <Users className="w-4 h-4 text-blue-500" /> Our Fleet Details
                </Link>
              </div>
            )}
          </div>

          <Link href="/#destinations" className="hover:text-blue-600 transition-colors">
            Destinations
          </Link>
          <Link href="/about" className={`hover:text-blue-600 transition-colors ${isActive("/about") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : ""}`}>
            About Us
          </Link>
          <Link href="/contact" className={`hover:text-blue-600 transition-colors ${isActive("/contact") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : ""}`}>
            Contact Us
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center">
          <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            Enquire Now
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden w-full bg-white border-t border-gray-100 py-4 px-6 absolute left-0 shadow-lg z-50 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-gray-800">
            <Link href="/" onClick={() => setIsOpen(false)} className={`py-1 ${isActive("/") ? "text-blue-600" : ""}`}>
              Home
            </Link>

            <div className="border-t border-gray-50 pt-2">
              <span className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1 block">Tours Packages</span>
              <div className="flex flex-col gap-2.5 pl-3 mt-2">
                <Link href="/#popular-packages" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-blue-600 text-xs">
                  All Popular Packages
                </Link>
                <Link href="/tours/ooty-hill-station-tour" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-blue-600 text-xs">
                  Ooty Hill Station Tour
                </Link>
                <Link href="/tours/kodaikanal-getaway" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-blue-600 text-xs">
                  Kodaikanal Getaway
                </Link>
                <Link href="/tours/kanyakumari-tour" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-blue-600 text-xs">
                  Kanyakumari Tour
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-2">
              <span className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1 block">Vehicle Rentals</span>
              <div className="flex flex-col gap-2.5 pl-3 mt-2">
                <Link href="/travels" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-blue-600 text-xs">
                  Book Rental Taxi
                </Link>
                <Link href="/#vehicle-fleet" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-blue-600 text-xs">
                  Our Fleet Details
                </Link>
              </div>
            </div>

            <Link href="/about" onClick={() => setIsOpen(false)} className={`border-t border-gray-50 pt-2 ${isActive("/about") ? "text-blue-600" : ""}`}>
              About Us
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className={`border-t border-gray-50 pt-2 pb-2 ${isActive("/contact") ? "text-blue-600" : ""}`}>
              Contact Us
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold text-sm py-3 rounded-lg shadow-md mt-2 block"
            >
              Enquire Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
