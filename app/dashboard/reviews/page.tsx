"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { Clock, CheckCircle, XCircle, Eye, MessageSquare, Calendar, User, FileText, Loader2, ExternalLink, Search, Percent } from "lucide-react"
import Link from "next/link"
import { LoadingScreen } from "@/components/loading"

interface IThesis {
  _id: string;
  thesis_id: string;
  title: string;
  abstract: string;
  category: string;
  status: string;
  file_path: string;
  createdAt: string;
  updatedAt: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  chapterApproval: {
    chapter1: boolean;
    chapter2: boolean;
    chapter3: boolean;
    chapter4: boolean;
    chapter5: boolean;
  };
  similarityScore?: number;
  unreadCommentsCount?: number;
}

export default function ReviewsPage() {
  const [theses, setTheses] = useState<IThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [selectedThesis, setSelectedThesis] = useState<IThesis | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewDecision, setReviewDecision] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resUser = await fetch('/api/auth/me');
        if (!resUser.ok) throw new Error('Not authenticated');
        const dataUser = await resUser.json();
        
        if (dataUser.success && dataUser.user.role === 'advisor') {
            const resThesis = await fetch('/api/thesis/advisor');
            const dataThesis = await resThesis.json();
            if (dataThesis.success) {
              setTheses(dataThesis.theses);
            }
        } else {
             router.push('/dashboard');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleReviewSubmit = async () => {
    if (!selectedThesis || !reviewDecision) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/thesis/${selectedThesis._id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            status: reviewDecision, 
            comment: reviewFeedback 
        })
      });

      const data = await res.json();

      if (data.success) {
        setTheses(prev => prev.map(t => 
            t._id === selectedThesis._id ? { ...t, status: reviewDecision, updatedAt: new Date().toISOString() } : t
        ));
        setIsReviewDialogOpen(false);
        setReviewFeedback("");
        setReviewDecision("");
        setSelectedThesis(null);
      } else {
        alert(data.error || "Review failed");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      case "approved": return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
      case "rejected": return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
      default: return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const getStatusBorderColor = (status: string) => {
      switch (status) {
          case "pending": return "border-l-amber-400";
          case "approved": return "border-l-emerald-500";
          case "rejected": return "border-l-rose-500";
          default: return "border-l-slate-300";
      }
  }

  const getScoreColor = (score: number) => {
      if (score < 20) return "text-emerald-600 bg-emerald-50 border-emerald-100";
      if (score < 50) return "text-amber-600 bg-amber-50 border-amber-100";
      return "text-rose-600 bg-rose-50 border-rose-100";
  }

  const getApprovedChaptersCount = (chapters: any) => {
      if (!chapters) return 0;
      return Object.values(chapters).filter((status: any) => status === true).length;
  }

  const getDaysUntilDeadline = (createdAt: string) => {
    const created = new Date(createdAt);
    const deadline = new Date(created);
    deadline.setDate(created.getDate() + 30);
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  // Filter & Sort Logic
  const filteredTheses = theses.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.author?.firstName + ' ' + t.author?.lastName).toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
  }).sort((a, b) => {
      if (sortOption === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortOption === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return 0;
  });

  const pendingReviews = filteredTheses.filter(t => t.status === 'pending');
  const completedReviews = filteredTheses.filter(t => t.status !== 'pending');

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl -z-10"/>
          
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-purple-500/10 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-2">Thesis Reviews</h1>
                <p className="text-muted-foreground text-lg">Manage and track student thesis submissions</p>
              </div>
              
              <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-xl border border-white/40 dark:border-gray-700/40 shadow-lg">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-purple-400 placeholder:text-muted-foreground h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="h-6 w-px bg-border" />
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0 h-9 text-foreground font-medium">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

      <Tabs defaultValue="pending" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-xl shadow-lg">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/30 transition-all duration-300 py-2.5 px-3 text-sm font-medium">
              Pending ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-green-500/30 transition-all duration-300 py-2.5 px-3 text-sm font-medium">
              Completed ({completedReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* --- Tab: Pending --- */}
        <TabsContent value="pending" className="space-y-6">
          {pendingReviews.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-500">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                <p className="text-sm">No pending reviews at the moment.</p>
             </div>
          ) : (
             <div className="grid gap-4">
              {pendingReviews.map((thesis) => (
                <Card key={thesis._id} className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 ${getStatusBorderColor(thesis.status)} overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl`}>
                  {/* Unread Indicator */}
                  {thesis.unreadCommentsCount && thesis.unreadCommentsCount > 0 ? (
                      <div className="absolute top-3 right-3 z-10">
                          <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                          </span>
                      </div>
                  ) : null}

                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5">
                      {/* Header Section */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                  {thesis.category || "Thesis"}
                              </Badge>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(thesis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <div className={`flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md text-xs ${getDaysUntilDeadline(thesis.createdAt) < 7 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                                <Clock className="h-3.5 w-3.5" />
                                {getDaysUntilDeadline(thesis.createdAt)} days left
                              </div>
                          </div>
                          <Link href={`/dashboard/thesis/${thesis._id}`} className="block group-hover:text-primary transition-colors">
                             <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                 {thesis.title}
                             </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : 'Unknown Student'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2.5">
                          <Badge className={`${getStatusColor(thesis.status)} px-3.5 py-1.5 text-xs font-semibold shadow-md`} variant="outline">
                            <Clock className="h-3.5 w-3.5 mr-1.5 inline" />
                            {thesis.status}
                          </Badge>
                          <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-sm ${getScoreColor(thesis.similarityScore || 0)}`}>
                              <Percent className="h-3.5 w-3.5" />
                              {thesis.similarityScore ?? 0}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Section - Enhanced */}
                      <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/60 dark:border-gray-700/40 shadow-md">
                          <div className="flex justify-between items-end mb-2.5">
                              <div className="space-y-1">
                                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Chapter Progress</span>
                                  <div className="flex items-baseline gap-1.5">
                                      <span className={`text-2xl font-bold ${getApprovedChaptersCount(thesis.chapterApproval) === 5 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
                                          {getApprovedChaptersCount(thesis.chapterApproval)}
                                      </span>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">/ 5 Chapters</span>
                                  </div>
                              </div>
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm ${
                                  getApprovedChaptersCount(thesis.chapterApproval) === 5 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                                  {Math.round((getApprovedChaptersCount(thesis.chapterApproval) / 5) * 100)}%
                              </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                              <div 
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                                      getApprovedChaptersCount(thesis.chapterApproval) === 5 
                                          ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-400/50" 
                                          : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-400/30"
                                  }`}
                                  style={{ width: `${(getApprovedChaptersCount(thesis.chapterApproval) / 5) * 100}%` }}
                              />
                          </div>
                      </div>

                      {/* Abstract Preview */}
                      {thesis.abstract && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                              {thesis.abstract}
                          </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex gap-3">
                          <Button variant="default" size="sm" asChild className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-md hover:shadow-lg transition-all rounded-lg px-4">
                            <Link href={`/dashboard/thesis/${thesis._id}`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Review Details
                            </Link>
                          </Button>
                          
                          <Button variant="outline" size="sm" asChild className="border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 rounded-lg shadow-sm">
                            <a href={`/api/thesis/${thesis._id}/file`} download target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View File
                            </a>
                          </Button>
                        </div>

                        <Dialog open={isReviewDialogOpen && selectedThesis?._id === thesis._id} onOpenChange={(open) => {
                              setIsReviewDialogOpen(open);
                              if(!open) setSelectedThesis(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedThesis(thesis)} className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Quick Decision
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Decision</DialogTitle>
                                <DialogDescription>Make a decision for "{selectedThesis?.title}"</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Decision</Label>
                                  <Select value={reviewDecision} onValueChange={setReviewDecision}>
                                    <SelectTrigger><SelectValue placeholder="Select decision" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approved">Approve</SelectItem>
                                      <SelectItem value="rejected">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Quick Note (Optional)</Label>
                                  <Textarea 
                                    value={reviewFeedback} 
                                    onChange={(e) => setReviewFeedback(e.target.value)} 
                                    placeholder="Add a short note..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleReviewSubmit} disabled={!reviewDecision || isSubmitting}>
                                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
             </div>
          )}
        </TabsContent>

        {/* --- Tab: Completed --- */}
        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-4">
            {completedReviews.map((thesis) => (
              <Card key={thesis._id} className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 ${getStatusBorderColor(thesis.status)} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden`}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5">
                    {/* Header Section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                             <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                  {thesis.category || "Thesis"}
                             </Badge>
                             <span className="text-xs text-slate-400">•</span>
                             <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                                 <Calendar className="h-3 w-3" />
                                 Reviewed {new Date(thesis.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                        </div>
                        <Link href={`/dashboard/thesis/${thesis._id}`} className="block group-hover:text-primary transition-colors">
                            <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                {thesis.title}
                            </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm">
                              <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                              {thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : 'Unknown Student'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2.5">
                          <Badge className={`${getStatusColor(thesis.status)} px-3.5 py-1.5 text-xs font-semibold shadow-md`} variant="outline">
                              {thesis.status === 'approved' ? <CheckCircle className="h-3.5 w-3.5 mr-1.5 inline" /> : <XCircle className="h-3.5 w-3.5 mr-1.5 inline" />}
                              {thesis.status}
                          </Badge>
                          <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-sm ${getScoreColor(thesis.similarityScore || 0)}`}>
                              <Percent className="h-3.5 w-3.5" />
                              {thesis.similarityScore ?? 0}%
                          </div>
                      </div>
                    </div>

                    {/* Progress Section - Enhanced */}
                    <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/60 dark:border-gray-700/40 shadow-md">
                        <div className="flex justify-between items-end mb-2.5">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Final Progress</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className={`text-2xl font-bold ${getApprovedChaptersCount(thesis.chapterApproval) === 5 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {getApprovedChaptersCount(thesis.chapterApproval)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">/ 5 Chapters</span>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm ${
                                getApprovedChaptersCount(thesis.chapterApproval) === 5 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                {Math.round((getApprovedChaptersCount(thesis.chapterApproval) / 5) * 100)}%
                            </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    getApprovedChaptersCount(thesis.chapterApproval) === 5 
                                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-400/50" 
                                        : "bg-gradient-to-r from-slate-400 to-slate-500"
                                }`}
                                style={{ width: `${(getApprovedChaptersCount(thesis.chapterApproval) / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Abstract Preview */}
                    {thesis.abstract && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                            {thesis.abstract}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        <Button variant="default" size="sm" asChild className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-md hover:shadow-lg transition-all rounded-lg px-4">
                            <Link href={`/dashboard/thesis/${thesis._id}`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Full Details
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 rounded-lg shadow-sm">
                            <a href={`/api/thesis/${thesis._id}/file`} download target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View File
                            </a>
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
    </div>
  )
}