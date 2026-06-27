"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, Check, Loader2, Calendar, Users } from "lucide-react"
import { Tour, submitEnquiry, getSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/db"
import emailjs from "@emailjs/browser"

interface TourBookingFormProps {
  tour: Tour
}

export default function TourBookingForm({ tour }: TourBookingFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [date, setDate] = useState("")
  const [travelers, setTravelers] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const enquiryDetails = {
      tour_id: tour.id,
      tour_name: tour.name,
      date,
      travelers,
      message: `Tour Booking Enquiry for ${tour.name}`
    }

    try {
      // 1. Submit Enquiry to Database / LocalStorage
      await submitEnquiry({
        type: "tour",
        name,
        email,
        phone,
        details: enquiryDetails,
        status: "pending"
      })

      // 2. EmailJS Send
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
          enquiry_type: "Tour Package Booking",
          subject: `New Tour Booking - ${tour.name}`,
          message_details: `
            Tour Package: ${tour.name}
            Travel Date: ${date}
            Number of Travelers: ${travelers}
          `
        })
      } else {
        console.log("EmailJS keys missing; simulated email sending.")
      }

      setSuccess(true)
      setIsSubmitting(false)

      // 3. Open WhatsApp link
      setTimeout(() => {
        const waText = `Hello SR Tours & Travels,

Tour Booking Enquiry

Tour: ${tour.name}
Starting From: ${tour.start_location}
Travel Date: ${date}
No. of Travelers: ${travelers}

Name: ${name}
Phone: ${phone}

Please contact me to confirm the booking.`

        const encodedText = encodeURIComponent(waText)
        const cleanPhone = settings.whatsapp_number.replace(/\D/g, "")
        window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank")
        
        // Reset states
        setSuccess(false)
        setName("")
        setEmail("")
        setPhone("")
        setDate("")
        setTravelers(1)
      }, 1500)

    } catch (err) {
      console.error("Failed to submit tour enquiry:", err)
      setIsSubmitting(false)
      alert("Submission failed. Please check your connections and try again.")
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md font-sans">
      <div className="flex justify-between items-baseline mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Package Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-600">₹{tour.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-gray-400">/ Person</span>
          </div>
        </div>
        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">
          {tour.duration_days} Days / {tour.duration_nights} Nights
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 my-4"></div>

      {success ? (
        <div className="text-center py-6 flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h4 className="font-bold text-gray-800 text-sm">Enquiry Received!</h4>
          <p className="text-xs text-gray-400">Opening WhatsApp to send booking details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs text-slate-700">
          <div>
            <label className="block font-bold text-slate-500 mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-500 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Travel Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-500 mb-1">No. of Travelers *</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  required
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-2 text-xs focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Book via WhatsApp & Email</span>
                <span>&rarr;</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            By clicking Book, we will record your enquiry and open WhatsApp to send your booking format.
          </p>
        </form>
      )}
    </div>
  )
}
