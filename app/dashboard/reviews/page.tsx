"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, CheckCircle, XCircle, Eye, MessageSquare, Calendar, User, FileText } from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "Dr. Jane Smith",
  email: "jane.smith@university.edu",
  role: "advisor" as const,
  department: "Computer Science",
}

// Mock thesis submissions for review
const pendingReviews = [
  {
    id: "1",
    title: "Advanced Machine Learning Techniques for Medical Image Analysis",
    student: "Alice Johnson",
    studentEmail: "alice.johnson@university.edu",
    submittedDate: "2024-01-20",
    deadline: "2024-02-05",
    category: "Computer Science",
    status: "pending",
    priority: "high",
    abstract:
      "This thesis presents novel machine learning approaches for analyzing medical images, with a focus on early disease detection and diagnostic accuracy improvement.",
    files: [
      { name: "thesis-draft.pdf", size: "2.4 MB", type: "pdf" },
      { name: "source-code.zip", size: "15.2 MB", type: "zip" },
    ],
  },
  {
    id: "2",
    title: "Blockchain Implementation in Supply Chain Management",
    student: "Bob Smith",
    studentEmail: "bob.smith@university.edu",
    submittedDate: "2024-01-18",
    deadline: "2024-02-03",
    category: "Computer Science",
    status: "pending",
    priority: "medium",
    abstract:
      "An exploration of blockchain technology applications in modern supply chain management systems, focusing on transparency and traceability.",
    files: [{ name: "thesis-final.pdf", size: "3.1 MB", type: "pdf" }],
  },
]

const completedReviews = [
  {
    id: "3",
    title: "Neural Network Optimization for Real-time Processing",
    student: "Carol Davis",
    submittedDate: "2024-01-10",
    reviewedDate: "2024-01-15",
    status: "approved",
    feedback: "Excellent work with comprehensive analysis. Minor revisions needed in the conclusion section.",
    grade: "A-",
  },
  {
    id: "4",
    title: "Cybersecurity Frameworks for IoT Devices",
    student: "David Brown",
    submittedDate: "2024-01-08",
    reviewedDate: "2024-01-12",
    status: "revision-required",
    feedback:
      "Good foundation but needs more detailed analysis of security vulnerabilities. Please expand the methodology section.",
    grade: "B+",
  },
]

export default function ReviewsPage() {
  const [user] = useState(mockUser)
  const [selectedThesis, setSelectedThesis] = useState<any>(null)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewDecision, setReviewDecision] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  const handleReviewSubmit = () => {
    // TODO: Implement review submission logic
    console.log("Review submitted:", {
      thesisId: selectedThesis?.id,
      decision: reviewDecision,
      feedback: reviewFeedback,
    })
    setIsReviewDialogOpen(false)
    setReviewFeedback("")
    setReviewDecision("")
    setSelectedThesis(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "revision-required":
        return "bg-orange-100 text-orange-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Thesis Reviews</h1>
          <p className="text-muted-foreground">Review and provide feedback on student thesis submissions</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Reviews ({pendingReviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Reviews ({completedReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="space-y-4">
              {pendingReviews.map((thesis) => (
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
                              <Calendar className="h-4 w-4" />
                              Submitted {new Date(thesis.submittedDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getDaysUntilDeadline(thesis.deadline)} days left
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(thesis.priority)} variant="outline">
                            {thesis.priority} priority
                          </Badge>
                          <Badge className={getStatusColor(thesis.status)} variant="outline">
                            {thesis.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Abstract */}
                      <p className="text-sm text-muted-foreground leading-relaxed">{thesis.abstract}</p>

                      {/* Files */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Submitted Files:</h4>
                        <div className="flex flex-wrap gap-2">
                          {thesis.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">({file.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                          Deadline: {new Date(thesis.deadline).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Files
                          </Button>
                          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedThesis(thesis)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="font-heading">Review Thesis</DialogTitle>
                                <DialogDescription>
                                  Provide feedback and decision for "{selectedThesis?.title}"
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="decision">Review Decision</Label>
                                  <Select value={reviewDecision} onValueChange={setReviewDecision}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select decision" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approved">Approve</SelectItem>
                                      <SelectItem value="revision-required">Request Revisions</SelectItem>
                                      <SelectItem value="rejected">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="feedback">Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    placeholder="Provide detailed feedback for the student..."
                                    value={reviewFeedback}
                                    onChange={(e) => setReviewFeedback(e.target.value)}
                                    rows={6}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleReviewSubmit} disabled={!reviewDecision || !reviewFeedback}>
                                  Submit Review
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="space-y-4">
              {completedReviews.map((thesis) => (
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
                              <Calendar className="h-4 w-4" />
                              Reviewed {new Date(thesis.reviewedDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{thesis.grade}</Badge>
                          <Badge className={getStatusColor(thesis.status)} variant="outline">
                            {thesis.status === "approved" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {thesis.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Review Feedback:</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{thesis.feedback}</p>
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
