"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, CheckCircle, AlertCircle, File } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "uploading" | "completed" | "error"
}

export default function UploadPage() {
  const mockUser = {
    id: "1",
    name: "John Doe",
    email: "test@gmail.com",
    role: "student" as const,
    department: "Computer Science",
  }

  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    category: "",
    advisor: "",
    coAdvisor: "",
    year: new Date().getFullYear().toString(),
    accessLevel: "university",
    language: "english",
    department: "",
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "uploading" as const,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((uploadFile) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadFile.id) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100)
              const newStatus = newProgress === 100 ? "completed" : "uploading"
              return { ...f, progress: newProgress, status: newStatus }
            }
            return f
          }),
        )
      }, 500)

      setTimeout(() => clearInterval(interval), 3000)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "application/zip": [".zip"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement thesis submission logic
    console.log("Thesis submission:", { formData, files: uploadedFiles })
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-blue-500" />
      case "zip":
        return <File className="h-8 w-8 text-yellow-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout user={mockUser}>
      <div className="p-6">
        <motion.div className="max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Upload Thesis</h1>
            <p className="text-muted-foreground">Submit your thesis for review and publication</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-heading">Upload Files</CardTitle>
                    <CardDescription>
                      Upload your thesis files (PDF, DOCX, DOC, ZIP). Maximum file size: 50MB
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? "border-primary bg-primary/5 scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input {...getInputProps()} />
                      <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      </motion.div>
                      {isDragActive ? (
                        <p className="text-lg font-medium text-primary">Drop the files here...</p>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-foreground mb-2">
                            Drag & drop files here, or click to select
                          </p>
                          <p className="text-sm text-muted-foreground">Supported formats: PDF, DOCX, DOC, ZIP</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <motion.div
                        className="mt-6 space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="font-medium text-foreground">Uploaded Files</h4>
                        {uploadedFiles.map((uploadFile, index) => (
                          <motion.div
                            key={uploadFile.id}
                            className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card/50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                          >
                            {getFileIcon(uploadFile.file.name)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{uploadFile.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {uploadFile.status === "uploading" && (
                                <Progress value={uploadFile.progress} className="mt-2" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {uploadFile.status === "completed" && <CheckCircle className="h-5 w-5 text-secondary" />}
                              {uploadFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(uploadFile.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Thesis Metadata */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-heading">Thesis Information</CardTitle>
                    <CardDescription>Provide details about your thesis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Thesis Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter your thesis title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    {/* Abstract */}
                    <div className="space-y-2">
                      <Label htmlFor="abstract">Abstract *</Label>
                      <Textarea
                        id="abstract"
                        placeholder="Provide a brief summary of your thesis..."
                        value={formData.abstract}
                        onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                        rows={4}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input
                        id="keywords"
                        placeholder="machine learning, healthcare, AI (comma-separated)"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>

                    {/* Category and Year */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="computer-science">Computer Science</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="physics">Physics</SelectItem>
                            <SelectItem value="biology">Biology</SelectItem>
                            <SelectItem value="chemistry">Chemistry</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="psychology">Psychology</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                          id="year"
                          type="number"
                          min="2000"
                          max="2030"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          required
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Advisors */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="advisor">Primary Advisor *</Label>
                        <Input
                          id="advisor"
                          placeholder="Dr. Jane Smith"
                          value={formData.advisor}
                          onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                          required
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coAdvisor">Co-Advisor (Optional)</Label>
                        <Input
                          id="coAdvisor"
                          placeholder="Dr. John Johnson"
                          value={formData.coAdvisor}
                          onChange={(e) => setFormData({ ...formData, coAdvisor: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Language and Department */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          required
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Access Control */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-heading">Access Control</CardTitle>
                    <CardDescription>Set who can access your thesis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.accessLevel}
                      onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
                      className="space-y-4"
                    >
                      {[
                        {
                          value: "public",
                          title: "Public Access",
                          description: "Anyone can view and download your thesis",
                        },
                        {
                          value: "university",
                          title: "University Only",
                          description: "Only university members can access your thesis",
                        },
                        {
                          value: "restricted",
                          title: "Restricted Access",
                          description: "Only you and your advisors can access the thesis",
                        },
                      ].map((option) => (
                        <motion.div
                          key={option.value}
                          className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors"
                          whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">{option.title}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Submit Button */}
            <motion.div className="flex justify-end gap-4" variants={itemVariants}>
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }} transition={{ duration: 0.2 }}>
                <Button type="button" variant="outline" className="rounded-xl bg-transparent">
                  Save as Draft
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }} transition={{ duration: 0.2 }}>
                <Button
                  type="submit"
                  disabled={uploadedFiles.length === 0 || !formData.title || !formData.abstract}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-xl"
                >
                  Submit for Review
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
