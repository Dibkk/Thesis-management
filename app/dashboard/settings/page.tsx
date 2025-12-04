"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Save, Settings, Shield, Bell, Database, Globe, Mail, AlertTriangle, Download, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { LoadingScreen } from "@/components/loading"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    academicYear: "",
    submissionDeadline: undefined as Date | undefined,
    maintenanceMode: false,
    announcement: "",
    systemName: "Thesis Management System",
    contactEmail: "",
    allowStudentRegistration: true,
    allowAdvisorRegistration: true,
    emailTemplateSubject: "",
    emailTemplateBody: ""
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.success) {
        setSettings({
          ...data.settings,
          submissionDeadline: data.settings.submissionDeadline ? new Date(data.settings.submissionDeadline) : undefined
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Settings saved successfully")
      } else {
        toast.error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 min-h-screen">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            System Settings
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
            Configure global system parameters and preferences.
            </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 px-8">
            {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="general" className="w-full space-y-6">
            <TabsList className="w-full justify-start h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg">
                <TabsTrigger value="general" className="px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 transition-all duration-300 gap-1.5 text-sm font-medium">
                    <Globe className="h-3.5 w-3.5" /> General
                </TabsTrigger>
                <TabsTrigger value="academic" className="px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/30 transition-all duration-300 gap-1.5 text-sm font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" /> Academic
                </TabsTrigger>
                <TabsTrigger value="security" className="px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 transition-all duration-300 gap-1.5 text-sm font-medium">
                    <Shield className="h-3.5 w-3.5" /> Security & Access
                </TabsTrigger>
                <TabsTrigger value="notifications" className="px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-orange-500/30 transition-all duration-300 gap-1.5 text-sm font-medium">
                    <Bell className="h-3.5 w-3.5" /> Notifications
                </TabsTrigger>
                <TabsTrigger value="data" className="px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-rose-500/30 transition-all duration-300 gap-1.5 text-sm font-medium">
                    <Database className="h-3.5 w-3.5" /> Data Management
                </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-blue-500" /> General Configuration</CardTitle>
                        <CardDescription>Basic system information and branding.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <Label htmlFor="systemName">System Name</Label>
                            <Input 
                                id="systemName" 
                                value={settings.systemName} 
                                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                                placeholder="Thesis Management System"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input 
                                id="contactEmail" 
                                value={settings.contactEmail} 
                                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                                placeholder="admin@university.edu"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="announcement">Global Announcement</Label>
                            <Textarea 
                                id="announcement" 
                                value={settings.announcement} 
                                onChange={(e) => setSettings({...settings, announcement: e.target.value})}
                                placeholder="Message to display on dashboard..."
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">This message will be visible to all users on their dashboard.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="academic">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-purple-500" /> Academic Settings</CardTitle>
                        <CardDescription>Manage academic year and submission timelines.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Current Academic Year</Label>
                            <Input 
                                id="academicYear" 
                                value={settings.academicYear} 
                                onChange={(e) => setSettings({...settings, academicYear: e.target.value})}
                                placeholder="e.g. 2025"
                            />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Submission Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !settings.submissionDeadline && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {settings.submissionDeadline ? format(settings.submissionDeadline, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={settings.submissionDeadline}
                                    onSelect={(date) => setSettings({...settings, submissionDeadline: date})}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">Students will be warned if they submit after this date.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-green-500" /> Security & Access</CardTitle>
                        <CardDescription>Control user access and system availability.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-2xl">
                         <div className="flex items-center justify-between rounded-lg border p-4 bg-white/50 dark:bg-gray-800/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                Disable access for students and advisors. Only admins can login.
                                </p>
                            </div>
                            <Switch 
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 bg-white/50 dark:bg-gray-800/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Allow Student Registration</Label>
                                <p className="text-sm text-muted-foreground">
                                Enable or disable new student sign-ups.
                                </p>
                            </div>
                            <Switch 
                                checked={settings.allowStudentRegistration}
                                onCheckedChange={(checked) => setSettings({...settings, allowStudentRegistration: checked})}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 bg-white/50 dark:bg-gray-800/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Allow Advisor Registration</Label>
                                <p className="text-sm text-muted-foreground">
                                Enable or disable new advisor sign-ups.
                                </p>
                            </div>
                            <Switch 
                                checked={settings.allowAdvisorRegistration}
                                onCheckedChange={(checked) => setSettings({...settings, allowAdvisorRegistration: checked})}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notifications">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-orange-500" /> Email Notifications</CardTitle>
                        <CardDescription>Configure automated email templates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <Label htmlFor="emailSubject">Default Email Subject</Label>
                            <Input 
                                id="emailSubject" 
                                value={settings.emailTemplateSubject} 
                                onChange={(e) => setSettings({...settings, emailTemplateSubject: e.target.value})}
                                placeholder="Thesis Update Notification"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emailBody">Default Email Body Template</Label>
                            <Textarea 
                                id="emailBody" 
                                value={settings.emailTemplateBody} 
                                onChange={(e) => setSettings({...settings, emailTemplateBody: e.target.value})}
                                placeholder="Dear User..."
                                rows={6}
                            />
                            <p className="text-xs text-muted-foreground">Use placeholders like {'{name}'}, {'{title}'} for dynamic content.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="data">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Danger Zone</CardTitle>
                        <CardDescription>Manage system data and critical operations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
                            <div>
                                <h4 className="font-medium text-red-900 dark:text-red-200">Export System Data</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">Download all thesis and user data as JSON.</p>
                            </div>
                            <Button variant="outline" className="border-red-200 hover:bg-red-100 text-red-700">
                                <Download className="h-4 w-4 mr-2" /> Export Data
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
                            <div>
                                <h4 className="font-medium text-red-900 dark:text-red-200">Reset System</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">Clear all temporary data and caches.</p>
                            </div>
                            <Button variant="destructive">
                                <RefreshCw className="h-4 w-4 mr-2" /> Reset System
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
