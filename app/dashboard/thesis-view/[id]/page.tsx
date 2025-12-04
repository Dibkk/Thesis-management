"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, Calendar, User, BookOpen } from "lucide-react"
import { LoadingScreen } from "@/components/loading"

interface IThesisDetail {
  _id: string;
  thesis_id: string;
  title: string;
  abstract: string;
  category: string;
  keywords: string;
  status: string;
  file_path: string;
  year: string;
  author: {
    firstName: string;
    lastName: string;
    department: string;
  };
  advisor: {
    firstName: string;
    lastName: string;
  };
}

export default function PublicThesisViewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [thesis, setThesis] = useState<IThesisDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchThesis() {
      try {
        const res = await fetch(`/api/query/thesis/${id}`);
        const data = await res.json();
        if (data.success) {
          setThesis(data.thesis);
        }
      } catch (error) {
        console.error("Failed to fetch thesis:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchThesis();
  }, [id]);

  if (loading) {
    return <LoadingScreen />
  }

  if (!thesis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Thesis not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border/40 p-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="hidden md:block">
            <h1 className="font-semibold text-lg truncate max-w-xl">{thesis.title}</h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="h-3 w-3" /> {thesis.author.firstName} {thesis.author.lastName}
              <Separator orientation="vertical" className="h-3" />
              <Calendar className="h-3 w-3" /> {thesis.year || new Date().getFullYear()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/30">
            <a href={`/api/thesis/${id}/file`} download>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Info */}
        <div className="w-80 border-r border-border/40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-y-auto p-6 hidden lg:block shrink-0 shadow-xl">
            <div className="space-y-6">
                <div>
                    <Badge variant="outline" className="mb-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 font-medium">{thesis.thesis_id}</Badge>
                    <h2 className="font-heading font-bold text-xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{thesis.title}</h2>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">{thesis.category}</Badge>
                </div>

                <Separator />

                <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Abstract
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {thesis.abstract}
                    </p>
                </div>

                <Separator />

                <div>
                    <h3 className="font-semibold mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {thesis.keywords?.split(',').map((k, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-medium px-2.5 py-0.5">{k.trim()}</Badge>
                        ))}
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                            <User className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Author</p>
                            <p className="font-medium text-sm">{thesis.author.firstName} {thesis.author.lastName}</p>
                            <p className="text-xs text-muted-foreground">{thesis.author.department}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Advisor</p>
                            <p className="font-medium text-sm">{thesis.advisor.firstName} {thesis.advisor.lastName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Main PDF Viewer */}
        <div className="flex-1 bg-slate-100 p-4 overflow-hidden flex flex-col items-center justify-center">
            {thesis.file_path ? (
                <iframe 
                    src={`/api/thesis/${id}/file#toolbar=0`} 
                    className="w-full h-full rounded-lg shadow-lg border bg-white"
                    title="Thesis PDF"
                />
            ) : (
                <div className="text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No PDF document available</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
