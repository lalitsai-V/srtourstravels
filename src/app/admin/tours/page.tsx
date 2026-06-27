"use client"

import { useState, useEffect, useRef } from "react"
import { Compass, Plus, Edit2, Trash2, X, Check, Loader2, AlertCircle, Upload } from "lucide-react"
import { getTours, saveTour, deleteTour, Tour, uploadImage } from "@/lib/db"
import { z } from "zod"

// Zod validation schema for Tour form
const tourSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  start_location: z.string().min(2, { message: "Start location is required" }),
  places_count: z.number().min(1, { message: "Must include at least 1 place" }),
  duration_days: z.number().min(1, { message: "Duration days must be >= 1" }),
  duration_nights: z.number().min(0, { message: "Duration nights must be >= 0" }),
  price: z.number().min(1, { message: "Price must be greater than 0" }),
  rating: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }),
  reviews_count: z.number().min(0),
  image_url: z.string().min(1, { message: "Image is required" }),
  overview: z.string().min(10, { message: "Overview must be at least 10 characters" })
})

type TourFormData = z.infer<typeof tourSchema>

export default function AdminToursModule() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [startLocation, setStartLocation] = useState("")
  const [placesCount, setPlacesCount] = useState(1)
  const [durationDays, setDurationDays] = useState(1)
  const [durationNights, setDurationNights] = useState(0)
  const [price, setPrice] = useState(0)
  const [rating, setRating] = useState(5.0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [imageUrl, setImageUrl] = useState("")
  const [overview, setOverview] = useState("")
  
  // Dynamic arrays state
  const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([])
  const [included, setIncluded] = useState<string[]>([])
  const [excluded, setExcluded] = useState<string[]>([])
  const [thingsToCarry, setThingsToCarry] = useState<string[]>([])
  const [gallery, setGallery] = useState<string[]>([])

  const [errors, setErrors] = useState<Partial<Record<keyof TourFormData, string>>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isGalleryUploading, setIsGalleryUploading] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTours()
  }, [])

  async function loadTours() {
    setLoading(true)
    const data = await getTours()
    setTours(data || [])
    setLoading(false)
  }

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val)
    if (!editingTour) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      )
    }
  }

  const openCreateForm = () => {
    setEditingTour(null)
    setName("")
    setSlug("")
    setStartLocation("")
    setPlacesCount(1)
    setDurationDays(1)
    setDurationNights(0)
    setPrice(0)
    setRating(5.0)
    setReviewsCount(0)
    setImageUrl("")
    setOverview("")
    setItinerary([{ day: 1, title: "", description: "" }])
    setIncluded([""])
    setExcluded([""])
    setThingsToCarry([""])
    setGallery([""])
    setErrors({})
    setImagePreview(null)
    setShowForm(true)
  }

  const openEditForm = (tour: Tour) => {
    setEditingTour(tour)
    setName(tour.name)
    setSlug(tour.slug)
    setStartLocation(tour.start_location)
    setPlacesCount(tour.places_count)
    setDurationDays(tour.duration_days)
    setDurationNights(tour.duration_nights)
    setPrice(tour.price)
    setRating(tour.rating)
    setReviewsCount(tour.reviews_count)
    setImageUrl(tour.image_url)
    setOverview(tour.overview)
    setItinerary(tour.itinerary?.length ? tour.itinerary : [{ day: 1, title: "", description: "" }])
    setIncluded(tour.included?.length ? tour.included : [""])
    setExcluded(tour.excluded?.length ? tour.excluded : [""])
    setThingsToCarry(tour.things_to_carry?.length ? tour.things_to_carry : [""])
    setGallery(tour.gallery?.length ? tour.gallery : [""])
    setErrors({})
    setImagePreview(tour.image_url || null)
    setShowForm(true)
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image_url: "Please select a valid image file" }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image_url: "Image must be less than 5MB" }))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    setErrors((prev) => { const { image_url, ...rest } = prev; return rest })
    try {
      const url = await uploadImage(file, "tours")
      setImageUrl(url)
      setImagePreview(url)
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, image_url: err.message || "Upload failed" }))
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  const handleGalleryUpload = async (files: FileList | File[]) => {
    setIsGalleryUploading(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith("image/")) continue
        if (file.size > 5 * 1024 * 1024) continue
        const url = await uploadImage(file, "tours_gallery")
        newUrls.push(url)
      }
      setGallery(prev => [...prev.filter(u => u.trim() !== ""), ...newUrls])
    } catch (err: any) {
      console.error("Gallery upload failed:", err)
      alert("Gallery upload failed: " + err.message)
    } finally {
      setIsGalleryUploading(false)
    }
  }

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length > 0) {
      handleGalleryUpload(e.dataTransfer.files)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSaving(true)

    const formValues: TourFormData = {
      name,
      slug,
      start_location: startLocation,
      places_count: placesCount,
      duration_days: durationDays,
      duration_nights: durationNights,
      price,
      rating,
      reviews_count: reviewsCount,
      image_url: imageUrl,
      overview
    }

    const result = tourSchema.safeParse(formValues)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TourFormData, string>> = {}
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof TourFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      setIsSaving(false)
      return
    }

    const newTour: Tour = {
      id: editingTour?.id || crypto.randomUUID(),
      name,
      slug,
      start_location: startLocation,
      places_count: placesCount,
      duration_days: durationDays,
      duration_nights: durationNights,
      price,
      rating,
      reviews_count: reviewsCount,
      image_url: imageUrl,
      overview,
      // Use dynamic arrays, filtering out completely empty ones
      itinerary: itinerary.filter(item => item.title.trim() || item.description.trim()),
      included: included.filter(item => item.trim() !== ""),
      excluded: excluded.filter(item => item.trim() !== ""),
      things_to_carry: thingsToCarry.filter(item => item.trim() !== ""),
      gallery: gallery.filter(item => item.trim() !== ""),
      reviews: editingTour?.reviews || []
    }

    try {
      await saveTour(newTour)
      setShowForm(false)
      loadTours()
      alert("added suffecfulluy in the database")
    } catch (err) {
      console.error(err)
      alert("Save failed. Ensure slug is unique.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tour package?")) {
      await deleteTour(id)
      loadTours()
    }
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Top Banner Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tours Management</h1>
          <p className="text-xs text-slate-500">Configure catalog of packages available on the website.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tour Package</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">
          Loading tours...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans font-medium text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-extrabold bg-slate-50/50">
                  <th className="py-3.5 px-6">Image</th>
                  <th className="py-3.5 px-6">Package Name</th>
                  <th className="py-3.5 px-6">Start From</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50/30">
                    <td className="py-3.5 px-6">
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                        <img src={tour.image_url || undefined} alt="" className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{tour.name}</td>
                    <td className="py-3.5 px-6">{tour.start_location}</td>
                    <td className="py-3.5 px-6">{tour.duration_days}D / {tour.duration_nights}N</td>
                    <td className="py-3.5 px-6 font-bold text-blue-600">₹{tour.price}</td>
                    <td className="py-3.5 px-6">{tour.rating} ★ ({tour.reviews_count})</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditForm(tour)}
                          className="p-1.5 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tour.id)}
                          className="p-1.5 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg border border-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Drawer / Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden animate-in scale-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base tracking-tight">
                  {editingTour ? "Edit Tour Package" : "Create Tour Package"}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">Define package properties below.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/80 hover:text-white transition-colors hover:bg-white/10 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[500px] flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Slug URL (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.slug && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.slug}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Starting Location *</label>
                  <input
                    type="text"
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.start_location && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.start_location}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Places Visited Count *</label>
                  <input
                    type="number"
                    required
                    value={placesCount}
                    onChange={(e) => setPlacesCount(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.places_count && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.places_count}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.price && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Duration Days *</label>
                  <input
                    type="number"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.duration_days && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.duration_days}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Duration Nights *</label>
                  <input
                    type="number"
                    required
                    value={durationNights}
                    onChange={(e) => setDurationNights(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.duration_nights && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.duration_nights}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Rating (1.0 - 5.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.rating && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.rating}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Reviews Count</label>
                  <input
                    type="number"
                    required
                    value={reviewsCount}
                    onChange={(e) => setReviewsCount(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Tour Image *</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center hover:border-blue-400 hover:bg-blue-50/30 ${
                    imagePreview ? "border-green-300 bg-green-50/20" : "border-gray-200 bg-slate-50/50"
                  } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="text-[11px] text-blue-600 font-bold">Uploading to cloud...</span>
                    </div>
                  ) : imagePreview ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> Image uploaded</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{imageUrl}</p>
                        <p className="text-[10px] text-blue-500 mt-1">Click or drag to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-600">Click to upload or drag and drop</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.image_url && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.image_url}</p>}
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Overview text *</label>
                <textarea
                  rows={4}
                  required
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 transition-colors font-medium text-xs text-slate-600"
                />
                {errors.overview && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.overview}</p>}
              </div>

              {/* Dynamic Array Inputs */}
              
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                <label className="block text-slate-700 font-bold mb-1">Itinerary</label>
                {itinerary.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-white p-3 border border-slate-200 rounded-xl">
                    <div className="w-16">
                      <label className="block text-[10px] text-slate-500 mb-1">Day</label>
                      <input
                        type="number"
                        value={item.day}
                        onChange={(e) => {
                          const newIt = [...itinerary]
                          newIt[idx].day = parseInt(e.target.value) || 0
                          setItinerary(newIt)
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const newIt = [...itinerary]
                          newIt[idx].title = e.target.value
                          setItinerary(newIt)
                        }}
                        placeholder="Day Title"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:border-blue-600"
                      />
                      <label className="block text-[10px] text-slate-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => {
                          const newIt = [...itinerary]
                          newIt[idx].description = e.target.value
                          setItinerary(newIt)
                        }}
                        placeholder="Day description..."
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))}
                      className="mt-5 p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "" }])}
                  className="text-[11px] font-bold text-blue-600 self-start hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Itinerary Day
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                  <label className="block text-slate-700 font-bold mb-1">Inclusions</label>
                  {included.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newArr = [...included]
                          newArr[idx] = e.target.value
                          setIncluded(newArr)
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600"
                      />
                      <button type="button" onClick={() => setIncluded(included.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setIncluded([...included, ""])} className="text-[11px] font-bold text-blue-600 self-start hover:underline">+ Add Inclusion</button>
                </div>
                
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                  <label className="block text-slate-700 font-bold mb-1">Exclusions</label>
                  {excluded.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newArr = [...excluded]
                          newArr[idx] = e.target.value
                          setExcluded(newArr)
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600"
                      />
                      <button type="button" onClick={() => setExcluded(excluded.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setExcluded([...excluded, ""])} className="text-[11px] font-bold text-blue-600 self-start hover:underline">+ Add Exclusion</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                  <label className="block text-slate-700 font-bold mb-1">Things to Carry</label>
                  {thingsToCarry.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newArr = [...thingsToCarry]
                          newArr[idx] = e.target.value
                          setThingsToCarry(newArr)
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600"
                      />
                      <button type="button" onClick={() => setThingsToCarry(thingsToCarry.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setThingsToCarry([...thingsToCarry, ""])} className="text-[11px] font-bold text-blue-600 self-start hover:underline">+ Add Item</button>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                  <label className="block text-slate-700 font-bold mb-1">Gallery Images</label>
                  {gallery.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={item}
                        onChange={(e) => {
                          const newArr = [...gallery]
                          newArr[idx] = e.target.value
                          setGallery(newArr)
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600"
                      />
                      <button type="button" onClick={() => setGallery(gallery.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleGalleryDrop}
                    onClick={() => galleryInputRef.current?.click()}
                    className={`relative w-full border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all text-center hover:border-blue-400 hover:bg-blue-50/30 border-gray-200 bg-slate-50/50 ${isGalleryUploading ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleGalleryUpload(e.target.files)
                      }}
                    />
                    {isGalleryUploading ? (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-[10px] text-blue-600 font-bold">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-600">Click or drag images to upload</p>
                      </div>
                    )}
                  </div>
                  
                  <button type="button" onClick={() => setGallery([...gallery, ""])} className="text-[11px] font-bold text-blue-600 self-start hover:underline">+ Add Manual Image URL</button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

