"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Compass,
  Car,
  MessageSquare,
  Settings as SettingsIcon,
  ArrowLeft,
  Menu,
  X
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const links = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Tours Module", href: "/admin/tours", icon: <Compass className="w-5 h-5" /> },
    { name: "Vehicles Module", href: "/admin/vehicles", icon: <Car className="w-5 h-5" /> },
    { name: "Enquiries Log", href: "/admin/enquiries", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <SettingsIcon className="w-5 h-5" /> }
  ]

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      if (supabase) {
        supabase.auth.getSession().then(({ data }: { data: any }) => {
          if (!data.session && pathname !== "/admin/login") {
            window.location.href = "/admin/login"
          } else {
            setIsCheckingAuth(false)
          }
        })
      } else {
        setIsCheckingAuth(false)
      }
    })
  }, [pathname])

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase")
    if (supabase) {
      await supabase.auth.signOut()
      window.location.href = "/admin/login"
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="text-slate-500 font-semibold text-sm animate-pulse">Verifying Access...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full bg-[#0f172a] text-white flex justify-between items-center px-4 py-3 z-30 shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm">SR</div>
          <span className="font-extrabold text-sm uppercase tracking-wider">SR Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 focus:outline-none">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 bg-[#0f172a] text-slate-300 w-64 p-5 flex flex-col justify-between z-20 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 border-b border-slate-800 pb-5">
            <img 
              src="/logosr.png" 
              alt="SR Tours Logo" 
              className="w-10 h-10 object-contain bg-white rounded-md p-0.5" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm uppercase leading-tight tracking-wider">SR Admin</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Management Portal</span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1.5 text-sm font-semibold">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(link.href)
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-white border border-transparent transition-all text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Exit to Website</span>
          </Link>

          {pathname !== "/admin/login" && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl hover:bg-red-900/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all text-slate-400 w-full text-left"
            >
              <X className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen p-4 md:p-8 pt-6 lg:pt-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  )
}
