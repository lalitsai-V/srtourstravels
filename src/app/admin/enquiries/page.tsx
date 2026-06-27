"use client"

import { useState, useEffect } from "react"
import { MessageSquare, RefreshCw, Phone, Mail, Clock, CheckCircle2, Navigation, ClipboardList } from "lucide-react"
import { getEnquiries, updateEnquiryStatus, Enquiry } from "@/lib/db"

export default function AdminEnquiriesModule() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "tour" | "travel">("all")

  useEffect(() => {
    loadEnquiries()
  }, [])

  async function loadEnquiries() {
    setLoading(true)
    const data = await getEnquiries()
    setEnquiries(data || [])
    setLoading(false)
  }

  const handleStatusChange = async (id: string, newStatus: "pending" | "contacted" | "completed") => {
    try {
      await updateEnquiryStatus(id, newStatus)
      // Update local state without full reload for smoother UX
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      )
    } catch (e) {
      console.error(e)
      alert("Failed to update status.")
    }
  }

  // Filter enquiries
  const filteredEnquiries = enquiries.filter((enq) => {
    if (filterType === "all") return true
    return enq.type === filterType
  })

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Enquiries Log</h1>
          <p className="text-xs text-slate-500">Track and respond to incoming customer WhatsApp and email requests.</p>
        </div>
        <button
          onClick={loadEnquiries}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Tabs / Filters Bar */}
      <div className="flex gap-2.5 border-b border-slate-200 pb-1">
        {[
          { label: "All Enquiries", value: "all" },
          { label: "Tour Bookings", value: "tour" },
          { label: "Travel Rentals", value: "travel" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value as any)}
            className={`pb-3 text-xs font-bold tracking-wide transition-all border-b-2 px-1 focus:outline-none ${
              filterType === tab.value
                ? "border-blue-600 text-blue-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">
          Loading enquiries...
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-xs text-slate-400 shadow-sm flex flex-col items-center gap-3">
          <ClipboardList className="w-10 h-10 text-slate-300" />
          <span>No customer enquiries matching this filter yet.</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans font-medium text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-extrabold bg-slate-50/50">
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Enquiry Type</th>
                  <th className="py-4 px-6">Requested Travel Info</th>
                  <th className="py-4 px-6">Date Logged</th>
                  <th className="py-4 px-6">Response Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/30 align-top">
                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5 font-sans">
                        <span className="font-bold text-slate-800 text-sm">{enq.name}</span>
                        <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-semibold">
                          <a href={`tel:${enq.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{enq.phone}</span>
                          </a>
                          {enq.email && (
                            <a href={`mailto:${enq.email}`} className="flex items-center gap-1 hover:text-blue-600">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{enq.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Booking Type */}
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        enq.type === "tour"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}>
                        {enq.type === "tour" ? "Tour Package" : "Vehicle Cab"}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-4 px-6 max-w-sm">
                      {enq.type === "tour" ? (
                        <div className="flex flex-col gap-1 text-slate-700">
                          <span className="font-bold text-slate-800">{enq.details.tour_name}</span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-500 font-semibold mt-1">
                            <span>Date: <span className="font-bold">{enq.details.date || "N/A"}</span></span>
                            <span>Travelers: <span className="font-bold">{enq.details.travelers || 1}</span></span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 text-slate-700">
                          <span className="font-bold text-slate-800">{enq.details.vehicle} Booking</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-1">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">{enq.details.pickup}</span>
                            <span>&rarr;</span>
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{enq.details.destination}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-500 font-semibold mt-1.5">
                            <span>Date: <span className="font-bold">{enq.details.date || "N/A"}</span></span>
                            <span>Distance: <span className="font-bold text-blue-600">{enq.details.distance} km</span></span>
                          </div>
                        </div>
                      )}
                      {enq.details.message && (
                        <div className="mt-2 text-[10px] text-slate-400 font-normal leading-relaxed italic border-t border-slate-50 pt-1">
                          "{enq.details.message}"
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-400 font-bold text-[10px]">
                      {new Date(enq.created_at).toLocaleString("en-IN")}
                    </td>

                    {/* Status Update Trigger */}
                    <td className="py-4 px-6">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value as any)}
                        className={`text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none border border-slate-200 cursor-pointer ${
                          enq.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : enq.status === "contacted"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-green-50 text-green-700 border-green-100"
                        }`}
                      >
                        <option value="pending" className="bg-white text-amber-700 font-semibold">Pending</option>
                        <option value="contacted" className="bg-white text-blue-700 font-semibold">Contacted</option>
                        <option value="completed" className="bg-white text-green-700 font-semibold">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
