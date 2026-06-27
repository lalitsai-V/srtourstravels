"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Calendar, Star, Heart } from "lucide-react"
import { Tour } from "@/lib/db"

interface TourCardProps {
  tour: Tour
}

export default function TourCard({ tour }: TourCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full font-sans relative">
      {/* Badge Top Left */}
      <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
        {tour.duration_days}D / {tour.duration_nights}N
      </div>

      {/* Like Button Top Right */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsLiked(!isLiked)
        }}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-sm focus:outline-none"
      >
        <Heart className={`w-4 h-4 transition-transform ${isLiked ? "fill-red-500 text-red-500 scale-110" : ""}`} />
      </button>

      {/* Image Area */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        {tour.image_url ? (
          <Image
            src={tour.image_url}
            alt={tour.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300 text-xs font-semibold">
            No Image
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col grow">
        <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold tracking-wider uppercase mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>From {tour.start_location.split(" / ")[0]}</span>
        </div>

        <h3 className="font-bold text-gray-800 text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
          {tour.name}
        </h3>

        {/* Short Specs */}
        <div className="flex gap-4 text-xs text-gray-500 mb-4 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{tour.places_count} Places</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{tour.duration_days} Days</span>
          </div>
        </div>

        {/* Pricing, Rating & Button */}
        <div className="mt-auto flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-blue-600">₹{tour.price.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-gray-400">/ Person</span>
              </div>
            </div>


          </div>

          <Link
            href={`/tours/${tour.slug}`}
            className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-1 border border-blue-100 hover:border-transparent group/btn"
          >
            <span>View Details</span>
            <span className="transform transition-transform group-hover/btn:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
