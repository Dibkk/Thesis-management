"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Download, Users, BookOpen, MessageSquare, UploadCloud, ChevronDown, Calendar as CalendarIcon, Mail, Zap, MoreHorizontal, XCircle, Sparkles, Settings } from "lucide-react"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { LoadingScreen } from "@/components/loading"
import { AddUserDialog } from "@/components/add-user-dialog"

interface User {
  id: string
  firstname: string 
  lastname: string  
  email: string
  role: string
  department: string 
  user_id: string    
}

interface IThesis {
  _id: string;
  thesis_id: string;
  title: string;
  abstract: string;
  status: string;
  file_path: string;
  keywords: string[];
  category: string;
  author?: {
    firstName: string;
    lastName: string;
    email: string;
    user_id: string;
    department: string;
  };
  advisor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  chapterApproval?: {
    chapter1: boolean;
    chapter2: boolean;
    chapter3: boolean;
    chapter4: boolean;
    chapter5: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface IMeeting {
  _id: string;
  title: string;
  date: string;
  status: string;
  thesis?: {
    title: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [theses, setTheses] = useState<IThesis[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<IMeeting[]>([]); // New state
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [selectedThesisId, setSelectedThesisId] = useState<string>("");

  const router = useRouter()

  const [latestFeedback, setLatestFeedback] = useState<string | null>(null);

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTheses: 0,
    pendingReviews: 0,
    activeAdvisors: 0
  });

  useEffect(() => {
    async function fetchData() {
      setLoadingUser(true);
      try {
        const resUser = await fetch('/api/auth/me'); 
        if (!resUser.ok) throw new Error('Not authenticated');
        const dataUser = await resUser.json();
        
        if (dataUser.success) {
          setUser(dataUser.user);
          
          // Fetch Upcoming Meetings
          const resMeetings = await fetch('/api/meetings/upcoming');
          const dataMeetings = await resMeetings.json();
          if (dataMeetings.success) {
             setUpcomingEvents(dataMeetings.meetings);
          }

          if (dataUser.user.role === 'student') {
            const resThesis = await fetch('/api/thesis/my');
            const dataThesis = await resThesis.json();
            if (dataThesis.success) {
              setTheses(dataThesis.theses);
              if (dataThesis.theses.length > 0) {
                setSelectedThesisId(dataThesis.theses[0]._id);
              }
            }
          } else if (dataUser.user.role === 'advisor') {
            const resThesis = await fetch('/api/thesis/advisor');
            const dataThesis = await resThesis.json();
            if (dataThesis.success) {
              setTheses(dataThesis.theses);
            }
          }
        } else {
          throw new Error(dataUser.error);
        }
      } catch (error) {
        console.error("Auth Error:", error);
        router.push('/login');
      } finally {
        setLoadingUser(false);
      }
    }
    fetchData();
  }, [router])

  // Fetch latest feedback when selectedThesisId changes
  useEffect(() => {
    if (!selectedThesisId) {
      setLatestFeedback(null);
      return;
    }

    async function fetchFeedback() {
      try {
        const res = await fetch(`/api/thesis/${selectedThesisId}/comments`);
        const data = await res.json();
        if (data.success && data.comments.length > 0) {
          // Filter for advisor comments and get the last one
          const advisorComments = data.comments.filter((c: any) => c.user.role === 'advisor');
          if (advisorComments.length > 0) {
            setLatestFeedback(advisorComments[advisorComments.length - 1].content);
          } else {
            setLatestFeedback(null);
          }
        } else {
          setLatestFeedback(null);
        }
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
        setLatestFeedback(null);
      }
    }

    fetchFeedback();
    fetchFeedback();
  }, [selectedThesisId]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchAdminData = async () => {
        try {
          const [resUsers, resTheses] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/thesis/all')
          ]);
          
          const dataUsers = await resUsers.json();
          const dataTheses = await resTheses.json();

          if (dataUsers.success && dataTheses.success) {
            setAdminStats({
              totalUsers: dataUsers.users.length,
              totalTheses: dataTheses.theses.length,
              pendingReviews: dataTheses.theses.filter((t: IThesis) => t.status === 'pending').length,
              activeAdvisors: dataUsers.users.filter((u: User) => u.role === 'advisor').length
            });
            setTheses(dataTheses.theses); // Keep theses for activity log
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      };
      fetchAdminData();
    }
  }, [user]);

