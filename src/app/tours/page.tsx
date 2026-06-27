import Link from "next/link"
import Image from "next/image"
import { getTours } from "@/lib/db"

export default async function ToursPage() {
  const tours = await getTours()

  return (
    <div className="w-full bg-slate-50 font-sans pb-16">
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">Tours</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">Explore our tour packages</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group block rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden rounded-t-3xl bg-slate-100">
                <Image src={tour.image_url} alt={tour.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                  <span>{tour.duration_days}D / {tour.duration_nights}N</span>
                  <span>{tour.places_count} places</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{tour.name}</h2>
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">{tour.overview}</p>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>From {tour.start_location}</span>
                  <span className="font-semibold text-blue-600">₹{tour.price.toLocaleString("en-IN")}</span>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
