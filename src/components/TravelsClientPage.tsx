"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Calendar, Search, Loader2, ChevronLeft, ChevronRight, Users, Briefcase, ShieldCheck, UserCheck, DollarSign, Phone as PhoneIcon, Mail, Clock, ArrowRightLeft, Car } from "lucide-react"
import { getVehicles, getSettings, Vehicle, AppSettings, DEFAULT_SETTINGS } from "@/lib/db"

// Inline component that cycles through vehicle images every 1 second
function VehicleImageSlider({ vehicle }: { vehicle: Vehicle }) {
  const allImages = [vehicle.image_url, ...(vehicle.gallery || [])].filter(Boolean)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (allImages.length <= 1) return
    const timer = setInterval(() => setIdx(prev => (prev + 1) % allImages.length), 1000)
    return () => clearInterval(timer)
  }, [allImages.length])

  if (allImages.length === 0) {
    return (
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
        <Car className="w-10 h-10" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img src={allImages[idx]} alt={vehicle.name} className="max-h-full max-w-full object-contain transition-opacity duration-500" />
      {allImages.length > 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
          {allImages.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "bg-blue-600 w-3" : "bg-slate-300 w-1"}`} />
          ))}
        </div>
      )}
    </div>
  )
}

interface TravelsClientPageProps {
  initialFrom?: string
  initialTo?: string
  initialDate?: string
}

export default function TravelsClientPage({
  initialFrom = "",
  initialTo = "",
  initialDate = ""
}: TravelsClientPageProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [fromAddress, setFromAddress] = useState(initialFrom)
  const [toAddress, setToAddress] = useState(initialTo)
  const [travelDate, setTravelDate] = useState(initialDate)
  const [tripType, setTripType] = useState("one-way")

  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{
    from: string
    to: string
    distance: string
    duration: string
    routeSteps: string[]
  } | null>(null)

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Leaflet references
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const routeLayerRef = useRef<any>(null)
  const markersGroupRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Vehicle carousel
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getVehicles().then(setVehicles)
    getSettings().then(setSettings)
  }, [])

  // Dynamically load Leaflet CDN
  useEffect(() => {
    if (typeof window === "undefined") return
    if ((window as any).L) {
      setLeafletLoaded(true)
      return
    }
    const cssLink = document.createElement("link")
    cssLink.rel = "stylesheet"
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(cssLink)

    const jsScript = document.createElement("script")
    jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    jsScript.async = true
    jsScript.onload = () => setLeafletLoaded(true)
    document.body.appendChild(jsScript)

    return () => {
      try {
        document.head.removeChild(cssLink)
        document.body.removeChild(jsScript)
      } catch (e) { /* ignore */ }
    }
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return
    const L = (window as any).L
    if (!L) return
    if (mapRef.current) mapRef.current.remove()

    const defaultCoords: [number, number] = [10.7905, 78.7047] // Tamil Nadu center
    const map = L.map(mapContainerRef.current).setView(defaultCoords, 7)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)

    markersGroupRef.current = L.featureGroup().addTo(map)
    routeLayerRef.current = L.featureGroup().addTo(map)

    if (initialFrom && initialTo) {
      setTimeout(() => handleSearch(null), 500)
    }

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded])

  const geocode = async (address: string): Promise<[number, number] | null> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`)
      const data = await res.json()
      if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    } catch (e) { console.error("Geocoding failed:", e) }
    return null
  }

  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`)
      const data = await res.json()
      if (data?.routes?.[0]) {
        const route = data.routes[0]
        const steps = route.legs?.[0]?.steps?.filter((s: any) => s.name).map((s: any) => s.name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).slice(0, 6) || []
        return {
          geometry: route.geometry,
          distance: (route.distance / 1000).toFixed(0),
          duration: route.duration,
          routeSteps: steps
        }
      }
    } catch (e) { console.error("Routing failed:", e) }
    return null
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours === 0) return `${minutes} min`
    return `${hours} h ${minutes} min`
  }

  const handleSearch = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault()
    if (!fromAddress || !toAddress) return
    setLoading(true)
    const L = (window as any).L

    try {
      const startCoords = await geocode(fromAddress)
      const endCoords = await geocode(toAddress)

      if (startCoords && endCoords) {
        const routeData = await getRoute(startCoords, endCoords)
        if (routeData) {
          setRouteInfo({
            from: fromAddress,
            to: toAddress,
            distance: routeData.distance,
            duration: formatDuration(routeData.duration),
            routeSteps: routeData.routeSteps
          })

          if (mapRef.current && L) {
            markersGroupRef.current.clearLayers()
            routeLayerRef.current.clearLayers()

            // Custom icons
            const greenIcon = L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#16a34a;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [14, 14], iconAnchor: [7, 7] })
            const redIcon = L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [14, 14], iconAnchor: [7, 7] })

            const startMarker = L.marker(startCoords, { icon: greenIcon }).bindPopup(`<b>${fromAddress}</b>`)
            const endMarker = L.marker(endCoords, { icon: redIcon }).bindPopup(`<b>${toAddress}</b>`)
            markersGroupRef.current.addLayer(startMarker)
            markersGroupRef.current.addLayer(endMarker)

            const geojsonLayer = L.geoJSON(routeData.geometry, {
              style: { color: "#1d4ed8", weight: 4, opacity: 0.9 }
            })
            routeLayerRef.current.addLayer(geojsonLayer)
            const group = L.featureGroup([markersGroupRef.current, routeLayerRef.current])
            mapRef.current.fitBounds(group.getBounds().pad(0.15))
          }
        } else {
          // fallback
          const dist = calculateDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]).toFixed(0)
          setRouteInfo({ from: fromAddress, to: toAddress, distance: dist, duration: `${(parseFloat(dist) / 50).toFixed(0)} h`, routeSteps: [] })
          if (mapRef.current && L) {
            markersGroupRef.current.clearLayers()
            routeLayerRef.current.clearLayers()
            markersGroupRef.current.addLayer(L.marker(startCoords))
            markersGroupRef.current.addLayer(L.marker(endCoords))
            routeLayerRef.current.addLayer(L.polyline([startCoords, endCoords], { color: "#1d4ed8", weight: 3, dashArray: "8, 8" }))
            mapRef.current.fitBounds(L.featureGroup([markersGroupRef.current, routeLayerRef.current]).getBounds().pad(0.15))
          }
        }
      } else {
        alert("Could not find one of the locations. Please enter a valid city/town name.")
      }
    } catch (err) { console.error(err); alert("Search failed. Check your internet connection.") }
    finally { setLoading(false); setSearched(true) }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const swapLocations = () => {
    const temp = fromAddress
    setFromAddress(toAddress)
    setToAddress(temp)
  }

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 280
      carouselRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
    }
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    const waText = `Hello SR Tours & Travels,

