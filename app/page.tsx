import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Shield, FileText } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-heading font-bold text-foreground">Thesis Management System</h1>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-heading font-black text-foreground mb-6">
            Streamline Your Academic Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A comprehensive platform for managing thesis submissions, reviews, and academic collaboration between
            students, advisors, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-heading font-bold text-center mb-12">Built for Academic Excellence</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-heading">Role-Based Access</CardTitle>
                <CardDescription>Tailored experiences for students, advisors, and administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Secure, permission-based access ensuring the right people see the right information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle className="font-heading">Thesis Management</CardTitle>
                <CardDescription>Upload, review, and track thesis progress seamlessly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete workflow from submission to approval with real-time status tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
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