  if (loadingUser || !user) { 
    return <LoadingScreen />
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 backdrop-blur-sm px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10 backdrop-blur-sm px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5 animate-pulse" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/10 backdrop-blur-sm px-3 py-1">
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

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const activeThesis = theses.find(t => t._id === selectedThesisId) || null;

  // Logic คำนวณ Progress
  let progressValue = 0;
  let progressText = "Not Started";
  let passedChaptersCount = 0;

  if (activeThesis) {
      if (activeThesis.status.toLowerCase() === 'approved') {
          progressValue = 100;
          progressText = "Completed";
          passedChaptersCount = 5;
      } else if (activeThesis.chapterApproval) {
          const chapters = Object.values(activeThesis.chapterApproval);
          passedChaptersCount = chapters.filter(c => c === true).length;
          progressValue = (passedChaptersCount / 5) * 100;
          
          if (progressValue === 0) progressText = "Started";
          else if (progressValue < 50) progressText = "In Progress";
          else if (progressValue < 100) progressText = "Near Completion";
          else progressText = "Waiting Approval";
      }
  }

  // --- Quick Actions Component ---
  const QuickActions = () => (
    <div className="flex gap-3 overflow-x-auto pb-2 px-1 py-2 -mx-1 -my-2">
      {user.role === 'student' ? (
        <>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-300" asChild>
              <Link href="/dashboard/upload">
                <UploadCloud className="h-4 w-4" /> Upload New Version
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-all duration-300" asChild>
              <Link href={`/dashboard/thesis/${selectedThesisId}#feedback`}>
                <MessageSquare className="h-4 w-4" /> View Feedback
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 transition-all duration-300">
               <Mail className="h-4 w-4" /> Contact Advisor
            </Button>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300" asChild>
               <Link href="/dashboard/approvals">
                 <CheckCircle className="h-4 w-4 text-green-500" /> Review Pending
               </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300" asChild>
               <Link href="/dashboard/students">
                 <Users className="h-4 w-4 text-blue-500" /> My Students
               </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300">
               <Mail className="h-4 w-4 text-orange-500" /> Email All
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );

  // --- Timeline Component ---
  const ActivityTimeline = () => (
    <Card className="rounded-2xl border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
            <Clock className="h-5 w-5 text-white" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
          {/* Mock Timeline Items based on thesis updates */}
          {theses.slice(0, 3).map((thesis, index) => (
            <div key={index} className="mb-6 ml-6 relative group">
              <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary group-hover:scale-110 transition-transform">
                 {index === 0 ? <Zap className="h-3 w-3 text-primary" /> : <FileText className="h-3 w-3 text-muted-foreground" />}
              </span>
              <h4 className="text-sm font-semibold">{thesis.title}</h4>
              <p className="text-xs text-muted-foreground mb-1">
                {index === 0 ? "Updated recently" : "Submitted"} • {new Date(thesis.updatedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Status changed to <span className="font-medium text-foreground">{thesis.status}</span>
              </p>
            </div>
          ))}
          {theses.length === 0 && <p className="ml-6 text-sm text-muted-foreground">No recent activity.</p>}
        </div>
      </CardContent>
    </Card>
  );

  // --- Calendar Component ---
  const UpcomingEvents = () => (
    <Card className="rounded-2xl border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
           <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-md">
             <CalendarIcon className="h-5 w-5 text-white" />
           </div>
           Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         {upcomingEvents.length > 0 ? (
           upcomingEvents.map((event) => (
             <div key={event._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-12 text-center bg-background rounded-lg border p-1">
                   <div className="text-[10px] text-red-500 font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                   <div className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</div>
                </div>
                <div className="overflow-hidden">
                   <p className="font-medium text-sm truncate">{event.title}</p>
                   <p className="text-xs text-muted-foreground truncate">
                      {event.thesis?.title || "Meeting"}
                   </p>
                </div>
             </div>
           ))
         ) : (
           <div className="text-center py-6 text-muted-foreground text-sm">
              No upcoming events.
           </div>
         )}
      </CardContent>
    </Card>
  );

  const renderStudentDashboard = () => {
    // Data for Bar Chart
    const chartData = [
      { name: 'Ch 1', completed: activeThesis?.chapterApproval?.chapter1 ? 100 : 0 },
      { name: 'Ch 2', completed: activeThesis?.chapterApproval?.chapter2 ? 100 : 0 },
      { name: 'Ch 3', completed: activeThesis?.chapterApproval?.chapter3 ? 100 : 0 },
      { name: 'Ch 4', completed: activeThesis?.chapterApproval?.chapter4 ? 100 : 0 },
      { name: 'Ch 5', completed: activeThesis?.chapterApproval?.chapter5 ? 100 : 0 },
    ];

    return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      
      {/* Header & Quick Actions */}
      <motion.div variants={itemVariants} className="relative mb-6">
        {/* Glass morphism header background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl -z-10"/>
        
        <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-purple-500/10 p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Welcome back, {user.firstname}</h1>
              <p className="text-muted-foreground text-lg">Here's what's happening with your thesis today.</p>
            </div>
            {theses.length > 0 && (
              <div className="min-w-[250px]">
                <Select value={selectedThesisId} onValueChange={setSelectedThesisId}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-2 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium truncate max-w-[180px]">
                              {activeThesis ? activeThesis.title : "Select Thesis"}
                        </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent align="end" className="w-[300px]">
                     {theses
                        .filter((thesis) => thesis.author === user.id)
                        .map((thesis) => (
                        <SelectItem key={thesis._id} value={thesis._id} className="py-3 cursor-pointer">
                           <div className="flex flex-col gap-1">
                              <span className="font-medium truncate">{thesis.title}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                 <span className="bg-muted px-1.5 py-0.5 rounded">{thesis.thesis_id}</span>
                                 {/* <span>v{thesis.thesis_id.split('-')[1] || '1'}</span> */}
                              </div>
                           </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <QuickActions />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        {[
          { title: "Thesis ID", value: activeThesis ? activeThesis.thesis_id : "-", subtitle: "Current Selection", icon: FileText, gradient: "from-blue-500 to-cyan-500" },
          { title: "Overall Progress", value: `${progressValue}%`, subtitle: progressText, icon: TrendingUp, gradient: "from-purple-500 to-pink-500" },
          { title: "Chapters Passed", value: `${passedChaptersCount}/5`, subtitle: "Milestones", icon: CheckCircle, gradient: "from-green-500 to-emerald-500" },
          { title: "Status", value: activeThesis ? activeThesis.status : "-", subtitle: "Current State", icon: AlertCircle, gradient: "from-orange-500 to-amber-500" }, 
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="group relative rounded-3xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 h-full">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
        
        {/* Left Column: Charts & Details */}
        <div className="lg:col-span-2 space-y-6">
           {/* Chart Section */}
           <Card className="rounded-2xl border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
             <CardHeader>
               <CardTitle className="font-heading flex items-center gap-2 justify-between">
                  <div className="flex col-auto items-center">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="px-2">
                        Chapter Progress
                      </div>
                  </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="gap-2 whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-300" asChild>
                        <Link href="/dashboard/upload">
                          <UploadCloud className="h-4 w-4" /> Upload New Chapter
                        </Link>
                      </Button>
                    </motion.div>
               </CardTitle>
               <CardDescription>Visual breakdown of your thesis chapters</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-6">
                  {/* Thesis Details */}
                  <div>
                      <h3 className="font-semibold text-lg leading-tight mb-2">{activeThesis?.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {activeThesis?.abstract || "No abstract available."}
                      </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Completion</span>
                        <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {[1,2,3,4,5].map(num => {
                        const key = `chapter${num}` as keyof NonNullable<IThesis["chapterApproval"]>;
                        const isPassed = activeThesis?.chapterApproval?.[key] || activeThesis?.status.toLowerCase() === 'approved';
                        return (
                            <div key={num} className={`flex flex-col items-center p-2 rounded-lg border ${isPassed ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-muted/20 dark:bg-muted/10 border-muted dark:border-muted/50'}`}>
                                <span className={`text-xs font-medium mb-1 ${isPassed ? 'text-green-800 dark:text-green-200' : 'text-foreground dark:text-gray-300'}`}>Ch.{num}</span>
                                {isPassed ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <div className="h-4 w-4 rounded-full border-2 border-muted dark:border-gray-600" />}
                            </div>
                        )
                    })}
                  </div>
                </div>
             </CardContent>
           </Card>

           {/* Feedback Section */}
           <Card className="rounded-2xl border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                   <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                     <MessageSquare className="h-5 w-5 text-white" />
                   </div>
                   Latest Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                 {activeThesis ? (
                   <div className="bg-muted/20 p-6 rounded-xl border border-muted/50">
                      <h4 className="font-medium text-foreground mb-2">
                        {latestFeedback ? "Advisor commented:" : "No new feedback"}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {latestFeedback || "Your advisor hasn't left any comments on this version yet."}
                      </p>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/dashboard/thesis/${activeThesis._id}#feedback`}>View Full Discussion</Link>
                      </Button>
                   </div>
                 ) : (
                   <div className="text-center text-muted-foreground py-4">No thesis selected.</div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Timeline & Calendar */}
        <div className="space-y-6">
           <UpcomingEvents />
           <ActivityTimeline />
        </div>

      </motion.div>
    </motion.div>
  )}

  const renderAdvisorDashboard = () => {
    const uniqueStudents = new Set(theses.map(t => t.author?.user_id)).size;
    const pendingReviews = theses.filter(t => t.status.toLowerCase() === 'pending');
    const approvedCount = theses.filter(t => t.status.toLowerCase() === 'approved').length;
    const rejectedCount = theses.filter(t => t.status.toLowerCase() === 'rejected').length;

    // Data for Pie Chart
    const pieData = [
      { name: 'Approved', value: approvedCount, color: '#22c55e' }, // Green
      { name: 'Pending', value: pendingReviews.length, color: '#eab308' }, // Yellow
      { name: 'Rejected', value: rejectedCount, color: '#ef4444' }, // Red
    ].filter(d => d.value > 0);

    return (
      <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header & Quick Actions */}
        <motion.div variants={itemVariants} className="relative mb-6">
          {/* Glass morphism header background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl -z-10"/>
          
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-purple-500/10 p-8 space-y-6">
            <div>
               <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Welcome back, {user.firstname}</h1>
               <p className="text-muted-foreground text-lg">Overview of your students' progress and pending tasks.</p>
            </div>
            <QuickActions />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="group relative rounded-3xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueStudents}</div>
                <p className="text-xs text-muted-foreground mt-1">Under supervision</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="group relative rounded-3xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 border-l-4 border-l-yellow-400">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviews.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="group relative rounded-3xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved Theses</CardTitle>
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
           {/* Left: Charts */}
           <div className="lg:col-span-2">
              <Card className="rounded-2xl border-0 shadow-lg h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                 <CardHeader>
                    <CardTitle className="font-heading">Thesis Status Distribution</CardTitle>
                    <CardDescription>Overview of all student thesis statuses</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px] flex items-center justify-center">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-muted-foreground">No data available</div>
                    )}
                 </CardContent>
              </Card>
           </div>

           {/* Right: Calendar */}
           <div>
              <UpcomingEvents />
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
           <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
             <Clock className="h-5 w-5 text-yellow-500" /> Pending Reviews
           </h2>
           {pendingReviews.length === 0 ? (
              <Card className="p-8 text-center border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl">
                <p className="text-muted-foreground">No pending reviews. You're all caught up!</p>
              </Card>
           ) : (
             <div className="grid gap-4">
               {pendingReviews.map((thesis) => (
                 <Card key={thesis._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all border-0 border-l-4 border-l-yellow-400 rounded-2xl">
                   <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{thesis.thesis_id}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(thesis.createdAt).toLocaleDateString()}</span>
                         </div>
                         <h3 className="text-lg font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                            <Link href={`/dashboard/thesis/${thesis._id}`}>{thesis.title}</Link>
                         </h3>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Student: <span className="font-medium text-foreground">{thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : "Unknown"}</span>
                            <span className="px-1">•</span>
                            ID: {thesis.author?.user_id}
                         </div>
                      </div>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm">
                         <Link href={`/dashboard/thesis/${thesis._id}`}>Review Thesis</Link>
                      </Button>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
        </motion.div>

      </motion.div>
    )
  }

  const renderAdminDashboard = () => {
    return (
      <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="relative mb-8">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl -z-10"/>
           <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-indigo-500/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                 <Badge variant="outline" className="mb-2 bg-indigo-100 text-indigo-700 border-indigo-200">Admin Console</Badge>
                 <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    System Overview
                 </h1>
                 <p className="text-muted-foreground text-lg mt-2">
                    Welcome back, Administrator. Here is what's happening today.
                 </p>
              </div>
              <div className="flex gap-3">
                 <AddUserDialog 
                    trigger={
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            <Users className="mr-2 h-4 w-4" /> Add New User
                        </Button>
                    }
                    onUserAdded={() => {
                        // Refresh stats if needed, or just let the user see the new user in the list
                        window.location.reload(); 
                    }}
                 />
                 <Button asChild variant="outline" className="bg-white/50 hover:bg-white border-indigo-200 text-indigo-700">
                    <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                 </Button>
              </div>
           </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
           {[
             { title: "Total Users", value: adminStats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100", trend: "+12% from last month" },
             { title: "Total Theses", value: adminStats.totalTheses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100", trend: "+5 new this week" },
             { title: "Pending Reviews", value: adminStats.pendingReviews, icon: Clock, color: "text-amber-600", bg: "bg-amber-100", trend: "Requires attention" },
             { title: "System Health", value: "98%", icon: Zap, color: "text-green-600", bg: "bg-green-100", trend: "Optimal Performance" }
           ].map((stat, index) => (
             <motion.div key={index} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
               <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden relative">
                  <div className={`absolute top-0 right-0 p-3 opacity-10 ${stat.color}`}>
                     <stat.icon className="h-24 w-24" />
                  </div>
                  <CardContent className="p-6">
                     <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                     </div>
                     <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                     <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                     <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" /> {stat.trend}
                     </p>
                  </CardContent>
               </Card>
             </motion.div>
           ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Activity */}
           <motion.div className="lg:col-span-2" variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl h-full">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Sparkles className="h-5 w-5 text-yellow-500" /> Recent System Activity
                    </CardTitle>
                    <CardDescription>Latest updates across the platform</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-6">
                       {theses.slice(0, 5).map((thesis, i) => (
                          <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                             <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                             </div>
                             <div>
                                <p className="text-sm font-medium text-foreground">
                                   New thesis submission: <span className="font-bold">{thesis.title}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                   By {thesis.author?.firstName} {thesis.author?.lastName} • {new Date(thesis.updatedAt).toLocaleDateString()}
                                </p>
                                <Badge variant="secondary" className="mt-2 text-[10px]">{thesis.status}</Badge>
                             </div>
                          </div>
                       ))}
                       {theses.length === 0 && <p className="text-center text-muted-foreground py-4">No recent activity found.</p>}
                    </div>
                 </CardContent>
              </Card>
           </motion.div>

           {/* Quick Actions & System Status */}
           <motion.div className="space-y-6" variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                 <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-indigo-100">Common administrative tasks</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <AddUserDialog 
                        trigger={
                            <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0">
                                <Users className="mr-2 h-4 w-4" /> Add New User
                            </Button>
                        }
                        onUserAdded={() => window.location.reload()}
                    />
                    <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0" asChild>
                       <Link href="/dashboard/approvals"><CheckCircle className="mr-2 h-4 w-4" /> Review Pending Items</Link>
                    </Button>
                    <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0" asChild>
                       <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> System Configuration</Link>
                    </Button>
                 </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Zap className="h-5 w-5 text-green-500" /> System Status
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-muted-foreground">Database</span>
                       <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-muted-foreground">Storage</span>
                       <span className="text-sm font-medium">45% Used</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-muted-foreground">Last Backup</span>
                       <span className="text-sm font-medium">2 hours ago</span>
                    </div>
                 </CardContent>
              </Card>
           </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderDashboardContent = () => {
    switch (user.role) {
      case "student": return renderStudentDashboard();
      case "advisor": return renderAdvisorDashboard();
      case "admin": return renderAdminDashboard();
      default: return renderStudentDashboard();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="px-4 py-8">{renderDashboardContent()}</div>
    </div>
  )
}