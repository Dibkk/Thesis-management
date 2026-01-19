"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, GraduationCap, BookOpen, User, Mail, Building2, Calendar, AlertCircle, FileText } from "lucide-react"
import { LoadingScreen } from "@/components/loading"
import Link from "next/link"

// Interface ให้ตรงกับข้อมูลที่ API /api/thesis/advisor ส่งมา
interface IThesis {
  _id: string;
  title: string;
  status: string;
  updatedAt: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    user_id: string; // Student ID
    department: string;
  };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<IThesis[]>([]); 
  const [filteredStudents, setFilteredStudents] = useState<IThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New error state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // New state
  const router = useRouter();

  // 1. ดึงข้อมูลจาก API Advisor
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/thesis/advisor');
        if (!res.ok) {
           if (res.status === 401) {
             router.push('/login');
             return;
           }
           throw new Error(`Failed to fetch students: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.success) {
          setStudents(data.theses);
          setFilteredStudents(data.theses);
        } else {
          throw new Error(data.error || "Unknown error occurred");
        }
      } catch (error: any) {
        console.error("Error fetching students:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [router]);

  // 2. ระบบค้นหา (Search Logic) + Filter
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    let filtered = students.filter(item => 
      item.author.firstName.toLowerCase().includes(lowerQuery) ||
      item.author.lastName.toLowerCase().includes(lowerQuery) ||
      item.author.user_id.toLowerCase().includes(lowerQuery) ||
      item.title.toLowerCase().includes(lowerQuery)
    );

    // Filter by Status
    if (statusFilter !== 'all') {
        filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchQuery, students, statusFilter]);

  // Helper to check inactivity
  const isInactive = (dateString: string) => {
      const lastUpdate = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 30;
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Students</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 mx-auto min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">My Students</h1>
          <p className="text-muted-foreground text-lg">Manage and track your advised students</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
              placeholder="Search name, ID, or thesis..." 
              className="pl-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border/40 focus:border-blue-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {/* Status Filters */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setStatusFilter}>
        <TabsList className="w-full grid grid-cols-3 h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-border/40 shadow-lg">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 font-medium">All Students</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 font-medium">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 font-medium">Approved</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((item) => {
          const inactive = isInactive(item.updatedAt);
          // Safety check for author
          const authorName = item.author ? `${item.author.firstName} ${item.author.lastName}` : "Unknown Student";
          const authorId = item.author?.user_id || "N/A";
          const authorEmail = item.author?.email || "No Email";
          const authorInitial = item.author?.firstName ? item.author.firstName.charAt(0) : "?";

          return (
          <Card key={item._id} className={`hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg group hover:-translate-y-1 ${
            inactive ? 'ring-2 ring-red-200 dark:ring-red-900/50' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-blue-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                        {authorInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{authorName}</h3>
                    <p className="text-sm text-muted-foreground">{authorId}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'approved' ? 'secondary' : 'outline'} className={`capitalize font-medium ${
                  item.status === 'approved' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
                    : 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30'
                }`}>
                  {item.status}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 p-2.5 rounded-xl border border-blue-500/20">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="truncate font-medium">{authorEmail}</span>
                </div>

                <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/40 rounded-xl space-y-2 group-hover:border-blue-500/50 transition-all">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          <BookOpen className="h-3.5 w-3.5" /> Current Thesis
                       </div>
                       {/* Inactivity Alert */}
                       {inactive && (
                           <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                               <AlertCircle className="h-3 w-3" /> Inactive
                           </div>
                       )}
                   </div>
                   <p className="text-sm font-semibold line-clamp-2 leading-snug">{item.title}</p>
                   <p className={`text-xs pt-1 font-medium ${
                       inactive ? 'text-red-500 font-semibold' : 'text-muted-foreground'
                   }`}>
                       Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                       {inactive && " (>30 days)"}
                   </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex gap-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30" asChild>
                   <Link href={`/dashboard/thesis/${item._id}`}>
                      <FileText className="h-4 w-4 mr-2" /> View Progress
                   </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )})}

        {filteredStudents.length === 0 && (
           <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <Search className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="font-medium">No students found matching your search.</p>
           </div>
        )}
      </div>
    </div>
  )
}