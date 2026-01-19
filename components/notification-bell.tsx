"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, CheckCircle, Clock, MessageSquare, Info, BellRing } from "lucide-react"

interface INotification {
  _id: string;
  title: string;
  message: string;
  link: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const router = useRouter()

  // 1. ดึงข้อมูลเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchNotis = async () => {
        // Check if user is logged in
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        try {
            const res = await fetch('/api/notifications', { signal });
            if (res.status === 401) {
                localStorage.removeItem("user");
                router.push('/login');
                return;
            }
            
            const data = await res.json();
            if(data.success) setNotifications(data.notifications);
        } catch (e: any) { 
            if (e.name === 'AbortError') return;
            // Suppress "Failed to fetch" which happens on dev server restart/network blip
            if (e.message === 'Failed to fetch') return;
            console.error("Notification fetch error:", e); 
        }
    };
    fetchNotis();
    
    // (Optional) ตั้งเวลาดึงใหม่ทุก 30 วินาที (Polling)
    const interval = setInterval(fetchNotis, 30000);
    return () => {
        clearInterval(interval);
        controller.abort();
    };
  }, [router])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleRead = async (n: INotification) => {
    // 1. ถ้ายังไม่อ่าน ให้ยิง API ไปบอกว่าอ่านแล้ว
    if (!n.isRead) {
        await fetch('/api/notifications', {
            method: 'PUT',
            body: JSON.stringify({ id: n._id })
        });
        // อัปเดตหน้าจอทันที
        setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
    }
    // 2. ไปยังลิงก์
    if (n.link && n.link !== '#') router.push(n.link);
  }

  const getIcon = (type: string) => {
      if(type === 'success' || type === 'thesis_approved') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      if(type === 'warning' || type === 'deadline' || type === 'deadline_reminder') return <Clock className="h-4 w-4 text-amber-500" />;
      if(type === 'feedback_received') return <MessageSquare className="h-4 w-4 text-purple-500" />;
      return <Info className="h-4 w-4 text-blue-500" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300"
          >
            {unreadCount > 0 ? (
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <BellRing className="h-5 w-5" />
              </motion.div>
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1"
              >
                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg shadow-red-500/50 animate-pulse">
                  {unreadCount}
                </Badge>
              </motion.div>
            )}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" align="end">
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/30">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notifications
              </span>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-3">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n, index) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DropdownMenuItem 
                    className={`p-4 cursor-pointer flex items-start gap-3 transition-all duration-300 border-l-2 ${
                      !n.isRead 
                        ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border-l-blue-500 hover:from-blue-100/80 hover:to-purple-100/80" 
                        : "border-l-transparent hover:bg-muted/50"
                    }`} 
                    onClick={() => handleRead(n)}
                  >
                    <div className="mt-1 p-2 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-sm">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/50" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {(() => {
                            const date = new Date(n.createdAt);
                            const now = new Date();
                            const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                            if (diffHours < 1) return "Just now";
                            if (diffHours < 24) return `${diffHours}h ago`;
                            if (diffHours < 48) return "Yesterday";
                            return date.toLocaleDateString();
                          })()}
                        </p>
                    </div>
                  </DropdownMenuItem>
                  {index < Math.min(notifications.length - 1, 4) && (
                    <DropdownMenuSeparator className="my-0" />
                  )}
                </motion.div>
              ))
            )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 text-sm font-semibold"
                onClick={() => router.push('/dashboard/notifications')}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
