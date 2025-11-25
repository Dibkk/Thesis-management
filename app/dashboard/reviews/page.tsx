"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // เพิ่ม useRouter
// 1. ลบ DashboardLayout ออกจาก import
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
import { Clock, CheckCircle, XCircle, Eye, MessageSquare, Calendar, User, FileText, Loader2 } from "lucide-react"

// 2. เพิ่ม Interface User จริง
interface User {
  id: string
  firstname: string 
  lastname: string  
  email: string
  role: string
  department: string 
  user_id: string    
}

// Mock thesis submissions for review (อันนี้ใช้ Mock ไปก่อน เดี๋ยวค่อยมาแก้เป็น Data จริง)
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
]

const completedReviews = [

]

export default function ReviewsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter()

  const [selectedThesis, setSelectedThesis] = useState<any>(null)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewDecision, setReviewDecision] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)


  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const res = await fetch('/api/auth/me'); 
        if (!res.ok) { 
          throw new Error('Not authenticated');
        }
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          throw new Error(data.error || 'Failed to fetch user');
        }
      } catch (error) {
        console.error("Auth Error:", error);
        router.push('/login');
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [router]);


  const handleReviewSubmit = () => {
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
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "revision-required": return "bg-orange-100 text-orange-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loadingUser || !user) { 
    return (
      <div className="flex items-center justify-center p-8"> 
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
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

        {/* (Completed Tabs Content - เอาไว้เหมือนเดิม หรือจะลบ Mock data ออกก็ได้) */}
      </Tabs>
    </div>
  )
}