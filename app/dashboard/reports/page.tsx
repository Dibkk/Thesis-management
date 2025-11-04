"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Download, FileText, BarChart3, CalendarIcon, Users, BookOpen, TrendingUp, Clock } from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "Dr. Admin",
  email: "admin@university.edu",
  role: "admin" as const,
  department: "Administration",
}

// Mock report templates
const reportTemplates = [
  {
    id: "thesis-summary",
    name: "Thesis Summary Report",
    description: "Overview of all thesis submissions, approvals, and rejections",
    category: "Academic",
    icon: <FileText className="h-5 w-5" />,
    fields: ["title", "author", "advisor", "status", "submission_date", "approval_date", "category"],
  },
  {
    id: "user-activity",
    name: "User Activity Report",
    description: "User engagement and activity statistics",
    category: "Analytics",
    icon: <Users className="h-5 w-5" />,
    fields: ["user_name", "role", "last_login", "thesis_count", "review_count"],
  },
  {
    id: "download-stats",
    name: "Download Statistics",
    description: "Most downloaded theses and download trends",
    category: "Analytics",
    icon: <TrendingUp className="h-5 w-5" />,
    fields: ["thesis_title", "author", "download_count", "category", "publish_date"],
  },
  {
    id: "department-overview",
    name: "Department Overview",
    description: "Thesis statistics by department and category",
    category: "Academic",
    icon: <BarChart3 className="h-5 w-5" />,
    fields: ["department", "category", "thesis_count", "approval_rate", "avg_review_time"],
  },
  {
    id: "deadline-tracking",
    name: "Deadline Tracking Report",
    description: "Upcoming deadlines and overdue submissions",
    category: "Management",
    icon: <Clock className="h-5 w-5" />,
    fields: ["student_name", "thesis_title", "deadline", "status", "days_remaining"],
  },
]

// Mock generated reports
const generatedReports = [
  {
    id: "1",
    name: "Monthly Thesis Summary - January 2024",
    template: "Thesis Summary Report",
    generatedDate: "2024-01-31T10:00:00Z",
    fileSize: "2.4 MB",
    format: "PDF",
    status: "completed",
  },
  {
    id: "2",
    name: "User Activity Report - Q4 2023",
    template: "User Activity Report",
    generatedDate: "2024-01-15T14:30:00Z",
    fileSize: "1.8 MB",
    format: "Excel",
    status: "completed",
  },
  {
    id: "3",
    name: "Download Statistics - December 2023",
    template: "Download Statistics",
    generatedDate: "2024-01-10T09:15:00Z",
    fileSize: "3.2 MB",
    format: "PDF",
    status: "completed",
  },
]

export default function ReportsPage() {
  const [user] = useState(mockUser)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [reportName, setReportName] = useState("")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [reportFormat, setReportFormat] = useState("pdf")
  const [filterCategory, setFilterCategory] = useState("all")

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setReportName(`${template.name} - ${format(new Date(), "MMMM yyyy")}`)
    setSelectedFields(template.fields.slice(0, 5)) // Select first 5 fields by default
  }

  const handleFieldToggle = (field: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, field])
    } else {
      setSelectedFields(selectedFields.filter((f) => f !== field))
    }
  }

  const handleGenerateReport = () => {
    // TODO: Implement report generation logic
    console.log("Generating report:", {
      template: selectedTemplate?.id,
      name: reportName,
      fields: selectedFields,
      dateRange,
      format: reportFormat,
    })
  }

  const filteredTemplates = reportTemplates.filter((template) =>
    filterCategory === "all" ? true : template.category.toLowerCase() === filterCategory,
  )

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and export data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Templates */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading">Report Templates</CardTitle>
                    <CardDescription>Choose a template to generate your report</CardDescription>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">{template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-foreground">{template.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                              </div>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Recent Reports</CardTitle>
                <CardDescription>Previously generated reports available for download</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.template} • Generated {new Date(report.generatedDate).toLocaleDateString()} •{" "}
                          {report.fileSize}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.format}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Configure Report</CardTitle>
                <CardDescription>Customize your report settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedTemplate ? (
                  <>
                    {/* Report Name */}
                    <div className="space-y-2">
                      <Label htmlFor="report-name">Report Name</Label>
                      <Input
                        id="report-name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Enter report name"
                      />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Fields Selection */}
                    <div className="space-y-2">
                      <Label>Include Fields</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedTemplate.fields.map((field: string) => (
                          <div key={field} className="flex items-center space-x-2">
                            <Checkbox
                              id={`field-${field}`}
                              checked={selectedFields.includes(field)}
                              onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                            />
                            <Label htmlFor={`field-${field}`} className="text-sm capitalize">
                              {field.replace("_", " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="format">Export Format</Label>
                      <Select value={reportFormat} onValueChange={setReportFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <Button
                      onClick={handleGenerateReport}
                      className="w-full"
                      disabled={!reportName || selectedFields.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium text-foreground mb-2">Select a Template</h4>
                    <p className="text-sm text-muted-foreground">Choose a report template to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">Total Theses</span>
                  </div>
                  <span className="font-bold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Active Users</span>
                  </div>
                  <span className="font-bold">456</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-accent" />
                    <span className="text-sm">Downloads</span>
                  </div>
                  <span className="font-bold">8,901</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reports Generated</span>
                  </div>
                  <span className="font-bold">23</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
