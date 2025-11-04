"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="rounded-2xl border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <motion.div
                  whileHover={{ y: -1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }} transition={{ duration: 0.2 }}>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard">
                      <Search className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }} transition={{ duration: 0.2 }}>
                  <Button variant="ghost" className="w-full" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p>Need help? Contact our support team.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
