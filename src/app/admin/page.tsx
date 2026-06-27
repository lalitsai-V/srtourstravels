"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Compass,
  Car,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import { getTours, getVehicles, getEnquiries, Tour, Vehicle, Enquiry } from "@/lib/db"

export default function AdminDashboard() {
  const [tours, setTours] = useState<Tour[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const t = await getTours()
        const v = await getVehicles()
        const e = await getEnquiries()
        setTours(t || [])
        setVehicles(v || [])
        setEnquiries(e || [])
      } catch (err) {
        console.error("Dashboard load failed:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm font-semibold text-slate-500">Loading Dashboard stats...</span>
      </div>
    )
  }

  // Calculate stats
  const totalEnquiries = enquiries.length
  const pendingEnquiries = enquiries.filter(e => e.status === "pending").length
  const completedEnquiries = enquiries.filter(e => e.status === "completed").length
  const activeTours = tours.length
  const activeVehicles = vehicles.length

  // Mock data for weekly chart values (percentage heights)
  const chartData = [
    { day: "Mon", count: 4 },
    { day: "Tue", count: 7 },
    { day: "Wed", count: 5 },
    { day: "Thu", count: 9 },
    { day: "Fri", count: 12 },
    { day: "Sat", count: 18 },
    { day: "Sun", count: 14 }
  ]

  const maxCount = Math.max(...chartData.map(d => d.count))

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500">Welcome to your SR Tours & Travels admin management portal.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active Session</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Enquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Enquiries</span>
            <span className="text-2xl font-black text-slate-800 mt-1">{totalEnquiries}</span>
            <span className="text-[10px] text-blue-500 font-bold mt-1">{pendingEnquiries} Pending response</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tour Packages */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tours Offered</span>
            <span className="text-2xl font-black text-slate-800 mt-1">{activeTours}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">Managed destination packages</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Vehicles Fleet */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Vehicles</span>
            <span className="text-2xl font-black text-slate-800 mt-1">{activeVehicles}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">Managed transit units</span>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Completion rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Enq.</span>
            <span className="text-2xl font-black text-slate-800 mt-1">{completedEnquiries}</span>
            <span className="text-[10px] text-green-600 font-bold mt-1">
              {totalEnquiries > 0 ? ((completedEnquiries / totalEnquiries) * 100).toFixed(0) : 0}% Conversion
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Chart & Popular Tours Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly trends chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-800">Weekly Enquiry Trends</h3>
            <p className="text-[10px] text-slate-400">Activity monitor for enquiries submitted past week.</p>
          </div>

          {/* Graphical custom SVG Bar representation */}
          <div className="h-48 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-100">
            {chartData.map((d, i) => {
              const heightPct = `${(d.count / maxCount) * 80}%`
              return (
                <div key={i} className="flex flex-col items-center gap-2 grow">
                  <span className="text-[10px] font-bold text-blue-600">{d.count}</span>
                  <div
                    style={{ height: heightPct }}
                    className="w-8 bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all duration-300 shadow-sm shadow-blue-200"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Popular tours quick list */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Managed Tours</h3>
              <p className="text-[10px] text-slate-400">Overview of existing routes.</p>
            </div>
            <Link href="/admin/tours" className="text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-4 grow justify-center">
            {tours.slice(0, 3).map((tour) => (
              <div key={tour.id} className="flex items-center gap-3 text-xs">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <img src={tour.image_url || undefined} alt="" className="object-cover w-full h-full" />
                </div>
                <div className="grow">
                  <h4 className="font-bold text-slate-800 truncate">{tour.name}</h4>
                  <span className="text-[10px] text-slate-400">{tour.duration_days} Days &bull; ₹{tour.price}</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{tour.rating} ★</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Enquiries Table list */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Recent Customer Enquiries</h3>
            <p className="text-[10px] text-slate-400">Incoming WhatsApp and Email requests log.</p>
          </div>
          <Link href="/admin/enquiries" className="text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-0.5">
            <span>Open Enquiries Manager</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No customer enquiries submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans font-medium text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-extrabold bg-slate-50/50">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Booking Type</th>
                  <th className="py-3 px-4">Selected Detail</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enquiries.slice(0, 5).map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/30">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{enq.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span>{enq.phone}</span>
                        {enq.email && <span className="text-[10px] text-gray-400">{enq.email}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        enq.type === "tour" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-green-50 text-green-700 border border-green-100"
                      }`}>
                        {enq.type === "tour" ? "Tour Package" : "Vehicle Cab"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate">
                      {enq.type === "tour" ? enq.details.tour_name : `${enq.details.vehicle} (${enq.details.pickup} &rarr; ${enq.details.destination})`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                        enq.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : enq.status === "contacted"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-green-50 text-green-700 border border-green-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          enq.status === "pending" ? "bg-amber-500 animate-pulse" : enq.status === "contacted" ? "bg-blue-500" : "bg-green-500"
                        }`}></span>
                        <span className="capitalize">{enq.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
