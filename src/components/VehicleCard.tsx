"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Users, Wind, MapPin, Calendar, Phone, Mail, X, Check, Loader2 } from "lucide-react"
import { Vehicle, submitEnquiry, getSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/db"
import emailjs from "@emailjs/browser"

interface VehicleCardProps {
  vehicle: Vehicle
  defaultPickup?: string
  defaultDestination?: string
  defaultDistance?: string
}

export default function VehicleCard({ vehicle, defaultPickup = "", defaultDestination = "", defaultDistance = "" }: VehicleCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [date, setDate] = useState("")
  const [pickup, setPickup] = useState(defaultPickup)
  const [destination, setDestination] = useState(defaultDestination)
  const [distance, setDistance] = useState(defaultDistance)
  
  // Image cycling
  const allImages = [vehicle.image_url, ...(vehicle.gallery || [])].filter(Boolean)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  // Cycle images every 1 second if multiple images
  useEffect(() => {
    if (allImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIdx(prev => (prev + 1) % allImages.length)
    }, 1000)
    return () => clearInterval(interval)
  }, [allImages.length])

  // Sync prop changes
  useEffect(() => {
    setPickup(defaultPickup)
    setDestination(defaultDestination)
    setDistance(defaultDistance)
  }, [defaultPickup, defaultDestination, defaultDistance])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const tourEnquiryDetails = {
      pickup,
      destination,
      date,
      vehicle: vehicle.name,
      distance: distance || "Not calculated",
      message: `Travel Booking Enquiry for ${vehicle.name}`
    }

    try {
      // 1. Submit to Database / LocalStorage
      await submitEnquiry({
        type: "travel",
        name,
        email,
        phone,
        details: tourEnquiryDetails,
        status: "pending"
      })

      // 2. EmailJS Send (if configured)
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      if (serviceId && templateId && publicKey) {
        emailjs.init(publicKey)
        await emailjs.send(serviceId, templateId, {
          to_name: "SR Tours & Travels",
          from_name: name,
          from_email: email,
          from_phone: phone,
          enquiry_type: "Vehicle Travel Rental",
          subject: `New Travel Enquiry - ${vehicle.name}`,
          message_details: `
            Vehicle: ${vehicle.name}
            Pickup: ${pickup}
            Destination: ${destination}
            Travel Date: ${date}
            Distance: ${distance || "N/A"}
          `
        })
      } else {
        console.log("EmailJS keys missing; simulated email sending.")
      }

      setSuccess(true)
      setIsSubmitting(false)

      // 3. Open WhatsApp after 1.5 seconds
      setTimeout(() => {
        const waText = `Hello SR Tours & Travels,

Travel Enquiry

From:
${pickup}

To:
${destination}

Distance:
${distance || "N/A"}

Vehicle:
${vehicle.name}

Travel Date:
${date}

Please contact me.`

        const encodedText = encodeURIComponent(waText)
        const cleanPhone = settings.whatsapp_number.replace(/\D/g, "")
        window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank")
        
        // Reset state & close modal
        setShowModal(false)
        setSuccess(false)
        setName("")
        setEmail("")
        setPhone("")
        setDate("")
      }, 1500)

    } catch (err) {
      console.error("Enquiry submission failed:", err)
      setIsSubmitting(false)
      alert("Something went wrong. Please check details and try again.")
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full font-sans group">
      {/* Vehicle image with auto-cycling */}
      <div className="relative w-full h-36 mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIdx]}
              alt={vehicle.name}
              className="w-full h-full object-contain p-2 transition-opacity duration-500"
            />
            {/* Image dots indicator */}
            {allImages.length > 1 && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentImageIdx ? "bg-blue-600 w-3" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300 text-xs font-semibold">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-col grow">
        <h3 className="font-bold text-gray-800 text-base mb-0.5">{vehicle.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{vehicle.type}</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-4 grow">{vehicle.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2.5 mb-5 border-t border-gray-50 pt-3 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-1 bg-blue-50/50 text-blue-700 px-2 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{vehicle.seat_count} Seats</span>
          </div>
          {vehicle.ac && (
            <div className="flex items-center gap-1 bg-green-50/50 text-green-700 px-2 py-1 rounded-lg">
              <Wind className="w-3.5 h-3.5 text-green-500" />
              <span>AC</span>
            </div>
          )}
          <div className="ml-auto flex items-baseline gap-0.5 text-blue-600 font-bold text-sm">
            <span>₹{vehicle.price_per_km}</span>
            <span className="text-[10px] text-gray-400 font-normal">/ km</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
        >
          <span>Book Now</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base tracking-tight">Vehicle Booking Enquiry</h3>
                <p className="text-xs text-blue-100 mt-0.5">{vehicle.name} ({vehicle.type})</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors hover:bg-white/10 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            {success ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-gray-800 text-base">Enquiry Submitted!</h4>
                <p className="text-xs text-gray-500">Redirecting to WhatsApp to send booking details...</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="p-6 flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Travel Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Address *</label>
                    <input
                      type="text"
                      required
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="e.g. Ooty"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Address *</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Madurai"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                {distance && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-center justify-between">
                    <span className="font-medium">Estimated Distance:</span>
                    <span className="font-extrabold">{distance} km</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit & Open WhatsApp</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
