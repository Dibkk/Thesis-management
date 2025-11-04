"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, Bell, BellOff, MessageSquare, Calendar, Settings, Trash2 } from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@university.edu",
  role: "student" as const,
  department: "Computer Science",
}

// Mock notifications data
const notifications = [
  {
    id: "1",
    type: "thesis_approved",
    title: "Thesis Approved",
    message: "Your thesis 'Machine Learning Applications in Healthcare' has been approved by Dr. Jane Smith.",
    timestamp: "2024-01-25T10:30:00Z",
    read: false,
    priority: "high",
    actionUrl: "/dashboard/thesis",
  },
  {
    id: "2",
    type: "deadline_reminder",
    title: "Deadline Reminder",
    message: "Your thesis submission deadline is in 3 days. Please ensure all required documents are uploaded.",
    timestamp: "2024-01-24T09:00:00Z",
    read: false,
    priority: "medium",
    actionUrl: "/dashboard/upload",
  },
  {
    id: "3",
    type: "feedback_received",
    title: "New Feedback",
    message: "Dr. Jane Smith has provided feedback on your thesis chapter 3. Please review the comments.",
    timestamp: "2024-01-23T14:15:00Z",
    read: true,
    priority: "medium",
    actionUrl: "/dashboard/thesis",
  },
  {
    id: "4",
    type: "meeting_scheduled",
    title: "Meeting Scheduled",
    message: "A review meeting has been scheduled for January 30th at 2:00 PM with your advisor.",
    timestamp: "2024-01-22T11:45:00Z",
    read: true,
    priority: "low",
    actionUrl: "/dashboard/calendar",
  },
  {
    id: "5",
    type: "system_update",
    title: "System Update",
    message: "The thesis management system will undergo maintenance on January 28th from 2:00 AM to 4:00 AM.",
    timestamp: "2024-01-21T16:20:00Z",
    read: true,
    priority: "low",
    actionUrl: null,
  },
]

const notificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  thesisUpdates: true,
  deadlineReminders: true,
  feedbackAlerts: true,
  meetingReminders: true,
  systemUpdates: false,
}

export default function NotificationsPage() {
  const [user] = useState(mockUser)
  const [notifs, setNotifs] = useState(notifications)
  const [settings, setSettings] = useState(notificationSettings)
  const [filter, setFilter] = useState("all")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "thesis_approved":
        return <CheckCircle className="h-5 w-5 text-secondary" />
      case "thesis_rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "deadline_reminder":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "feedback_received":
        return <MessageSquare className="h-5 w-5 text-primary" />
      case "meeting_scheduled":
        return <Calendar className="h-5 w-5 text-accent" />
      case "system_update":
        return <Settings className="h-5 w-5 text-muted-foreground" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const markAsRead = (id: string) => {
    setNotifs(notifs.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifs(notifs.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifs(notifs.filter((notif) => notif.id !== id))
  }

  const filteredNotifications = notifs.filter((notif) => {
    if (filter === "unread") return !notif.read
    if (filter === "read") return notif.read
    return true
  })

  const unreadCount = notifs.filter((notif) => !notif.read).length

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with your thesis progress and important announcements
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead} className="bg-transparent">
                  Mark all as read
                </Button>
              )}
              <Badge variant="outline">{unreadCount} unread</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter !== "all" ? "bg-transparent" : ""}
              >
                All ({notifs.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={filter !== "unread" ? "bg-transparent" : ""}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === "read" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("read")}
                className={filter !== "read" ? "bg-transparent" : ""}
              >
                Read ({notifs.length - unreadCount})
              </Button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      {filter === "unread" ? "All caught up! No unread notifications." : "No notifications to show."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <h4 className="font-medium text-foreground">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={getPriorityColor(notification.priority)} variant="outline">
                                {notification.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <Button variant="outline" size="sm" className="bg-transparent">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Notification Preferences</CardTitle>
                <CardDescription>Customize how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">General</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Specific Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="thesis-updates">Thesis Updates</Label>
                        <p className="text-sm text-muted-foreground">Approval, rejection, and status changes</p>
                      </div>
                      <Switch
                        id="thesis-updates"
                        checked={settings.thesisUpdates}
                        onCheckedChange={(checked) => setSettings({ ...settings, thesisUpdates: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                        <p className="text-sm text-muted-foreground">Upcoming submission and review deadlines</p>
                      </div>
                      <Switch
                        id="deadline-reminders"
                        checked={settings.deadlineReminders}
                        onCheckedChange={(checked) => setSettings({ ...settings, deadlineReminders: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="feedback-alerts">Feedback Alerts</Label>
                        <p className="text-sm text-muted-foreground">New comments and reviews from advisors</p>
                      </div>
                      <Switch
                        id="feedback-alerts"
                        checked={settings.feedbackAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, feedbackAlerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                        <p className="text-sm text-muted-foreground">Scheduled meetings with advisors</p>
                      </div>
                      <Switch
                        id="meeting-reminders"
                        checked={settings.meetingReminders}
                        onCheckedChange={(checked) => setSettings({ ...settings, meetingReminders: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="system-updates">System Updates</Label>
                        <p className="text-sm text-muted-foreground">Maintenance and system announcements</p>
                      </div>
                      <Switch
                        id="system-updates"
                        checked={settings.systemUpdates}
                        onCheckedChange={(checked) => setSettings({ ...settings, systemUpdates: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
