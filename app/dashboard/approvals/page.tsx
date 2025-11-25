"use client"

import { useState, useEffect } from "react"
// 1. ลบ DashboardLayout ออกจาก import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, FileText, User } from "lucide-react"

// (Mock Data หรือ Interface คงเดิมไว้)
const pendingApprovals = [
  {
    id: "1",
    title: "Advanced Machine Learning Techniques",
    student: "Alice Johnson",
    type: "Thesis Proposal",
    submittedDate: "2024-01-20",
    status: "pending",
  },
  {
    id: "2",
    title: "Blockchain Implementation",
    student: "Bob Smith",
    type: "Final Defense",
    submittedDate: "2024-01-18",
    status: "pending",
  },
]

export default function ApprovalsPage() {
  // (ไม่ต้องใช้ user state เพื่อส่งให้ layout แล้ว)
  
  // 2. ลบ <DashboardLayout> ที่หุ้มออก
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Approvals</h1>
        <p className="text-muted-foreground">Manage and review thesis approval requests</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{item.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" /> {item.student}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" /> {item.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {item.submittedDate}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="history">
          <div className="text-center py-12 text-muted-foreground">
            No approval history found.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}