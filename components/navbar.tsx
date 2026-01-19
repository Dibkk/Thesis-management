"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Upload,
  Search,
  BarChart3,
  FileText,
  CheckSquare,
  Bell,
  FileBarChart,
  User,
} from "lucide-react"

interface AppUser {
  firstname?: string; // (ใส่ ? เพื่อบอกว่าอาจจะไม่มีก็ได้)
  lastname?: string;
  email: string;
  role: string;
  department?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const loadUserFromStorage = () => {
      const userData = localStorage.getItem("user") 
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          // (เพิ่มการเช็คว่ามีข้อมูลจริงๆ)
          if (parsedUser) {
            setUser(parsedUser)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Failed to parse user data", error)
          localStorage.removeItem("user") 
          setUser(null)
        }
      } else {
        setUser(null) 
      }
    }

    loadUserFromStorage()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user") {
        loadUserFromStorage()
      }
    }
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, []) 

  const handleLogout = () => {
    try {
      // ลบ Cookie ผ่าน API
      fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem("user");
    } catch (e) { /* ignore */ }
    window.location.href = '/login'
  }

  const displayName = user ? `${user.firstname || 'User'} ${user.lastname || ''}`.trim() : ""
  
  const initials = user?.firstname ? user.firstname.charAt(0).toUpperCase() : "U"


  const getNavItems = () => {
    if (!user) return [] 

    const baseItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/upload", label: "Upload Thesis", icon: Upload },
      { href: "/dashboard/browse", label: "Browse", icon: Search },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ]
    
    if (user.role === "student") {
      return [...baseItems, { href: "/dashboard/thesis", label: "My Thesis", icon: FileText }]
    }
    if (user.role === "advisor") {
      return [
        ...baseItems,
        { href: "/dashboard/reviews", label: "Reviews", icon: FileText },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
      ]
    }
    if (user.role === "admin") {
      return [
        ...baseItems,
        { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
      ]
    }
    return baseItems
  }

  const navItems = getNavItems()

  return (
    <motion.nav
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border/40 shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Thesis Management</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden lg:flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div key={item.href} whileHover={{ y: -1, scale: 1.02 }} whileTap={{ y: 0 }}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user ? (
              <>
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all">
                      <Avatar className="h-10 w-10 border-2 border-gradient-to-r from-blue-500 to-purple-600">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {/* --- ใช้ตัวแปร initials ที่ปลอดภัยแล้ว --- */}
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleLogout()} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && isMobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t border-border py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="justify-start"
              >
                <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 ml-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                Toggle Theme
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}