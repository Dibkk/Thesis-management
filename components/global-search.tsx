"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, User, Calendar, TrendingUp } from "lucide-react"

// Mock search results
const mockSearchResults = [
  {
    id: "1",
    title: "Machine Learning Applications in Healthcare Diagnosis",
    author: "Alice Johnson",
    year: 2024,
    category: "Computer Science",
    downloads: 245,
    type: "thesis",
  },
  {
    id: "2",
    title: "Blockchain Security in Financial Systems",
    author: "Bob Smith",
    year: 2024,
    category: "Computer Science",
    downloads: 189,
    type: "thesis",
  },
  {
    id: "3",
    title: "Dr. Jane Smith",
    department: "Computer Science",
    role: "Advisor",
    type: "user",
  },
]

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const router = useRouter()

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.length > 2) {
      // Mock search - in real app this would be an API call
      const filtered = mockSearchResults.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.author?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  const handleResultClick = (result: any) => {
    if (result.type === "thesis") {
      router.push(`/dashboard/thesis/${result.id}`)
    } else if (result.type === "user") {
      router.push(`/dashboard/users/${result.id}`)
    }
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  const handleAdvancedSearch = () => {
    router.push(`/dashboard/browse?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative w-64 justify-start text-muted-foreground bg-transparent">
          <Search className="h-4 w-4 mr-2" />
          Search theses, authors...
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Search</DialogTitle>
          <DialogDescription>Search for theses, authors, and more</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search theses, authors, keywords..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Quick Results */}
          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-medium text-muted-foreground">Quick Results</h4>
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  {result.type === "thesis" ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-foreground line-clamp-1">{result.title}</h5>
                        <Badge variant="outline">{result.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {result.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {result.year}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {result.downloads} downloads
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h5 className="font-medium text-foreground">{result.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {result.role} • {result.department}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length > 2 && results.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">No results found</h4>
              <p className="text-sm text-muted-foreground mb-4">Try different keywords or browse all theses</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={() => router.push("/dashboard/browse")} className="bg-transparent">
              Browse All Theses
            </Button>
            {query && <Button onClick={handleAdvancedSearch}>Advanced Search for "{query}"</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
