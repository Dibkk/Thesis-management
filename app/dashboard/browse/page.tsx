"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, Download, Eye, Calendar, User, BookOpen, TrendingUp } from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@university.edu",
  role: "student" as const,
  department: "Computer Science",
}

// Mock thesis data
const mockTheses = [
  {
    id: "1",
    title: "Machine Learning Applications in Healthcare Diagnosis",
    author: "Alice Johnson",
    advisor: "Dr. Jane Smith",
    year: 2024,
    category: "Computer Science",
    department: "Computer Science",
    keywords: ["machine learning", "healthcare", "diagnosis"],
    abstract: "This thesis explores the application of machine learning algorithms in medical diagnosis...",
    downloads: 245,
    publishedDate: "2024-01-15",
    status: "published",
    accessLevel: "public",
  },
  {
    id: "2",
    title: "Blockchain Security in Financial Systems",
    author: "Bob Smith",
    advisor: "Dr. Michael Johnson",
    year: 2024,
    category: "Computer Science",
    department: "Computer Science",
    keywords: ["blockchain", "security", "finance"],
    abstract: "An analysis of blockchain technology security measures in modern financial systems...",
    downloads: 189,
    publishedDate: "2024-01-10",
    status: "published",
    accessLevel: "university",
  },
  {
    id: "3",
    title: "Sustainable Energy Solutions for Urban Development",
    author: "Carol Davis",
    advisor: "Dr. Sarah Wilson",
    year: 2023,
    category: "Engineering",
    department: "Environmental Engineering",
    keywords: ["sustainability", "energy", "urban planning"],
    abstract: "Research on implementing sustainable energy solutions in urban development projects...",
    downloads: 312,
    publishedDate: "2023-12-20",
    status: "published",
    accessLevel: "public",
  },
  {
    id: "4",
    title: "Quantum Computing Algorithms for Optimization",
    author: "David Brown",
    advisor: "Dr. Robert Lee",
    year: 2023,
    category: "Physics",
    department: "Physics",
    keywords: ["quantum computing", "algorithms", "optimization"],
    abstract: "Development of quantum algorithms for solving complex optimization problems...",
    downloads: 156,
    publishedDate: "2023-11-15",
    status: "published",
    accessLevel: "public",
  },
  {
    id: "5",
    title: "Neural Networks in Natural Language Processing",
    author: "Emma Wilson",
    advisor: "Dr. Lisa Chen",
    year: 2023,
    category: "Computer Science",
    department: "Computer Science",
    keywords: ["neural networks", "NLP", "deep learning"],
    abstract: "Advanced neural network architectures for natural language processing tasks...",
    downloads: 278,
    publishedDate: "2023-10-30",
    status: "published",
    accessLevel: "university",
  },
]

export default function BrowsePage() {
  const [user] = useState(mockUser)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string[]>([])
  const [filteredTheses, setFilteredTheses] = useState(mockTheses)

  const categories = ["Computer Science", "Engineering", "Physics", "Mathematics", "Biology", "Chemistry", "Business"]
  const years = ["2024", "2023", "2022", "2021", "2020"]
  const accessLevels = ["public", "university", "restricted"]

  const handleSearch = () => {
    let filtered = mockTheses

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (thesis) =>
          thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thesis.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thesis.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
          thesis.abstract.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((thesis) => selectedCategories.includes(thesis.category))
    }

    // Filter by years
    if (selectedYears.length > 0) {
      filtered = filtered.filter((thesis) => selectedYears.includes(thesis.year.toString()))
    }

    // Filter by access level
    if (selectedAccessLevel.length > 0) {
      filtered = filtered.filter((thesis) => selectedAccessLevel.includes(thesis.accessLevel))
    }

    // Sort results
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    } else if (sortBy === "downloads") {
      filtered.sort((a, b) => b.downloads - a.downloads)
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }

    setFilteredTheses(filtered)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleYearChange = (year: string, checked: boolean) => {
    if (checked) {
      setSelectedYears([...selectedYears, year])
    } else {
      setSelectedYears(selectedYears.filter((y) => y !== year))
    }
  }

  const handleAccessLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setSelectedAccessLevel([...selectedAccessLevel, level])
    } else {
      setSelectedAccessLevel(selectedAccessLevel.filter((l) => l !== level))
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedYears([])
    setSelectedAccessLevel([])
    setSearchQuery("")
    setFilteredTheses(mockTheses)
  }

  useEffect(() => {
    handleSearch()
  }, [searchQuery, selectedCategories, selectedYears, selectedAccessLevel, sortBy])

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Browse Theses</h1>
          <p className="text-muted-foreground">Discover and explore academic research from our repository</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>Refine your search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search theses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Years */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Publication Year</Label>
                  <div className="space-y-2">
                    {years.map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={`year-${year}`}
                          checked={selectedYears.includes(year)}
                          onCheckedChange={(checked) => handleYearChange(year, checked as boolean)}
                        />
                        <Label htmlFor={`year-${year}`} className="text-sm">
                          {year}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Access Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Access Level</Label>
                  <div className="space-y-2">
                    {accessLevels.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`access-${level}`}
                          checked={selectedAccessLevel.includes(level)}
                          onCheckedChange={(checked) => handleAccessLevelChange(level, checked as boolean)}
                        />
                        <Label htmlFor={`access-${level}`} className="text-sm capitalize">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  {filteredTheses.length} {filteredTheses.length === 1 ? "thesis" : "theses"} found
                </h2>
                <p className="text-sm text-muted-foreground">{searchQuery && `Results for "${searchQuery}"`}</p>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="downloads">Sort by Downloads</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {filteredTheses.map((thesis) => (
                <Card key={thesis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-heading font-semibold text-foreground hover:text-primary cursor-pointer">
                            {thesis.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {thesis.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {thesis.year}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {thesis.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {thesis.downloads} downloads
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{thesis.category}</Badge>
                          <Badge
                            variant={thesis.accessLevel === "public" ? "secondary" : "outline"}
                            className="capitalize"
                          >
                            {thesis.accessLevel}
                          </Badge>
                        </div>
                      </div>

                      {/* Abstract */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{thesis.abstract}</p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2">
                        {thesis.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted-foreground">
                          Advisor: {thesis.advisor} • Published {new Date(thesis.publishedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredTheses.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-2">No theses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or clearing some filters.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