Travel Enquiry

From:
${fromAddress}

To:
${toAddress}

Distance:
${routeInfo?.distance || "N/A"} km

Vehicle:
${vehicle.name}

Travel Date:
${travelDate}

Please contact me.`
    const cleanPhone = settings.whatsapp_number.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, "_blank")
  }

  const handleWhatsAppEnquiry = () => {
    const waText = `Hello SR Tours & Travels,

I would like to enquire about vehicle rental.

From: ${fromAddress || "Not specified"}
To: ${toAddress || "Not specified"}
Date: ${travelDate || "Not specified"}
Distance: ${routeInfo?.distance || "N/A"} km

Please contact me with available vehicles and pricing.`
    const cleanPhone = settings.whatsapp_number.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, "_blank")
  }

  const handleEmailEnquiry = () => {
    const subject = encodeURIComponent(`Travel Enquiry - ${fromAddress} to ${toAddress}`)
    const body = encodeURIComponent(`Hello SR Tours & Travels,\n\nI would like to enquire about vehicle rental.\n\nFrom: ${fromAddress}\nTo: ${toAddress}\nDate: ${travelDate}\nDistance: ${routeInfo?.distance || "N/A"} km\n\nPlease contact me.\n\nThank you.`)
    window.open(`mailto:${settings.email_address}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="w-full bg-white font-sans">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT SIDE */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Title */}
            <div className="mb-6">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">Travel With Comfort</span>
              <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-900 mt-1.5 leading-tight tracking-tight">
                Choose Your Vehicle & Travel
              </h1>
              <div className="w-10 h-1 bg-blue-600 rounded-full mt-3"></div>
              <p className="text-[13px] text-slate-500 mt-3 leading-relaxed max-w-md">
                Select your pickup and destination to see distance, estimated time and the best vehicle options for your comfortable journey.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={(e) => handleSearch(e)} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
              {/* From / To Row */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">From (Pickup Location)</label>
                  <div className="relative">
                    <input
                      type="text" required value={fromAddress} onChange={(e) => setFromAddress(e.target.value)}
                      placeholder="Enter pickup city"
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-3.5 pr-9 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400"
                    />
                    <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button type="button" onClick={swapLocations} className="mb-0.5 w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors shrink-0">
                  <ArrowRightLeft className="w-4 h-4" />
                </button>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">To (Destination)</label>
                  <div className="relative">
                    <input
                      type="text" required value={toAddress} onChange={(e) => setToAddress(e.target.value)}
                      placeholder="Enter destination city"
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-3.5 pr-9 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-400"
                    />
                    <MapPin className="absolute right-3 top-3 w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Date & Trip Type Row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Travel Date</label>
                  <div className="relative">
                    <input
                      type="date" required value={travelDate} onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trip Type</label>
                  <select
                    value={tripType} onChange={(e) => setTripType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2212%22%20height%3d%2212%22%20viewBox%3d%220%200%2012%2012%22%3e%3cpath%20fill%3d%22%2364748b%22%20d%3d%22M2%204l4%204%204-4%22%2f%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_12px_center]"
                  >
                    <option value="one-way">One Way</option>
                    <option value="round-trip">Round Trip</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Searching Route...</span></> : <><Search className="w-4 h-4" /><span>Search Vehicles</span></>}
              </button>
            </form>

            {/* Route Info Card */}
            {routeInfo && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                {/* From / To display */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{routeInfo.from}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pickup Location</p>
                    </div>
                  </div>
                  <div className="ml-1.5 border-l-2 border-dashed border-slate-200 h-3"></div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{routeInfo.to}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Destination</p>
                    </div>
                  </div>
                </div>

                {/* Distance and Time */}
                <div className="flex items-center gap-8 py-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance</p>
                    <p className="text-2xl font-black text-blue-600 leading-tight">{routeInfo.distance} <span className="text-sm font-bold">KM</span></p>
                  </div>
                  <div className="h-10 w-px bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Time</p>
                      <p className="text-lg font-extrabold text-slate-800">{routeInfo.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Route Steps */}
                {routeInfo.routeSteps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-blue-600">Route:</span>
                    {routeInfo.routeSteps.map((step, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        {i > 0 && <span className="text-slate-300">→</span>}
                        {step}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDE - Map & Booking CTA */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Map */}
            <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative min-h-[400px] lg:min-h-[500px] shadow-sm">
              {!leafletLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-500 gap-3 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">Loading Map...</span>
                </div>
              )}
              <div ref={mapContainerRef} className="w-full h-full min-h-[400px] lg:min-h-[500px] z-0" />
            </div>

            {/* Booking CTA */}
            {searched && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Ready to Book Your Ride?</h3>
                <p className="text-xs text-slate-500 mb-5">Get instant confirmation by sending an enquiry.</p>

                <button onClick={handleWhatsAppEnquiry}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mb-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.512 1.977 14.053.953 11.5.953c-5.442 0-9.87 4.372-9.874 9.8.001 2.036.541 4.021 1.562 5.751L2.13 21.82l5.517-1.443z"/></svg>
                  <span>Enquire on WhatsApp</span>
                </button>

                <button onClick={handleEmailEnquiry}
                  className="w-full bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-800 hover:text-blue-600 font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>Send Enquiry (Email)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Selection (Full Width) */}
        {searched && (
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6">Choose Your Vehicle</h2>

            {/* Carousel */}
            <div className="relative">
              <button onClick={() => scrollCarousel("left")} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scrollCarousel("right")} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>

              <div ref={carouselRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pt-2 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {vehicles.map((vehicle) => {
                  const estCost = routeInfo ? (parseFloat(routeInfo.distance) * vehicle.price_per_km) : 0
                  return (
                    <div key={vehicle.id} className="min-w-[260px] max-w-[260px] snap-start bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                      {/* Vehicle Image with 1-second cycling */}
                      <div className="w-full h-32 flex items-center justify-center mb-4">
                        <VehicleImageSlider vehicle={vehicle} />
                      </div>

                      <h3 className="text-base font-bold text-slate-800 text-center mb-3">{vehicle.name}</h3>

                      {/* Info badges */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold mb-4">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {vehicle.seat_count} Seats</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {Math.max(2, Math.floor(vehicle.seat_count / 2))} Bags</span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-blue-600">₹{vehicle.price_per_km}</span>
                          <span className="text-xs text-slate-400 font-semibold">/ km</span>
                        </div>
                        {routeInfo && (
                          <span className="text-xs text-slate-500 font-medium mt-1">Est. Total: ₹{estCost.toLocaleString("en-IN")}</span>
                        )}
                      </div>

                      <button onClick={() => handleSelectVehicle(vehicle)}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm py-2.5 rounded-xl transition-all text-center shadow-md">
                        Select Vehicle
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="w-full border-t border-slate-200 bg-slate-50 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, title: "Well Maintained Vehicles", desc: "Clean, safe & comfortable" },
            { icon: <UserCheck className="w-6 h-6 text-blue-600" />, title: "Professional Drivers", desc: "Experienced & verified" },
            { icon: <DollarSign className="w-6 h-6 text-blue-600" />, title: "Transparent Pricing", desc: "No hidden charges" },
            { icon: <PhoneIcon className="w-6 h-6 text-blue-600" />, title: "24/7 Support", desc: "We're always here to help" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
