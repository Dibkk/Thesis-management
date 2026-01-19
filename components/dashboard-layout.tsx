"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { GlobalSearch } from "@/components/global-search"
import { NotificationBell } from "@/components/notification-bell"
import { useTheme } from "next-themes" 
import {
  BookOpen,
  Home,
  FileText,
  Upload,
  Search,
  Users,
  Settings,
  Bell,
  BarChart3,
  Menu,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  MessageSquare,
  User, 
  Sun, 
  Moon, 
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: { 
    id: string
    firstname: string
    lastname: string
    email: string
    role: "student" | "advisor" | "admin"
    department: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme() 

  const handleLogout = async () => {
    console.log("dashboard handleLogout called")
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (e) {
      console.error("Logout fetch error:", e);
    }
    window.location.href = '/login'
  }

  const displayName = user?.firstname + " " + user?.lastname || "Guest"
  const initials = (
    (user?.firstname + " " + user?.lastname)
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("") || "U"
  )

  const getNavigationItems = () => {
    const baseItems = [{ icon: Home, label: "Dashboard", href: "/dashboard" }]
    if (!user) return baseItems

    const roleSpecificItems = {
      student: [
        { icon: Search, label: "Browse", href: "/dashboard/browse" },
        { icon: FileText, label: "My Thesis", href: "/dashboard/thesis" },
        { icon: Upload, label: "Upload", href: "/dashboard/upload" },
        // { icon: Clock, label: "Progress", href: "/dashboard/progress" },
        { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
      ],
      advisor: [
        { icon: Search, label: "Browse", href: "/dashboard/browse" },
        { icon: Users, label: "Students", href: "/dashboard/students" },
        { icon: FileText, label: "Reviews", href: "/dashboard/reviews" },
        { icon: CheckCircle, label: "Approvals", href: "/dashboard/approvals" },
        { icon: MessageSquare, label: "Reports", href: "/dashboard/reports" },
        // { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
        { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
      ],
      admin: [
        { icon: Users, label: "User Management", href: "/dashboard/users" },
        { icon: FileText, label: "All Theses", href: "/dashboard/theses" },
        { icon: CheckCircle, label: "Approvals", href: "/dashboard/approvals" },
        // { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
        { icon: MessageSquare, label: "Reports", href: "/dashboard/reports" },
        { icon: Settings, label: "System Settings", href: "/dashboard/settings" },
        { icon: Search, label: "Browse", href: "/dashboard/browse" },
        { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
      ],
    }

    return [...baseItems, ...roleSpecificItems[user.role]]
  }

  const navigationItems = getNavigationItems()

  const SidebarContent = () => (
    <motion.div
      className="flex h-full flex-col"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div 
            className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }} 
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </motion.div>
          <span className="font-heading font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Thesis Manager</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <Link
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground/80 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-foreground hover:shadow-lg hover:shadow-blue-500/5 backdrop-blur-sm border border-transparent hover:border-blue-500/20"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all">
                <item.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* User Role Badge */}
      <motion.div
        className="border-t border-white/10 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-foreground font-semibold">
            {user?.role ?? "guest"}
          </Badge>
          <span className="text-xs text-sidebar-foreground/70 font-medium">{user?.department ?? ""}</span>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-border/40 bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 backdrop-blur-xl lg:block shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 backdrop-blur-xl">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <motion.header
          className="flex h-16 items-center justify-between border-b border-border/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-6 shadow-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="font-heading font-semibold text-card-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome back, {displayName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <GlobalSearch />
            <NotificationBell />

            {/* ปุ่มเปลี่ยนธีม (ถูกต้อง) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all">
                  <Avatar className="h-10 w-10 border-2 border-gradient-to-r from-blue-500 to-purple-600">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email ?? ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* ปุ่ม Profile (ถูกต้อง) */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                {/* 2. --- onSelect={handleLogout} ถูกต้องแล้ว --- */}
                <DropdownMenuItem 
                  onSelect={handleLogout} 
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}