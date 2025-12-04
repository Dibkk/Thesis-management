"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Eye, Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { LoadingScreen } from "@/components/loading"
import { toast } from "sonner"
import Link from "next/link"

interface IThesis {
  _id: string;
  thesis_id: string;
  title: string;
  status: string;
  author: {
    firstName: string;
    lastName: string;
    user_id: string;
  };
  advisor: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function AllThesesPage() {
  const [theses, setTheses] = useState<IThesis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTheses()
  }, [])

  const fetchTheses = async () => {
    try {
      const res = await fetch('/api/thesis/all')
      const data = await res.json()
      if (data.success) {
        setTheses(data.theses)
      } else {
        toast.error(data.error || "Failed to fetch theses")
      }
    } catch (error) {
      console.error("Error fetching theses:", error)
      toast.error("Failed to fetch theses")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredTheses = theses.filter(thesis => 
    thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thesis.thesis_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (thesis.author?.firstName + " " + thesis.author?.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <LoadingScreen />

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 min-h-screen">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            All Theses
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Master list of all theses in the system.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search title, ID, author..." 
            className="pl-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden">
          <CardHeader>
            <CardTitle>Thesis Repository</CardTitle>
            <CardDescription>
              Total {theses.length} records found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Advisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTheses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No theses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTheses.map((thesis) => (
                      <TableRow key={thesis._id}>
                        <TableCell className="font-mono text-xs">{thesis.thesis_id}</TableCell>
                        <TableCell className="font-medium max-w-[300px] truncate" title={thesis.title}>
                          {thesis.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{thesis.author?.firstName} {thesis.author?.lastName}</span>
                            <span className="text-xs text-muted-foreground">{thesis.author?.user_id}</span>
                          </div>
                        </TableCell>
                        <TableCell>{thesis.advisor?.firstName} {thesis.advisor?.lastName}</TableCell>
                        <TableCell>{getStatusBadge(thesis.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/thesis/${thesis._id}`}>
                                    <Eye className="h-4 w-4 text-blue-500" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <a href={`/api/thesis/${thesis._id}/file`} download>
                                    <Download className="h-4 w-4 text-green-500" />
                                </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
