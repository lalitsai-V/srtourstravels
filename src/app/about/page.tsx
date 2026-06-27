import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Car, IndianRupee, HeadphonesIcon, Users, MapPin, Target, Eye, Shield, Award, Map, Star, Plane, CheckCircle2, MessageSquare, Briefcase } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="w-full bg-slate-50 font-sans pb-0">
      {/* 1. HERO BANNER WITH CURVED BOTTOM */}
      <section className="relative w-full overflow-hidden bg-white pb-20 pt-16">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/van_imge.png"
            alt="Van on scenic road"
            fill
            className="object-cover object-bottom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-[#003899]">
                <span className="text-xl font-script italic font-medium">About Us</span>
                <Plane className="w-5 h-5 text-[#003899] rotate-45" />
                <div className="w-24 border-b border-dashed border-[#003899]/50"></div>
              </div>

              <h1 className="text-4xl md:text-[3.5rem] font-bold leading-tight tracking-tight text-slate-900 mb-2">
                Your Journey,
              </h1>
              <h1 className="text-4xl md:text-[3.5rem] font-bold leading-tight tracking-tight text-[#003899] mb-6">
                Our Responsibility
              </h1>

              <p className="text-base text-slate-700 font-medium max-w-lg mb-10 leading-relaxed">
                SR Tours & Travels is your trusted partner for unforgettable journeys across Tamil Nadu with safe, comfortable and reliable travel services.
              </p>

              {/* 4 Feature Badges */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-4 w-[110px] flex flex-col items-center justify-center text-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-[#003899]" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Safe &<br />Reliable</span>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-4 w-[110px] flex flex-col items-center justify-center text-center gap-2">
                  <Users className="w-8 h-8 text-[#003899]" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Comfortable<br />Journey</span>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-4 w-[110px] flex flex-col items-center justify-center text-center gap-2">
                  <Award className="w-8 h-8 text-[#003899]" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Best Price<br />Guarantee</span>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-4 w-[110px] flex flex-col items-center justify-center text-center gap-2">
                  <HeadphonesIcon className="w-8 h-8 text-[#003899]" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">24/7<br />Support</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Curved bottom SVG */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[80px] md:h-[140px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#003899" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="#f8fafc" fillOpacity="1" d="M0,256L60,250.7C120,245,240,235,360,229.3C480,224,600,224,720,229.3C840,235,960,245,1080,240C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* 2. ABOUT SR TOURS (COLLAGE & TEXT) */}
      <section className="bg-[#f8fafc] w-full pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Collage */}
          <div className="relative h-[500px] w-full">
            {/* Top Left Image */}
            <div className="absolute top-0 left-0 w-[60%] h-[240px] rounded-3xl overflow-hidden shadow-xl border-4 border-white z-10">
              <Image src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" alt="Temple" fill className="object-cover" />
            </div>
            {/* Right Image */}
            <div className="absolute top-12 right-0 w-[45%] h-[280px] rounded-3xl overflow-hidden shadow-xl border-4 border-white z-20">
              <Image src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80" alt="Waterfall" fill className="object-cover" />
            </div>
            {/* Bottom Image */}
            <div className="absolute bottom-0 left-10 w-[70%] h-[220px] rounded-3xl overflow-hidden shadow-xl border-4 border-white z-10">
              <Image src="/van_imge.png" alt="Statue" fill className="object-cover" />
            </div>

            {/* 10+ Years Badge */}
            <div className="absolute left-[-20px] top-[180px] bg-[#003899] text-white p-5 rounded-2xl shadow-xl z-30 flex flex-col items-center justify-center border-4 border-white w-[110px] h-[120px]">
              <span className="text-3xl font-extrabold">10+</span>
              <Award className="w-5 h-5 my-1" />
              <span className="text-[10px] font-semibold text-center uppercase tracking-wide">Years of<br />Experience</span>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="flex flex-col">
            <div className="inline-block bg-[#e5f0ff] text-[#003899] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 w-fit">
              WHO WE ARE
            </div>

            <h2 className="text-3xl md:text-[34px] font-bold text-slate-900 mb-2">
              About <span className="text-[#003899]">SR Tours & Travels</span>
            </h2>
            <div className="flex items-center gap-1 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#003899]"></div>
              <div className="w-16 h-0.5 bg-[#003899]/30"></div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">
              We are a passionate team of travel lovers dedicated to providing memorable tour experiences and reliable transportation services across Tamil Nadu.
            </p>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
              Whether you are planning a family vacation, pilgrimage, group trip or a business travel, we ensure your journey is smooth, safe and filled with beautiful memories.
            </p>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-[#f0f7ff] rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-[#003899]" />
                  <h3 className="font-bold text-slate-900">Our Mission</h3>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  To provide affordable, safe and memorable travel experiences with exceptional service and customer satisfaction.
                </p>
              </div>
              <div className="bg-[#f0fdf4] rounded-2xl p-5 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-slate-900">Our Vision</h3>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  To become the most trusted tours and travel service provider in Tamil Nadu by delivering excellence in every journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="bg-white w-full py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-block bg-[#e5f0ff] text-[#003899] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              WHY CHOOSE US
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              We Make Your Travel <span className="text-[#003899]">Easy & Memorable</span>
            </h2>
            <div className="flex items-center gap-1">
              <div className="w-16 h-0.5 bg-[#003899]/30"></div>
              <div className="w-2 h-2 rounded-full bg-[#003899]"></div>
              <div className="w-16 h-0.5 bg-[#003899]/30"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, title: "Trusted Service", desc: "Thousands of happy customers trust us for their journeys." },
              { icon: <Car className="w-8 h-8" />, title: "Comfortable Vehicles", desc: "Well maintained vehicles for safe and comfortable travel." },
              { icon: <MapPin className="w-8 h-8" />, title: "Curated Packages", desc: "Best tour packages covering popular destinations across Tamil Nadu." },
              { icon: <IndianRupee className="w-8 h-8" />, title: "Transparent Pricing", desc: "No hidden charges and best prices guaranteed." },
              { icon: <HeadphonesIcon className="w-8 h-8" />, title: "24/7 Support", desc: "We are always available to assist you anytime." },
              { icon: <Users className="w-8 h-8" />, title: "Customer First", desc: "Your comfort and satisfaction is our priority." },
            ].map((item, i) => (
              <div key={i} className="border border-slate-300 bg-white rounded-2xl p-6 flex flex-col items-center text-center hover:border-slate-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                <div className="bg-[#f4f8ff] text-[#003899] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[13px] text-slate-900 mb-2 leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STATISTICS BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="bg-[#003899] rounded-[2rem] py-10 px-6 md:px-12 flex flex-wrap lg:flex-nowrap items-center justify-between gap-8 md:gap-4 shadow-xl">
          {[
            { icon: <Users className="w-8 h-8" />, num: "5000+", label: "Happy Travelers" },
            { icon: <Briefcase className="w-8 h-8" />, num: "1000+", label: "Successful Trips" },
            { icon: <Map className="w-8 h-8" />, num: "50+", label: "Tour Packages" },
            { icon: <Car className="w-8 h-8" />, num: "200+", label: "Vehicles" },
            { icon: <Star className="w-8 h-8" />, num: "100%", label: "Customer Satisfaction" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 text-white flex-1 justify-center lg:justify-start lg:border-r border-white/20 last:border-0 last:pr-0">
              <div className="opacity-80">{stat.icon}</div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{stat.num}</span>
                <span className="text-[11px] font-medium opacity-80 uppercase tracking-wide">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SERVICES SECTION */}
      <section className="bg-white w-full pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-block bg-[#e5f0ff] text-[#003899] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              OUR SERVICES
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Tours & Travels Services <span className="text-[#003899]">We Offer</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tours Card */}
            <div className="bg-[#f8fafc] rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-[#003899] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <Map className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Tours</h3>
                    <p className="text-xs text-slate-500 font-medium">Explore the best destinations with our specially curated tour packages.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    "Hill Station Tours", "Pilgrimage Tours", "Family Packages", "Honeymoon Packages", "Custom Tour Packages"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#003899]" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-48 w-full relative">
                <Image src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" alt="Tours" fill className="object-cover" />
              </div>
            </div>

            {/* Travels Card */}
            <div className="bg-[#f8fafc] rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-[#16a34a] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <Car className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Travels</h3>
                    <p className="text-xs text-slate-500 font-medium">Comfortable and reliable travel services for every journey.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    "Taxi Services", "SUV & Car Rentals", "9, 12, 14 & 16 Seater", "Group Travel", "Airport Transfers"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-48 w-full relative">
                <Image src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80" alt="Travels" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="bg-[#003899] rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Abstract curve background */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>

          <div className="flex items-start gap-6 relative z-10 max-w-2xl">
            <Plane className="w-10 h-10 text-white/80 rotate-45 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl md:text-3xl font-script italic font-medium mb-1">Ready for Your Next Adventure?</h2>
              <p className="text-sm text-blue-100 font-medium">Let SR Tours & Travels make your journey safe, comfortable and unforgettable.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0 w-full md:w-auto">
            <Link href="/tours" className="bg-white text-[#003899] hover:bg-blue-50 font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <Map className="w-5 h-5" />
              Explore Tours
            </Link>
            <Link href="/contact" className="bg-[#25D366] hover:bg-[#1fae54] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
