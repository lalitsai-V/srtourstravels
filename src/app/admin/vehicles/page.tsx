"use client"

import { useState, useEffect, useRef } from "react"
import { Car, Plus, Edit2, Trash2, X, Check, Loader2, AlertCircle, Upload, ImageIcon } from "lucide-react"
import { getVehicles, saveVehicle, deleteVehicle, Vehicle, uploadImage } from "@/lib/db"
import { z } from "zod"


// Zod validation schema for Vehicle form
const vehicleSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  type: z.string().min(3, { message: "Type/Model description is required" }),
  seat_count: z.number().min(1, { message: "Seat count must be >= 1" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  image_url: z.string().min(1, { message: "Image is required" }),
  ac: z.boolean(),
  price_per_km: z.number().min(1, { message: "Price per km must be greater than 0" })
})

type VehicleFormData = z.infer<typeof vehicleSchema>

export default function AdminVehiclesModule() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [seatCount, setSeatCount] = useState(4)
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [ac, setAc] = useState(true)
  const [pricePerKm, setPricePerKm] = useState(12)

  const [vehicleGallery, setVehicleGallery] = useState<string[]>([])

  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGalleryUploading, setIsGalleryUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  async function loadVehicles() {
    setLoading(true)
    const data = await getVehicles()
    setVehicles(data || [])
    setLoading(false)
  }

  const openCreateForm = () => {
    setEditingVehicle(null)
    setName("")
    setType("")
    setSeatCount(4)
    setDescription("")
    setImageUrl("")
    setAc(true)
    setPricePerKm(12)
    setVehicleGallery([])
    setErrors({})
    setImagePreview(null)
    setShowForm(true)
  }

  const openEditForm = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setName(vehicle.name)
    setType(vehicle.type)
    setSeatCount(vehicle.seat_count)
    setDescription(vehicle.description)
    setImageUrl(vehicle.image_url)
    setAc(vehicle.ac)
    setPricePerKm(vehicle.price_per_km)
    setVehicleGallery(vehicle.gallery || [])
    setErrors({})
    setImagePreview(vehicle.image_url || null)
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

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    setErrors((prev) => { const { image_url, ...rest } = prev; return rest })
    try {
      const url = await uploadImage(file, "vehicles")
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
        const url = await uploadImage(file, "vehicles_gallery")
        newUrls.push(url)
      }
      setVehicleGallery(prev => [...prev, ...newUrls])
    } catch (err: any) {
      alert("Gallery upload failed: " + err.message)
    } finally {
      setIsGalleryUploading(false)
    }
  }

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length > 0) handleGalleryUpload(e.dataTransfer.files)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSaving(true)

    const formValues: VehicleFormData = {
      name,
      type,
      seat_count: seatCount,
      description,
      image_url: imageUrl,
      ac,
      price_per_km: pricePerKm
    }

    const result = vehicleSchema.safeParse(formValues)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof VehicleFormData, string>> = {}
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof VehicleFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      setIsSaving(false)
      return
    }

    const newVehicle: Vehicle = {
      id: editingVehicle?.id || crypto.randomUUID(),
      name,
      type,
      seat_count: seatCount,
      description,
      image_url: imageUrl,
      ac,
      price_per_km: pricePerKm,
      gallery: vehicleGallery.filter(u => u.trim() !== "")
    }

    try {
      await saveVehicle(newVehicle)
      setShowForm(false)
      loadVehicles()
      alert("added suffecfulluy in the database")
    } catch (err) {
      console.error(err)
      alert("Failed to save vehicle details.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle from the fleet?")) {
      await deleteVehicle(id)
      loadVehicles()
    }
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Top Header Banner */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vehicles Management</h1>
          <p className="text-xs text-slate-500">Configure details of rental fleet units available on site.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fleet Vehicle</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">
          Loading fleet vehicles...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans font-medium text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-extrabold bg-slate-50/50">
                  <th className="py-3.5 px-6">Image</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Type Description</th>
                  <th className="py-3.5 px-6">Seat Count</th>
                  <th className="py-3.5 px-6">AC Available</th>
                  <th className="py-3.5 px-6">Price/km</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/30">
                    <td className="py-3.5 px-6">
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center p-1">
                        <img src={v.image_url || undefined} alt="" className="object-contain w-full h-full" />
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{v.name}</td>
                    <td className="py-3.5 px-6">{v.type}</td>
                    <td className="py-3.5 px-6">{v.seat_count} Seats</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.ac ? "bg-green-50 text-green-700 border border-green-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                        }`}>
                        {v.ac ? "AC" : "Non-AC"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-blue-600">₹{v.price_per_km}/km</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditForm(v)}
                          className="p-1.5 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in scale-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base tracking-tight">
                  {editingVehicle ? "Edit Vehicle Details" : "Create Fleet Vehicle"}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">Define vehicle characteristics below.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/80 hover:text-white transition-colors hover:bg-white/10 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 12 Seater Traveller"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Vehicle Subtitle / Model *</label>
                  <input
                    type="text"
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Tempo Traveller (12 Seats)"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.type && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.type}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Max Passenger Seats *</label>
                  <input
                    type="number"
                    required
                    value={seatCount}
                    onChange={(e) => setSeatCount(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.seat_count && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.seat_count}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Price per km (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  {errors.price_per_km && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price_per_km}</p>}
                </div>
                <div className="flex flex-col justify-center">
                  <label className="block text-slate-500 mb-2">Climate Control AC *</label>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ac}
                      onChange={(e) => setAc(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-xs text-gray-700">AC Enabled</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Vehicle Image *</label>
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
                        <img src={imagePreview} alt="Preview" className="object-contain w-full h-full" />
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
                <label className="block text-slate-500 mb-1">Description text *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 transition-colors font-medium text-xs text-slate-600"
                />
                {errors.description && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
              </div>

              {/* Gallery Images */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                <label className="block text-slate-700 font-bold mb-1">Gallery Images (Auto-cycles in vehicle cards)</label>
                
                {/* Uploaded Gallery Previews */}
                {vehicleGallery.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {vehicleGallery.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white group">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => setVehicleGallery(vehicleGallery.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drag-and-drop dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleGalleryDrop}
                  onClick={() => galleryInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all text-center hover:border-blue-400 hover:bg-blue-50/30 border-gray-200 bg-slate-50/50 ${isGalleryUploading ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files) handleGalleryUpload(e.target.files) }}
                  />
                  {isGalleryUploading ? (
                    <div className="flex flex-col items-center gap-1 py-1">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      <span className="text-[10px] text-blue-600 font-bold">Uploading gallery images...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-1">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-600">Click or drag multiple images to upload</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB each</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">These images will cycle every 1 second on vehicle cards. Hover to remove an image.</p>
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
                  <span>Save Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
