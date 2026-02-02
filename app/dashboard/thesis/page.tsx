// app/dashboard/thesis/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, MessageSquare, UploadCloud, Download, Edit, AlertCircle, Trash2, CheckCircle, Clock, XCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { LoadingScreen } from "@/components/loading"

interface IThesis {
  _id: string;
  thesis_id: string;
  title: string;
  status: string;
  file_path: string;
  advisor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  chapterApproval?: {
    chapter1: boolean;
    chapter2: boolean;
    chapter3: boolean;
    chapter4: boolean;
    chapter5: boolean;
  };
}

export default function MyThesisPage() {
  const [theses, setTheses] = useState<IThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyTheses() {
      try {
        const res = await fetch('/api/thesis/my');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success) {
            setTheses(data.theses);
          } else {
            throw new Error(data.error || 'Failed to fetch theses');
          }
        } catch (e) {
          console.error("JSON Parse Error. Response text:", text);
          setError(`Invalid server response: ${text.substring(0, 200)}`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTheses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this thesis? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/thesis/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {

        setTheses(prev => prev.filter(t => t._id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting.");
    } finally {
      setDeletingId(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 backdrop-blur-sm px-3 py-1 font-semibold">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 shadow-lg shadow-amber-500/10 backdrop-blur-sm px-3 py-1 font-semibold">
            <Clock className="h-3 w-3 mr-1.5 animate-pulse" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-900 dark:text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/10 backdrop-blur-sm px-3 py-1 font-semibold">
            <XCircle className="h-3 w-3 mr-1.5" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 px-3 py-1">
            {status}
          </Badge>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    },
    exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3 } }
  };

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive">Failed to load theses</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="px-4 py-8">
        <motion.div
          className="mb-10 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Glass morphism header background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl -z-10 transform -skew-y-1" />
          
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-purple-500/10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <motion.div
                  className="flex items-center gap-3 mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    My Thesis
                  </h1>
                </motion.div>
                <motion.p 
                  className="text-muted-foreground text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Track and manage all your thesis submissions in one beautiful place
                </motion.p>
              </div>
              
              {theses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 border-0 px-6 py-6 text-base font-semibold transition-all duration-300">
                    <Link href="/dashboard/upload">
                      <UploadCloud className="h-5 w-5 mr-2 animate-bounce" />
                      New Submission
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

      {theses.length === 0 ? (
        <motion.div
          className="text-center p-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border-2 border-dashed border-purple-300/50 dark:border-purple-700/50 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ambient gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 -z-10" />
          
          <motion.div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FileText className="h-10 w-10 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            No Thesis Found
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
            You haven't uploaded any thesis yet. Start by submitting your research proposal or draft.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 border-0 px-8 py-6 text-lg font-semibold">
              <Link href="/dashboard/upload">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Uploading
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {theses.map((thesis) => (
              <motion.div 
                key={thesis._id} 
                variants={itemVariants} 
                layout 
                exit="exit"
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
                className="px-1"
              >
                <Card className="group relative rounded-3xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none" />
                  
                  <CardHeader className="relative pb-6 border-b border-gray-200/50 dark:border-gray-700/50 space-y-4">
                    {/* Top row: Title info and Delete button */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge variant="outline" className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 border-0 font-mono text-xs px-3 py-1 shadow-sm">
                            {thesis.thesis_id}
                          </Badge>
                          {getStatusBadge(thesis.status)}
                        </div>
                        
                        <CardTitle className="font-heading text-2xl leading-tight">
                          <Link href={`/dashboard/thesis/${thesis._id}`} className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-400 dark:hover:to-purple-400 transition-all duration-200">
                            {thesis.title}
                          </Link>
                        </CardTitle>
                        
                        <CardDescription className="flex items-center gap-2 text-base">
                          <span className="text-muted-foreground">Advisor:</span>
                          <span className="font-semibold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {thesis.advisor ? `${thesis.advisor.firstName} ${thesis.advisor.lastName}` : 'Unknown Advisor'}
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="text-muted-foreground">
                            {new Date(thesis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </CardDescription>
                      </div>

                      {/* Delete Button */}
                      <motion.div 
                        className="flex gap-2 self-start"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(thesis._id)}
                          disabled={deletingId === thesis._id}
                          className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-700/90 dark:to-red-700/90 text-red-600 dark:text-white hover:from-red-100 hover:to-rose-100 dark:hover:from-red-700 dark:hover:to-red-700 border border-red-200 dark:border-red-600 hover:border-red-300 dark:hover:border-red-500 shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                        >
                          {deletingId === thesis._id ? (
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </motion.div>
                    </div>

                    {/* Enhanced Progress Bar - Full Width */}
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground">Chapter Progress</span>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                          {(() => {
                            if (thesis.status === 'approved') return "100%";
                            if (!thesis.chapterApproval) return "0%";
                            const passed = Object.values(thesis.chapterApproval).filter(Boolean).length;
                            return `${Math.round((passed / 5) * 100)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(() => {
                              if (thesis.status === 'approved') return 100;
                              if (!thesis.chapterApproval) return 0;
                              const passed = Object.values(thesis.chapterApproval).filter(Boolean).length;
                              return (passed / 5) * 100;
                            })()}%`
                          }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        >
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-50 blur-sm" />
                        </motion.div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6 pb-6">
                    <div className="flex flex-wrap gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="default" size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 border-0 transition-all duration-300">
                          <Link href={`/dashboard/thesis/${thesis._id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" asChild className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-200 transition-all duration-300">
                          <Link href={`/dashboard/thesis/${thesis._id}#feedback`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Feedback
                          </Link>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" asChild className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 hover:text-green-700 dark:hover:text-green-200 transition-all duration-300">
                          <a href={`/api/thesis/${thesis._id}/file`} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      </div>
    </div>
  )
}