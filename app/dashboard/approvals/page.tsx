"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, Eye, Search, Filter, Calendar, User } from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "Dr. Admin",
  email: "admin@university.edu",
  role: "admin" as const,
  department: "Administration",
}

// Mock thesis data for approval
const pendingApprovals = [
  {
    id: "1",
    title: "Machine Learning Applications in Healthcare Diagnosis",
    student: "Alice Johnson",
    advisor: "Dr. Jane Smith",
    submittedDate: "2024-01-20",
    reviewedDate: "2024-01-25",
    category: "Computer Science",
    department: "Computer Science",
    status: "reviewed",
    reviewStatus: "approved",
    grade: "A-",
    reviewerFeedback: "Excellent research with comprehensive analysis and practical applications.",
  },
  {
    id: "2",
    title: "Blockchain Security in Financial Systems",
    student: "Bob Smith",
    advisor: "Dr. Michael Johnson",
    submittedDate: "2024-01-18",
    reviewedDate: "2024-01-23",
    category: "Computer Science",
    department: "Computer Science",
    status: "reviewed",
    reviewStatus: "approved",
    grade: "B+",
    reviewerFeedback: "Good work with solid technical implementation. Minor improvements suggested.",
  },
]

const approvedTheses = [
  {
    id: "3",
    title: "Neural Network Optimization for Real-time Processing",
    student: "Carol Davis",
    advisor: "Dr. Sarah Wilson",
    approvedDate: "2024-01-15",
    publishedDate: "2024-01-16",
    category: "Computer Science",
    status: "published",
    grade: "A",
  },
  {
    id: "4",
    title: "Sustainable Energy Solutions for Urban Development",
    student: "David Brown",
    advisor: "Dr. Robert Lee",
    approvedDate: "2024-01-12",
    publishedDate: "2024-01-13",
    category: "Engineering",
    status: "published",
    grade: "A-",
  },
]

export default function ApprovalsPage() {
  const [user] = useState(mockUser)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedThesis, setSelectedThesis] = useState<any>(null)

  const handleApprove = (thesisId: string) => {
    // TODO: Implement approval logic
    console.log("Approving thesis:", thesisId)
  }

  const handleReject = (thesisId: string) => {
    // TODO: Implement rejection logic
    console.log("Rejecting thesis:", thesisId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "published":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "revision-required":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Thesis Approvals</h1>
          <p className="text-muted-foreground">Review and approve thesis submissions for publication</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title, student, or advisor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Approval ({pendingApprovals.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedTheses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="space-y-4">
              {pendingApprovals.map((thesis) => (
                <Card key={thesis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-heading font-semibold text-foreground">{thesis.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {thesis.student}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Advisor: {thesis.advisor}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Reviewed {new Date(thesis.reviewedDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{thesis.grade}</Badge>
                          <Badge className={getReviewStatusColor(thesis.reviewStatus)} variant="outline">
                            {thesis.reviewStatus}
                          </Badge>
                          <Badge className={getStatusColor(thesis.status)} variant="outline">
                            {thesis.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Review Feedback */}
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Advisor Review:</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{thesis.reviewerFeedback}</p>
                      </div>

                      {/* Thesis Details */}
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Category:</span> {thesis.category}
                        </div>
                        <div>
                          <span className="font-medium">Department:</span> {thesis.department}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>{" "}
                          {new Date(thesis.submittedDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Reviewed:</span>{" "}
                          {new Date(thesis.reviewedDate).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Thesis
                        </Button>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive bg-transparent"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Thesis</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject this thesis? This action cannot be undone and the
                                  student will be notified.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(thesis.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Reject Thesis
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve & Publish
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approve & Publish Thesis</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will approve the thesis and make it available in the public repository. The
                                  student and advisor will be notified.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApprove(thesis.id)}>
                                  Approve & Publish
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <div className="space-y-4">
              {approvedTheses.map((thesis) => (
                <Card key={thesis.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-heading font-semibold text-foreground">{thesis.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {thesis.student}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Advisor: {thesis.advisor}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Published {new Date(thesis.publishedDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{thesis.grade}</Badge>
                          <Badge className={getStatusColor(thesis.status)} variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {thesis.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Category:</span> {thesis.category}
                        </div>
                        <div>
                          <span className="font-medium">Approved:</span>{" "}
                          {new Date(thesis.approvedDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Published:</span>{" "}
                          {new Date(thesis.publishedDate).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-4 border-t border-border">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View in Repository
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
