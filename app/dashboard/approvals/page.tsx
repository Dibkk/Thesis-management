"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  CheckCircle, XCircle, Clock, FileText, Users, Search, Calendar, Mail, MessageSquare, AlertCircle, ChevronDown, Info, Sparkles, Loader2, Eye, User, ArrowUpDown, MoreHorizontal, Filter
} from "lucide-react"
import Link from "next/link"
import { LoadingScreen } from "@/components/loading"
import { useRouter } from "next/navigation"

interface IThesis {
  _id: string;
  thesis_id: string;
  title: string;
  abstract: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  file_path: string;
  isPublic?: boolean;
  author: {
    firstName: string;
    lastName: string;
    user_id: string;
    department: string;
  };
  chapterApproval?: {
    chapter1: boolean;
    chapter2: boolean;
    chapter3: boolean;
    chapter4: boolean;
    chapter5: boolean;
  };
  unreadCommentsCount?: number;
}

export default function ApprovalsPage() {
  const [theses, setTheses] = useState<IThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null); 
  const router = useRouter();

  // New State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending_approval', 'pending_public'
  const [selectedTheses, setSelectedTheses] = useState<string[]>([]);
  const [previewThesis, setPreviewThesis] = useState<IThesis | null>(null);
  const [rejectThesisId, setRejectThesisId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Confirmation Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
      type: 'approve' | 'reject' | 'public' | 'approve_public' | 'unpublic';
      title: string;
      description: string;
      actionLabel: string;
      actionClass?: string;
      data: string; // thesisId
  } | null>(null);

  // Filter & Sort Logic
  const filteredTheses = useMemo(() => {
    let result = [...theses]; // Clone array

    // Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lower) || 
        t.thesis_id.toLowerCase().includes(lower) ||
        t.author.firstName.toLowerCase().includes(lower) ||
        t.author.lastName.toLowerCase().includes(lower)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === 'id') return a.thesis_id.localeCompare(b.thesis_id);
      return 0;
    });

    // Filter out public theses (they should disappear from this page)
    // result = result.filter(t => !t.isPublic); // REMOVED: We want to show public theses in History

    // Status Filter (only affects Pending tab logic mostly, but applied here globally for simplicity or handled in tab)
    if (filterStatus === 'pending_approval') {
        result = result.filter(t => t.status === 'pending');
    } else if (filterStatus === 'pending_public') {
        result = result.filter(t => t.status === 'approved' && !t.isPublic);
    }

    return result;
  }, [theses, searchQuery, sortBy, filterStatus]);

  // 1. ดึงข้อมูล Thesis ของ Advisor คนนี้
  useEffect(() => {
    async function fetchAdvisorTheses() {
      try {
        const res = await fetch('/api/thesis/advisor'); // (ใช้ API เดิมที่ดึงงานของ Advisor)
        const data = await res.json();
        
        if (data.success) {
          setTheses(data.theses);
        } else {
          console.error("Failed to fetch:", data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdvisorTheses();
  }, []);

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (!confirm(`Approve ${selectedTheses.length} selected theses?`)) return;
    // setLoading(true); // Don't block whole UI, maybe just show loading on button
    try {
        await Promise.all(selectedTheses.map(id => 
            fetch(`/api/thesis/${id}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            })
        ));
        // Refresh data
        const res = await fetch('/api/thesis/advisor');
        const data = await res.json();
        if (data.success) setTheses(data.theses);
        setSelectedTheses([]);
    } catch (error) {
        console.error("Bulk approve error:", error);
        alert("Some items failed to update");
    }
  }

  const handleBulkMakePublic = async () => {
    if (!confirm(`Make ${selectedTheses.length} selected theses Public?`)) return;
    try {
        await Promise.all(selectedTheses.map(async (id) => {
             // Ensure approved first (idempotent)
             await fetch(`/api/thesis/${id}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            // Make public
            return fetch(`/api/thesis/${id}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: true })
            });
        }));
        // Refresh data
        const res = await fetch('/api/thesis/advisor');
        const data = await res.json();
        if (data.success) setTheses(data.theses);
        setSelectedTheses([]);
    } catch (error) {
        console.error("Bulk make public error:", error);
        alert("Some items failed to update");
    }
  }

  const handleBulkApproveAndPublic = async () => {
    if (!confirm(`Approve & Make Public ${selectedTheses.length} selected theses?`)) return;
    try {
        await Promise.all(selectedTheses.map(async (id) => {
            // 1. Approve
            await fetch(`/api/thesis/${id}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            // 2. Make Public
            return fetch(`/api/thesis/${id}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: true })
            });
        }));
        // Refresh data
        const res = await fetch('/api/thesis/advisor');
        const data = await res.json();
        if (data.success) setTheses(data.theses);
        setSelectedTheses([]);
    } catch (error) {
        console.error("Bulk approve & public error:", error);
        alert("Some items failed to update");
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedTheses(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const toggleSelectAll = () => {
    if (selectedTheses.length === pendingTheses.length) {
        setSelectedTheses([]);
    } else {
        setSelectedTheses(pendingTheses.map(t => t._id));
    }
  }

  // 2. ฟังก์ชันกด Approve / Reject
  const handleReviewClick = (thesisId: string, status: 'approved' | 'rejected') => {
      if (status === 'rejected') {
          setRejectThesisId(thesisId);
          return;
      }
      
      setConfirmConfig({
          type: 'approve',
          title: "Approve Thesis",
          description: "Are you sure you want to approve this thesis? It will be moved to the History tab.",
          actionLabel: "Approve",
          actionClass: "bg-green-600 hover:bg-green-700",
          data: thesisId
      });
      setConfirmOpen(true);
  }

  const executeReview = async (thesisId: string, status: 'approved' | 'rejected') => {
    setProcessingId(thesisId);
    try {
        const res = await fetch(`/api/thesis/${thesisId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json();

        if (data.success) {
            setTheses(prev => prev.map(t => 
                t._id === thesisId ? { ...t, status: status } : t
            ));
        } else {
            alert(data.error || "Action failed");
        }
    } catch (error) {
        console.error("Review error:", error);
        alert("An error occurred");
    } finally {
        setProcessingId(null);
        setConfirmOpen(false);
    }
  }

  const handleRejectSubmit = async () => {
      if (!rejectThesisId || !rejectReason.trim()) return;
      setProcessingId(rejectThesisId);
      
      try {
          // 1. Update Status
          const res = await fetch(`/api/thesis/${rejectThesisId}/review`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'rejected' })
          });
          
          // 2. Post Comment (Reason)
          await fetch(`/api/thesis/${rejectThesisId}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: `[REJECTED]: ${rejectReason}` })
          });

          const data = await res.json();
          if (data.success) {
              setTheses(prev => prev.map(t => 
                  t._id === rejectThesisId ? { ...t, status: 'rejected' } : t
              ));
              setRejectThesisId(null);
              setRejectReason("");
          }
      } catch (error) {
          console.error("Reject error:", error);
      } finally {
          setProcessingId(null);
      }
  }

  const handleMakePublicClick = (thesisId: string) => {
      setConfirmConfig({
          type: 'public',
          title: "Make Thesis Public",
          description: "Are you sure you want to make this thesis public? It will be moved to the History tab.",
          actionLabel: "Make Public",
          actionClass: "bg-blue-600 hover:bg-blue-700",
          data: thesisId
      });
      setConfirmOpen(true);
  }

  const handleApproveAndPublicClick = (thesisId: string) => {
      setConfirmConfig({
          type: 'approve_public',
          title: "Approve & Make Public",
          description: "Are you sure you want to Approve AND Make this thesis Public? It will be moved to the History tab immediately.",
          actionLabel: "Approve & Public",
          actionClass: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          data: thesisId
      });
      setConfirmOpen(true);
  }

  const handleUnPublicClick = (thesisId: string) => {
      setConfirmConfig({
          type: 'unpublic',
          title: "Remove from Public",
          description: "Are you sure you want to remove this thesis from public view? It will be moved back to the Pending tab.",
          actionLabel: "Un-Public",
          actionClass: "bg-orange-600 hover:bg-orange-700",
          data: thesisId
      });
      setConfirmOpen(true);
  }

  const executeMakePublic = async (thesisId: string) => {
    setProcessingId(thesisId);
    try {
        // First ensure it's approved (redundant check but safe)
        await fetch(`/api/thesis/${thesisId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' })
        });

        // Then make public
        const res = await fetch(`/api/thesis/${thesisId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublic: true })
        });

        const data = await res.json();
        if (data.success) {
            setTheses(prev => prev.map((t: IThesis) => 
                t._id === thesisId ? { ...t, status: 'approved', isPublic: true } : t
            ));
        } else {
            alert(data.error || "Action failed");
        }
    } catch (error) {
        console.error("Make public error:", error);
    } finally {
        setProcessingId(null);
        setConfirmOpen(false);
    }
  }

  const executeApproveAndPublic = async (thesisId: string) => {
    setProcessingId(thesisId);
    try {
        // 1. Approve
        await fetch(`/api/thesis/${thesisId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' })
        });

        // 2. Make Public
        const res = await fetch(`/api/thesis/${thesisId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublic: true })
        });

        const data = await res.json();
        if (data.success) {
            setTheses(prev => prev.map((t: IThesis) => 
                t._id === thesisId ? { ...t, status: 'approved', isPublic: true } : t
            ));
        } else {
            alert(data.error || "Action failed");
        }
    } catch (error) {
        console.error("Approve & Public error:", error);
    } finally {
        setProcessingId(null);
        setConfirmOpen(false);
    }
  }

  const executeUnPublic = async (thesisId: string) => {
    setProcessingId(thesisId);
    try {
        const res = await fetch(`/api/thesis/${thesisId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublic: false })
        });

        const data = await res.json();
        if (data.success) {
            // isPublic: false -> moves back to Pending tab (because status is still 'approved')
            setTheses(prev => prev.map((t: IThesis) => 
                t._id === thesisId ? { ...t, isPublic: false } : t
            ));
        } else {
            alert(data.error || "Action failed");
        }
    } catch (error) {
        console.error("UnPublic error:", error);
    } finally {
        setProcessingId(null);
        setConfirmOpen(false);
    }
  }

  const handleConfirmAction = () => {
      if (!confirmConfig) return;
      if (confirmConfig.type === 'approve') {
          executeReview(confirmConfig.data, 'approved');
      } else if (confirmConfig.type === 'public') {
          executeMakePublic(confirmConfig.data);
      } else if (confirmConfig.type === 'approve_public') {
          executeApproveAndPublic(confirmConfig.data);
      } else if (confirmConfig.type === 'unpublic') {
          executeUnPublic(confirmConfig.data);
      }
  }

  if (loading) {
    return <LoadingScreen />
  }

  // แยกข้อมูลตามสถานะจาก filteredTheses
  // Pending Tab: Status is pending OR (Status is approved AND NOT Public)
  const pendingTheses = filteredTheses.filter(t => t.status === 'pending' || (t.status === 'approved' && !t.isPublic));
  
  // History Tab: Status is rejected OR (Status is approved AND Public)
  const historyTheses = filteredTheses.filter(t => t.status === 'rejected' || (t.status === 'approved' && t.isPublic));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <div className="mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-2">Approvals</h1>
            <p className="text-muted-foreground text-lg">Manage and review thesis approval requests</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search thesis, student..." 
                    className="pl-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border/40 focus:border-blue-500/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border/40">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter Status" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="pending_public">Pending Public</SelectItem>
                </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border/40">
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="id">ID</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-2 h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-xl shadow-lg">
                <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 transition-all duration-300 py-2 px-3 text-sm font-medium">Pending ({pendingTheses.length})</TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 transition-all duration-300 py-2 px-3 text-sm font-medium">History</TabsTrigger>
            </TabsList>
            
            {selectedTheses.length > 0 && (
                <div className="flex gap-2">
                    <Button onClick={handleBulkApprove} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2 shadow-lg shadow-green-500/30">
                        <CheckCircle className="h-4 w-4" /> Approve ({selectedTheses.length})
                    </Button>
                    <Button onClick={handleBulkMakePublic} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/30">
                        <Eye className="h-4 w-4" /> Public ({selectedTheses.length})
                    </Button>
                    <Button onClick={handleBulkApproveAndPublic} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 shadow-lg shadow-purple-500/30">
                        <Sparkles className="h-4 w-4" /> All ({selectedTheses.length})
                    </Button>
                </div>
            )}
        </div>

        {/* --- Tab: Pending --- */}
        <TabsContent value="pending" className="space-y-4">
          {pendingTheses.length > 0 && (
              <div className="flex items-center gap-2 mb-2 px-2">
                  <Checkbox 
                    checked={selectedTheses.length === pendingTheses.length && pendingTheses.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
              </div>
          )}

          {pendingTheses.length === 0 ? (
             <div className="col-span-full text-center py-12 border-2 border-dashed rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                <p className="font-medium">No pending requests. You're all caught up!</p>
             </div>
          ) : (
            pendingTheses.map((thesis) => (
                <Card key={thesis._id} className={`hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:-translate-y-0.5 ${
                    selectedTheses.includes(thesis._id) ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20' : ''
                }`}>
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <Checkbox 
                            checked={selectedTheses.includes(thesis._id)}
                            onCheckedChange={() => toggleSelect(thesis._id)}
                            className="mt-1"
                        />
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 font-medium">{thesis.thesis_id}</Badge>
                                <span className="text-xs text-muted-foreground font-medium">{new Date(thesis.createdAt).toLocaleDateString()}</span>
                                {thesis.unreadCommentsCount && thesis.unreadCommentsCount > 0 ? (
                                    <Badge variant="secondary" className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 gap-1 h-5 shadow-sm">
                                        <MessageSquare className="h-3 w-3" /> {thesis.unreadCommentsCount}
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/dashboard/thesis/${thesis._id}`} className="block group">
                                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{thesis.title}</h4>
                                </Link>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setPreviewThesis(thesis)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Chapter Progress */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Progress:</span>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(num => {
                                        const key = `chapter${num}` as keyof typeof thesis.chapterApproval;
                                        const isPassed = thesis.chapterApproval?.[key];
                                        return (
                                            <div key={num} className={`h-2 w-2 rounded-full ${isPassed ? 'bg-green-500' : 'bg-gray-200'}`} title={`Chapter ${num}`} />
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" /> {thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" /> {thesis.author?.department || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto pl-8 md:pl-0">
                        {thesis.status === 'approved' ? (
                             <Button 
                                onClick={() => handleMakePublicClick(thesis._id)}
                                disabled={processingId === thesis._id}
                                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                            >
                                {processingId === thesis._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                                Make Public
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    onClick={() => handleReviewClick(thesis._id, 'approved')}
                                    disabled={processingId === thesis._id}
                                    className="flex-1 md:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
                                >
                                    {processingId === thesis._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    Approve
                                </Button>
                                <Button 
                                    onClick={() => handleApproveAndPublicClick(thesis._id)}
                                    disabled={processingId === thesis._id}
                                    className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30"
                                >
                                    {processingId === thesis._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Approve & Public
                                </Button>
                            </>
                        )}
                        
                        <Button 
                            variant="destructive"
                            onClick={() => handleReviewClick(thesis._id, 'rejected')}
                            disabled={processingId === thesis._id}
                            className="flex-1 md:flex-none"
                        >
                             {processingId === thesis._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Reject
                        </Button>
                    </div>
                </CardContent>
                </Card>
            ))
          )}
        </TabsContent>
        
        {/* --- Tab: History --- */}
        <TabsContent value="history" className="space-y-4">
          {historyTheses.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">No history found.</div>
          ) : (
             historyTheses.map((thesis) => (
                <Card key={thesis._id} className="opacity-90 hover:opacity-100 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                         <Badge variant={thesis.status === 'approved' ? 'secondary' : 'destructive'} className={`capitalize font-medium ${
                           thesis.status === 'approved' 
                             ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0' 
                             : ''
                         }`}>
                            {thesis.status}
                         </Badge>
                         <span className="text-xs text-muted-foreground">Updated: {new Date(thesis.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-semibold text-lg text-muted-foreground">{thesis.title}</h4>
                      <p className="text-sm text-muted-foreground">
                         Student: {thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                        {thesis.isPublic && (
                            <Button 
                                onClick={() => handleUnPublicClick(thesis._id)}
                                disabled={processingId === thesis._id}
                                variant="outline"
                                size="sm"
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                                {processingId === thesis._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                                Un-Public
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/thesis/${thesis._id}`}>View Details</Link>
                        </Button>
                    </div>
                  </CardContent>
                </Card>
             ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Preview Dialog */}
      <Dialog open={!!previewThesis} onOpenChange={(open) => !open && setPreviewThesis(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{previewThesis?.thesis_id}</Badge>
                    <Badge className={previewThesis?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {previewThesis?.status}
                    </Badge>
                </div>
                <DialogTitle className="text-2xl font-heading leading-tight">{previewThesis?.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1"><User className="h-4 w-4" /> {previewThesis?.author.firstName} {previewThesis?.author.lastName}</span>
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {previewThesis?.author.department}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {previewThesis && new Date(previewThesis.updatedAt).toLocaleDateString()}</span>
                </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-2 h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-border/40 shadow-lg">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="files">Files & Progress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" /> Abstract
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {previewThesis?.abstract || "No abstract available."}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" /> Chapter Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {[1,2,3,4,5].map(num => {
                                    const key = `chapter${num}` as keyof IThesis['chapterApproval'];
                                    const isPassed = previewThesis?.chapterApproval?.[key];
                                    return (
                                        <div key={num} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${isPassed ? 'bg-green-50 border-green-200' : 'bg-muted/20'}`}>
                                            <span className="text-xs font-medium mb-1">Ch.{num}</span>
                                            {isPassed ? <CheckCircle className="h-4 w-4 text-green-600" /> : <div className="h-4 w-4 rounded-full border-2 border-muted" />}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-orange-500" /> Current File
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg"><FileText className="h-5 w-5 text-red-500" /></div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-sm truncate max-w-[200px]">{previewThesis?.file_path?.split('/').pop() || "No file"}</p>
                                        <p className="text-xs text-muted-foreground">Latest Version</p>
                                    </div>
                                </div>
                                {previewThesis && (
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={`/api/thesis/${previewThesis._id}/file`} download target="_blank">Download</a>
                                    </Button>
                                )}
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setPreviewThesis(null)}>Close</Button>
                <Button asChild>
                    <Link href={`/dashboard/thesis/${previewThesis?._id}`}>Open Full Details</Link>
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectThesisId} onOpenChange={(open) => !open && setRejectThesisId(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reject Thesis</DialogTitle>
                <DialogDescription>
                    Please provide a reason for rejection. This will be sent to the student.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea 
                    placeholder="Reason for rejection..." 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setRejectThesisId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleRejectSubmit} disabled={!rejectReason.trim() || !!processingId}>
                    {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Reject
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmConfig?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleConfirmAction}
                className={confirmConfig?.actionClass}
            >
                {confirmConfig?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  </div>
  )
}