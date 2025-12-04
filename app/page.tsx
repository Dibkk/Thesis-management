import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Shield, FileText } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/30">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Thesis Management</h1>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-heading font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Streamline Your Academic Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A comprehensive platform for managing thesis submissions, reviews, and academic collaboration between
            students, advisors, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/30">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-heading font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Built for Academic Excellence</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto w-fit mb-4 shadow-lg shadow-blue-500/30">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="font-heading">Role-Based Access</CardTitle>
                <CardDescription>Tailored experiences for students, advisors, and administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Secure, permission-based access ensuring the right people see the right information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mx-auto w-fit mb-4 shadow-lg shadow-purple-500/30">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="font-heading">Thesis Management</CardTitle>
                <CardDescription>Upload, review, and track thesis progress seamlessly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete workflow from submission to approval with real-time status tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mx-auto w-fit mb-4 shadow-lg shadow-green-500/30">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="font-heading">Secure & Reliable</CardTitle>
                <CardDescription>Enterprise-grade security for academic data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced security measures to protect sensitive academic work and personal data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">© 2024 Thesis Management System. Built for academic excellence.</p>
        </div>
      </footer>
    </div>
  )
}
