"use client"

import { useState, useEffect } from "react"
import { Settings as SettingsIcon, Check, Loader2, AlertCircle } from "lucide-react"
import { getSettings, saveSettings, AppSettings } from "@/lib/db"
import { z } from "zod"

// Zod validation schema for Settings Form
const settingsSchema = z.object({
  whatsapp_number: z.string().min(10, { message: "WhatsApp number must be at least 10 characters" }),
  email_address: z.string().email({ message: "Invalid contact email address" }),
  facebook_link: z.string().url({ message: "Facebook must be a valid URL" }).or(z.literal("#")).or(z.literal("")),
  instagram_link: z.string().url({ message: "Instagram must be a valid URL" }).or(z.literal("#")).or(z.literal(""))
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function AdminSettingsModule() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [facebookLink, setFacebookLink] = useState("")
  const [instagramLink, setInstagramLink] = useState("")

  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsFormData, string>>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    const data = await getSettings()
    setWhatsappNumber(data.whatsapp_number)
    setEmailAddress(data.email_address)
    setFacebookLink(data.facebook_link || "")
    setInstagramLink(data.instagram_link || "")
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSaving(true)
    setSuccess(false)

    const formValues: SettingsFormData = {
      whatsapp_number: whatsappNumber,
      email_address: emailAddress,
      facebook_link: facebookLink,
      instagram_link: instagramLink
    }

    const result = settingsSchema.safeParse(formValues)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SettingsFormData, string>> = {}
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof SettingsFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      setIsSaving(false)
      return
    }

    try {
      await saveSettings({
        whatsapp_number: whatsappNumber,
        email_address: emailAddress,
        facebook_link: facebookLink,
        instagram_link: instagramLink
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error(err)
      alert("Failed to save site settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Top Header Banner */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans">Settings</h1>
          <p className="text-xs text-slate-500">Configure global contacts, WhatsApp booking numbers, and social media handles.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400 font-medium">
          Loading site configuration...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm max-w-xl">
          <h3 className="text-sm font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            <span>App Configuration defaults</span>
          </h3>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 flex items-center gap-2 text-xs font-semibold">
              <Check className="w-4 h-4 text-green-600 stroke-[3]" />
              <span>Configurations saved successfully! Changes are now active.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold text-slate-700">
            {/* WhatsApp */}
            <div>
              <label className="block text-slate-500 mb-1">WhatsApp Booking Contact Number *</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +919876543210"
                className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors ${
                  errors.whatsapp_number ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.whatsapp_number ? (
                <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.whatsapp_number}</span>
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 font-normal mt-1 leading-normal">
                  Phone format with country code (e.g., +919876543210). Booking details will route directly to this contact.
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-slate-500 mb-1">Contact Email Address *</label>
              <input
                type="email"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="info@srtours.in"
                className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors ${
                  errors.email_address ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.email_address && (
                <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email_address}</span>
                </p>
              )}
            </div>

            {/* Facebook Link */}
            <div>
              <label className="block text-slate-500 mb-1">Facebook Profile Link</label>
              <input
                type="text"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
                placeholder="https://facebook.com/..."
                className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors ${
                  errors.facebook_link ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.facebook_link && (
                <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.facebook_link}</span>
                </p>
              )}
            </div>

            {/* Instagram Link */}
            <div>
              <label className="block text-slate-500 mb-1">Instagram Profile Link</label>
              <input
                type="text"
                value={instagramLink}
                onChange={(e) => setInstagramLink(e.target.value)}
                placeholder="https://instagram.com/..."
                className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors ${
                  errors.instagram_link ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.instagram_link && (
                <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.instagram_link}</span>
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Configs</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
