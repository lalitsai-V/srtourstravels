"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, MapPin, Clock, MessageSquare, Check, Loader2, AlertCircle, HeadphonesIcon, Clock4, ShieldCheck, Users, Send, ArrowRight, Shield, Car, UserCheck, PhoneCall } from "lucide-react"
import Image from "next/image"
import { z } from "zod"
import { submitEnquiry, getSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/db"
import emailjs from "@emailjs/browser"

// Form validation schema using Zod
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  email: z.string().email({ message: "Invalid email address" }).or(z.literal("")),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters long" }),
  message: z.string().min(5, { message: "Message must be at least 5 characters long" })
})

type ContactFormData = z.infer<typeof contactFormSchema>

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    // Form data object
    const formData: ContactFormData = { name, email, phone, subject, message }

    // Validate using Zod
    const result = contactFormSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {}
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Submit Enquiry to database
      await submitEnquiry({
        type: "tour", // general enquiry logged under tour bookings
        name,
        email,
        phone,
        details: { subject, message },
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
          from_email: email || "no-email@provided.com",
          from_phone: phone,
          enquiry_type: "Contact Us Form",
          subject: subject,
          message_details: message
        })
      } else {
        console.log("EmailJS keys missing; simulated email sending.")
      }

      setSuccess(true)
      setIsSubmitting(false)
      
      // Reset form fields
      setName("")
      setEmail("")
      setPhone("")
      setSubject("")
      setMessage("")

      // Clear success alert after 5 seconds
      setTimeout(() => setSuccess(false), 5000)

    } catch (err) {
      console.error("Failed to submit contact enquiry:", err)
      setIsSubmitting(false)
      alert("Submission failed. Please check your connections and try again.")
    }
  }

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsapp_number.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  return (
    <div className="w-full bg-slate-50 font-sans pb-0">
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/contact.png"
            alt="Contact Us"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[30px] md:h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#f8fafc" d="M0,160 C240,320 480,320 720,160 C960,0 1200,0 1440,160 L1440,320 L0,320 Z"></path>
          </svg>
        </div>
      </section>

      {/* 2. SPLIT FORM & CONTACT DETAILS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
          <div className="w-12 h-1 bg-[#0047b3] rounded-full mb-4"></div>
          <p className="text-sm text-slate-500 mb-8">Fill in the details below and we will get back to you shortly.</p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm">
              <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Thank you for contacting us!</h4>
                <p className="mt-1">Your message has been successfully sent. We will get back to you shortly.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm font-medium text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-2 text-[13px]">Your Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-colors placeholder:text-slate-400 ${
                    errors.name ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 text-[13px]">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-colors placeholder:text-slate-400 ${
                    errors.phone ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2 text-[13px]">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-colors placeholder:text-slate-400 ${
                  errors.email ? "border-red-400" : "border-slate-200"
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2 text-[13px]">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help you?"
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-colors placeholder:text-slate-400 ${
                  errors.subject ? "border-red-400" : "border-slate-200"
                }`}
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2 text-[13px]">Message <span className="text-red-500">*</span></label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-colors placeholder:text-slate-400 resize-none ${
                  errors.message ? "border-red-400" : "border-slate-200"
                }`}
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#003899] hover:bg-[#002f80] text-white font-semibold py-3.5 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-70 text-[15px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>Send Message</span>
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500 bg-slate-50 py-3 rounded-lg border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Your information is safe with us. We never share your details.</span>
            </div>
          </form>
        </div>

        {/* Right Side: Contact Details */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Get In Touch</h2>
          <div className="w-12 h-1 bg-[#0047b3] rounded-full mb-4"></div>
          <p className="text-sm text-slate-500 mb-8">We are always happy to assist you with your travel needs.</p>

          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#0047b3] text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <Phone className="w-5 h-5 fill-current" />
              </div>
              <div className="pt-1">
                <h4 className="font-bold text-slate-900 text-[15px] mb-1">Phone</h4>
                {settings.whatsapp_number ? (
                  <p className="text-[15px] text-slate-600 mb-0.5"><a href={`tel:${settings.whatsapp_number}`} className="hover:text-[#0047b3] transition-colors">{settings.whatsapp_number}</a></p>
                ) : (
                  <p className="text-[15px] text-slate-600 mb-0.5 italic text-slate-400">Not available</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#0047b3] text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <Mail className="w-5 h-5" />
              </div>
              <div className="pt-1">
                <h4 className="font-bold text-slate-900 text-[15px] mb-1">Email</h4>
                {settings.email_address ? (
                  <p className="text-[15px] text-slate-600 mb-0.5"><a href={`mailto:${settings.email_address}`} className="hover:text-[#0047b3] transition-colors">{settings.email_address}</a></p>
                ) : (
                  <p className="text-[15px] text-slate-600 mb-0.5 italic text-slate-400">Not available</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#0047b3] text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="pt-1">
                <h4 className="font-bold text-slate-900 text-[15px] mb-1">Address</h4>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  Kamaraj Nagar, Avadi,<br />
                  Chennai,<br />
                  Tamil Nadu, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#0047b3] text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <Clock className="w-5 h-5" />
              </div>
              <div className="pt-1">
                <h4 className="font-bold text-slate-900 text-[15px] mb-1">Working Hours</h4>
                <p className="text-[15px] text-slate-600 mb-0.5">Monday - Sunday</p>
                <p className="text-[15px] text-slate-600">6:00 AM - 10:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-5 mt-2">
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="pt-1">
                <h4 className="font-bold text-slate-900 text-[15px] mb-1">WhatsApp</h4>
                <p className="text-[14px] text-slate-600 mb-4 max-w-[250px]">
                  Chat with us for quick assistance on WhatsApp.
                </p>
                <button 
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 border border-[#0047b3] text-[#0047b3] font-semibold px-6 py-2.5 rounded-full hover:bg-[#0047b3] hover:text-white transition-all text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAP AREA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="relative w-full h-[400px] bg-gray-200 rounded-3xl overflow-hidden shadow-md border border-slate-200">
          <iframe
            src="https://maps.google.com/maps?q=Kamaraj%20Nagar,%20Avadi,%20Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
          
          {/* Map Overlay Card */}
          <div className="absolute top-8 left-8 bg-white p-8 rounded-2xl shadow-xl z-10 w-[320px] hidden md:block">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Our Office Location</h3>
            <div className="w-10 h-1 bg-[#0047b3] mb-4"></div>
            <p className="text-sm text-slate-600 mb-6">
              Visit our office for personalized assistance and travel planning.
            </p>
            
            <div className="flex items-start gap-3 mb-8">
              <MapPin className="w-5 h-5 text-[#0047b3] shrink-0 mt-0.5" />
              <p className="text-sm text-slate-800 font-medium">
                Kamaraj Nagar, Avadi,<br />
                Chennai,<br />
                Tamil Nadu, India
              </p>
            </div>
            
            <a 
              href="https://maps.app.goo.gl/AJyzcy1Tz6jtgHDPA" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#003899] hover:bg-[#002f80] text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ArrowRight className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* 4. TRUST BADGES */}
      <section className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0047b3] rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Best Price Guarantee</h4>
              <p className="text-xs text-slate-500 mt-1">Get the best deals for your trips</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0047b3] rounded-full flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Comfortable Vehicles</h4>
              <p className="text-xs text-slate-500 mt-1">Well maintained & safe vehicles for all tours</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0047b3] rounded-full flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Experienced Drivers</h4>
              <p className="text-xs text-slate-500 mt-1">Professional & friendly drivers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0047b3] rounded-full flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">24/7 Customer Support</h4>
              <p className="text-xs text-slate-500 mt-1">We're here to help you anytime, anywhere</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
