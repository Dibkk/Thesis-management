"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import { Palette, Bell, Shield, Globe, Monitor, Sun, Moon, Save, RefreshCw } from "lucide-react"

interface User {
  name: string
  email: string
  role: string
}

interface Settings {
  theme: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showActivity: boolean
  }
  preferences: {
    language: string
    timezone: string
    dateFormat: string
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showActivity: true,
    },
    preferences: {
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
  })
  const [hasChanges, setHasChanges] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))

    // Load saved settings
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [router])

  const handleSettingChange = (category: keyof Settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setSettings((prev) => ({ ...prev, theme: newTheme }))
    setHasChanges(true)
  }

  const handleSave = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
    setHasChanges(false)
  }

  const handleReset = () => {
    const defaultSettings: Settings = {
      theme: "system",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profileVisible: true,
        showEmail: false,
        showActivity: true,
      },
      preferences: {
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
      },
    }
    setSettings(defaultSettings)
    setTheme("system")
    setHasChanges(true)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.div
        className="container mx-auto px-4 py-8 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your experience and preferences</p>
        </motion.div>

        {/* Save/Reset Actions */}
        {hasChanges && (
          <motion.div
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800 dark:text-blue-300">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Appearance */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle className="font-heading">Appearance</CardTitle>
                </div>
                <CardDescription>Customize the look and feel of your interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Monitor },
                    ].map((themeOption) => {
                      const Icon = themeOption.icon
                      return (
                        <motion.div
                          key={themeOption.value}
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant={theme === themeOption.value ? "default" : "outline"}
                            className="w-full h-16 flex flex-col gap-2"
                            onClick={() => handleThemeChange(themeOption.value)}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{themeOption.label}</span>
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="font-heading">Notifications</CardTitle>
                </div>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{key} Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via {key}</p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleSettingChange("notifications", key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="font-heading">Privacy</CardTitle>
                </div>
                <CardDescription>Control your privacy and visibility settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === "profileVisible" && "Make your profile visible to others"}
                        {key === "showEmail" && "Display your email address on your profile"}
                        {key === "showActivity" && "Show your recent activity to others"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleSettingChange("privacy", key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle className="font-heading">Preferences</CardTitle>
                </div>
                <CardDescription>Set your language, timezone, and format preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => handleSettingChange("preferences", "language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="th">ไทย</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) => handleSettingChange("preferences", "timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                        <SelectItem value="JST">Japan Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.preferences.dateFormat}
                      onValueChange={(value) => handleSettingChange("preferences", "dateFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
