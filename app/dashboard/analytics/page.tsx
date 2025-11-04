"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Users, FileText, Download, BarChart3 } from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@university.edu",
  role: "admin" as const,
  department: "Computer Science",
}

// Mock analytics data
const uploadTrends = [
  { month: "Jan", uploads: 45, downloads: 1200 },
  { month: "Feb", uploads: 52, downloads: 1350 },
  { month: "Mar", uploads: 48, downloads: 1180 },
  { month: "Apr", uploads: 61, downloads: 1420 },
  { month: "May", uploads: 55, downloads: 1380 },
  { month: "Jun", uploads: 67, downloads: 1650 },
]

const categoryData = [
  { name: "Computer Science", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Engineering", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Physics", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Mathematics", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Biology", value: 8, color: "hsl(var(--chart-5))" },
  { name: "Other", value: 5, color: "hsl(var(--muted-foreground))" },
]

const statusData = [
  { status: "Published", count: 156, color: "hsl(var(--chart-2))" },
  { status: "In Review", count: 43, color: "hsl(var(--chart-1))" },
  { status: "Draft", count: 28, color: "hsl(var(--chart-3))" },
  { status: "Rejected", count: 12, color: "hsl(var(--destructive))" },
]

const topTheses = [
  { title: "Machine Learning in Healthcare", author: "Alice Johnson", downloads: 1245, category: "Computer Science" },
  { title: "Sustainable Energy Solutions", author: "Bob Smith", downloads: 987, category: "Engineering" },
  { title: "Quantum Computing Algorithms", author: "Carol Davis", downloads: 856, category: "Physics" },
  { title: "Neural Network Optimization", author: "David Brown", downloads: 743, category: "Computer Science" },
  { title: "Blockchain Security Analysis", author: "Emma Wilson", downloads: 692, category: "Computer Science" },
]

export default function AnalyticsPage() {
  const [user] = useState(mockUser)
  const [timeRange, setTimeRange] = useState("6months")

  const totalUploads = uploadTrends.reduce((sum, item) => sum + item.uploads, 0)
  const totalDownloads = uploadTrends.reduce((sum, item) => sum + item.downloads, 0)
  const avgUploadsPerMonth = Math.round(totalUploads / uploadTrends.length)
  const avgDownloadsPerMonth = Math.round(totalDownloads / uploadTrends.length)

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Analytics & Reports</h1>
              <p className="text-muted-foreground">Comprehensive insights into thesis management system</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Theses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-secondary" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-secondary" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-secondary" />
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Monthly Uploads</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgUploadsPerMonth}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                -3% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Upload Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="status">Status Overview</TabsTrigger>
            <TabsTrigger value="popular">Popular Theses</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Upload & Download Trends</CardTitle>
                  <CardDescription>Monthly thesis uploads and downloads over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      uploads: {
                        label: "Uploads",
                        color: "hsl(var(--chart-1))",
                      },
                      downloads: {
                        label: "Downloads",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={uploadTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="uploads"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          name="Uploads"
                        />
                        <Line
                          type="monotone"
                          dataKey="downloads"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          name="Downloads"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Monthly Upload Distribution</CardTitle>
                  <CardDescription>Thesis uploads by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      uploads: {
                        label: "Uploads",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={uploadTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="uploads" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Thesis Categories</CardTitle>
                  <CardDescription>Distribution of theses by academic category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Theses",
                      },
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Category Statistics</CardTitle>
                  <CardDescription>Detailed breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{category.value}</span>
                          <span className="text-sm text-muted-foreground">theses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Thesis Status Distribution</CardTitle>
                  <CardDescription>Current status of all theses in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                      },
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="status" type="category" width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Status Overview</CardTitle>
                  <CardDescription>Summary of thesis statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusData.map((status, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }} />
                          <span className="font-medium">{status.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{status.count}</span>
                          <Badge variant="outline">
                            {((status.count / statusData.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Most Downloaded Theses</CardTitle>
                <CardDescription>Top performing theses by download count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTheses.map((thesis, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground">{thesis.title}</h4>
                        <p className="text-sm text-muted-foreground">by {thesis.author}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{thesis.category}</Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold">{thesis.downloads.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">downloads</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
