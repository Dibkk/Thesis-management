"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Download, Users, BookOpen, MessageSquare, UploadCloud, ChevronDown } from "lucide-react"
import Link from "next/link"

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
  // ข้อมูล Author (สำหรับ Advisor ดู)
  author?: {
    firstName: string;
    lastName: string;
    email: string;
    user_id: string;
    department: string;
  };
  advisor: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [theses, setTheses] = useState<IThesis[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // 2. เพิ่ม State สำหรับ Thesis ที่ถูกเลือก
  const [selectedThesisId, setSelectedThesisId] = useState<string>("");

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      setLoadingUser(true);
      try {
        // 1. ดึง User
        const resUser = await fetch('/api/auth/me'); 
        if (!resUser.ok) throw new Error('Not authenticated');
        const dataUser = await resUser.json();
        
        if (dataUser.success) {
          setUser(dataUser.user);
          
          // 2. ดึง Thesis
          if (dataUser.user.role === 'student') {
            const resThesis = await fetch('/api/thesis/my');
            const dataThesis = await resThesis.json();
            if (dataThesis.success) {
              setTheses(dataThesis.theses);
              // 3. ตั้งค่าเริ่มต้น: เลือกตัวแรก (ล่าสุด) เสมอ
              if (dataThesis.theses.length > 0) {
                setSelectedThesisId(dataThesis.theses[0]._id);
              }
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

  if (loadingUser || !user) { 
    return (
      <div className="flex items-center justify-center p-8"> 
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  // --- 4. หา Thesis ที่ถูกเลือก (Active Thesis) ---
  const activeThesis = theses.find(t => t._id === selectedThesisId) || null;

  // คำนวณ Stats จาก Active Thesis
  let progressValue = 0;
  let progressText = "Not Started";
  if (activeThesis) {
      if (activeThesis.status === 'approved') { progressValue = 100; progressText = "Completed"; }
      else if (activeThesis.status === 'pending') { progressValue = 50; progressText = "In Review"; }
      else if (activeThesis.status === 'rejected') { progressValue = 20; progressText = "Needs Revision"; }
  }

  // ข้อมูล Global (ไม่ขึ้นกับที่เลือก)
  const totalTheses = theses.length;
  const pendingReviews = theses.filter(t => t.status === 'pending').length;

  const renderStudentDashboard = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      
      {/* --- Header & Thesis Selector --- */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome back, {user.firstname}</h1>
          <p className="text-muted-foreground">
             {activeThesis ? "Viewing details for:" : "Manage your thesis progress."}
          </p>
        </div>

        {/* 5. Dropdown เลือก Thesis (โชว์เฉพาะเมื่อมี Thesis มากกว่า 0) */}
        {theses.length > 0 && (
          <div className="min-w-[250px]">
            <Select value={selectedThesisId} onValueChange={setSelectedThesisId}>
              <SelectTrigger className="w-full h-12 rounded-xl border-2 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                       {/* แสดงชื่อ Thesis ที่เลือกอยู่ (ตัดคำถ้าล้น) */}
                       <span className="truncate max-w-[180px] inline-block align-bottom">
                          {activeThesis ? activeThesis.title : "Select Thesis"}
                       </span>
                    </span>
                </div>
              </SelectTrigger>
              <SelectContent align="end" className="w-[300px]">
                 {theses.map((thesis) => (
                    <SelectItem key={thesis._id} value={thesis._id} className="py-3 cursor-pointer">
                       <div className="flex flex-col gap-1">
                          <span className="font-medium truncate">{thesis.title}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <span className="bg-muted px-1.5 py-0.5 rounded">{thesis.thesis_id}</span>
                             <span>{new Date(thesis.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </SelectItem>
                 ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </motion.div>

      {/* 1. Stats Cards (ผสมระหว่าง Global และ Active Thesis) */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        {[
          // Card 1: แสดงข้อมูลของตัวที่เลือก
          { title: "Selected Thesis ID", value: activeThesis ? activeThesis.thesis_id : "-", subtitle: "Current View", icon: FileText },
          // Card 2: Progress ของตัวที่เลือก
          { title: "Progress", value: `${progressValue}%`, subtitle: progressText, icon: TrendingUp },
          // Card 3: ข้อมูลรวม (Global) - จำนวนที่รอตรวจทั้งหมด
          { title: "Pending Reviews", value: pendingReviews.toString(), subtitle: "Total Pending", icon: Clock },
          // Card 4: Status ของตัวที่เลือก
          { title: "Status", value: activeThesis ? activeThesis.status : "-", subtitle: "Current Status", icon: CheckCircle }, 
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }} transition={{ duration: 0.2 }}>
              <Card className="rounded-2xl border-0 shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 2. Main Content (แสดงผลตาม Active Thesis) */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
        
        {/* Left: Current Thesis Details */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-heading">Thesis Details</CardTitle>
              <CardDescription>
                 {activeThesis ? activeThesis.title : "No thesis selected"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeThesis ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Completion Status</span>
                      <span className="text-muted-foreground">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                     <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-sm font-medium mb-1">Review Status</p>
                        <Badge variant={activeThesis.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
                          {activeThesis.status}
                        </Badge>
                     </div>
                     <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-sm font-medium mb-1">Department</p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                     </div>
                  </div>

                  <div className="mt-4">
                     <p className="text-sm font-medium mb-2">Abstract Preview</p>
                     <p className="text-sm text-muted-foreground line-clamp-3 italic bg-muted/10 p-4 rounded-lg border">
                       "{activeThesis.abstract}"
                     </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't uploaded a thesis yet.</p>
                  <Button asChild>
                    <Link href="/dashboard/upload">Start Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: File & Download */}
        <div>
          <Card className="rounded-2xl border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-heading">Submitted File</CardTitle>
              <CardDescription>Latest document for this thesis</CardDescription>
            </CardHeader>
            <CardContent>
              {activeThesis ? (
                <div className="space-y-6">
                   <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <FileText className="h-10 w-10 text-blue-600" />
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">Thesis_File.pdf</p>
                        <p className="text-xs text-muted-foreground">PDF Document</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <a href={activeThesis.file_path} download>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/upload">
                           Upload New Version
                        </Link>
                      </Button>
                   </div>

                   {/* ข้อมูล Advisor */}
                   <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Primary Advisor</p>
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            AD
                         </div>
                         <div>
                            <p className="text-sm font-medium">
                               {activeThesis.advisor ? `${activeThesis.advisor.firstName} ${activeThesis.advisor.lastName}` : 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">Advisor</p>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No file available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* 3. Bottom: Advisor Feedback */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
               <MessageSquare className="h-5 w-5 text-primary" />
               Advisor Feedback
            </CardTitle>
            <CardDescription>Feedback for: <span className="font-medium text-foreground">{activeThesis?.title}</span></CardDescription>
          </CardHeader>
          <CardContent>
             {activeThesis ? (
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-6 rounded-xl">
                  <div>
                    <h4 className="font-medium text-foreground">Check your feedback history</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      View comments, approval status, and suggestions for revision directly on your thesis page.
                    </p>
                  </div>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 text-white min-w-[150px]">
                    <Link href={`/dashboard/thesis/${activeThesis._id}#feedback`}>
                      View Feedback
                    </Link>
                  </Button>
               </div>
             ) : (
               <div className="text-center text-muted-foreground py-4">No thesis submitted yet.</div>
             )}
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  )

  // --- ฟังก์ชันแสดงผลสำหรับ Advisor ---
  const renderAdvisorDashboard = () => {
      // คำนวณ Stats สำหรับอาจารย์
      const uniqueStudents = new Set(theses.map(t => t.author?.user_id)).size;
      const pendingReviews = theses.filter(t => t.status === 'pending');
      const approvedCount = theses.filter(t => t.status === 'approved').length;

      return (
        <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome back, {user.firstname}</h1>
            <p className="text-muted-foreground">Manage your students and review thesis submissions.</p>
          </motion.div>

          {/* 1. Stats Cards (Advisor) */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueStudents}</div>
                <p className="text-xs text-muted-foreground">Under supervision</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg border-l-4 border-l-yellow-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviews.length}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved Theses</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Pending Reviews List (งานที่รอตรวจ) */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" /> Pending Reviews
            </h2>
            {pendingReviews.length === 0 ? (
                <Card className="p-8 text-center border-dashed bg-muted/10 rounded-2xl">
                  <p className="text-muted-foreground">No pending reviews. You're all caught up!</p>
                </Card>
            ) : (
              <div className="grid gap-4">
                {pendingReviews.map((thesis) => (
                  <Card key={thesis._id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{thesis.thesis_id}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(thesis.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground hover:text-primary cursor-pointer">
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

          {/* 3. Recent Activity (งานอื่นๆ) */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-heading font-bold text-foreground">All Activities</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {theses.filter(t => t.status !== 'pending').slice(0, 6).map((thesis) => (
                  <Card key={thesis._id} className="p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        {getStatusBadge(thesis.status)}
                        <span className="text-xs text-muted-foreground">{new Date(thesis.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <Link href={`/dashboard/thesis/${thesis._id}`} className="block hover:underline">
                          <h4 className="font-medium truncate mb-1">{thesis.title}</h4>
                      </Link>
                      <p className="text-xs text-muted-foreground">By {thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : "Unknown"}</p>
                  </Card>
                ))}
            </div>
          </motion.div>

        </motion.div>
      )
    }

  const renderAdminDashboard = () => (
     <div className="p-12 text-center"><h2 className="text-2xl font-bold">Admin Dashboard</h2><p>System Overview...</p></div>
  )

  const renderDashboardContent = () => {
    switch (user.role) {
      case "student": return renderStudentDashboard();
      case "advisor": return renderAdvisorDashboard();
      case "admin": return renderAdminDashboard();
      default: return renderStudentDashboard();
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">{renderDashboardContent()}</div>
  )
}