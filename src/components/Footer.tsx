"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Phone, Mail, MapPin, Send } from "lucide-react"
import { getSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/db"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <footer className="w-full bg-[#030712] text-gray-300 pt-16 font-sans">
      {/* Newsletter signup banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900/50 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">Subscribe to our Newsletter</h3>
              <p className="text-sm text-gray-400 mt-0.5">Get exclusive travel deals and updates straight to your inbox.</p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md grow gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 grow"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
        {/* Info Column */}
        <div className="lg:col-span-1.5">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="/logosr.png" 
              alt="SR Tours & Travels Logo" 
              className="w-12 h-12 object-contain bg-white rounded-md p-1" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-tight text-sm uppercase leading-tight">
                Tours & Travels
              </span>
              <span className="text-[9px] text-gray-400 tracking-wide">
                Travel More, Worry Less
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-6 max-w-sm">
            Your trusted travel partner for unforgettable journeys across Tamil Nadu and beyond. Explore hills, beaches, and temples with premium comfort.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-900 hover:bg-blue-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-900 hover:bg-pink-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-900 hover:bg-green-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.512 1.977 14.053.953 11.5.953c-5.442 0-9.87 4.372-9.874 9.8.001 2.036.541 4.021 1.562 5.751L2.13 21.82l5.517-1.443z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2.5 after:h-0.5 after:w-8 after:bg-blue-600">
            Quick Links
          </h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Home</Link>
            </li>
            <li>
              <Link href="/#popular-packages" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Tours</Link>
            </li>
            <li>
              <Link href="/travels" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Travels</Link>
            </li>
            <li>
              <Link href="/#destinations" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Destinations</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Top Destinations */}
       

        {/* Support Links */}
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2.5 after:h-0.5 after:w-8 after:bg-blue-600">
            Support
          </h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li>
              <Link href="/contact" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">FAQ's</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-500 hover:translate-x-1 transition-all inline-block">Cancellation Policy</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2.5 after:h-0.5 after:w-8 after:bg-blue-600">
            Contact Us
          </h4>
          <ul className="space-y-4 text-xs text-gray-400">
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <a href={`tel:${settings.whatsapp_number}`} className="hover:text-blue-400">
                {settings.whatsapp_number}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <a href={`mailto:${settings.email_address}`} className="hover:text-blue-400">
                {settings.email_address}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Kamaraj Nagar, Avadi,<br />
                Chennai, Tamil Nadu
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="w-full border-t border-gray-900 py-6 text-center text-[11px] text-gray-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <span>&copy; {new Date().getFullYear()} SR Tours & Travels. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  )
}
