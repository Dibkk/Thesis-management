"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, BookOpen, User, Calendar, Download, FileText, Tag, X, Eye } from "lucide-react"

interface IThesis {
  _id: string;
  thesis_id: string;
  title: string;
  abstract: string;
  category: string;
  year: string;
  keywords: string;
  status: string;
  file_path: string;
  department: string;
  isPublic: boolean;
  author: {
    firstName: string;
    lastName: string;
  };
  advisor: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  downloads?: number;
}

const CATEGORIES = [
  { value: "computer-science", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "business", label: "Business" },
  { value: "psychology", label: "Psychology" },
  { value: "other", label: "Other" },
];


const YEARS = ["2025", "2024", "2023", "2022", "2021", "2020"];

export default function BrowsePage() {
  const [theses, setTheses] = useState<IThesis[]>([]) 
  const [filteredTheses, setFilteredTheses] = useState<IThesis[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]) 
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedAccess, setSelectedAccess] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/query/thesis');
        const data = await res.json();
        if (data.success) {
          setTheses(data.theses);
          setFilteredTheses(data.theses);
        }
      } catch (error) {
        console.error("Failed to fetch theses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getCategoryLabel = (value: string) => {
    const cat = CATEGORIES.find(c => c.value === value);
    return cat ? cat.label : value || "Uncategorized";
  };

  useEffect(() => {
    let result = theses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((thesis) => {
          const title = thesis.title || "";
          const abstract = thesis.abstract || "";
          const keywords = thesis.keywords || "";
          const thesisId = thesis.thesis_id || "";
          const authorName = thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : "";
          
          return (
            title.toLowerCase().includes(query) ||
            authorName.toLowerCase().includes(query) ||
            abstract.toLowerCase().includes(query) ||
            keywords.toLowerCase().includes(query) ||
            thesisId.toLowerCase().includes(query)
          )
      });
    }

    if (selectedCategories.length > 0) {
      result = result.filter((thesis) => selectedCategories.includes(thesis.category));
    }

    if (selectedYears.length > 0) {
      result = result.filter((thesis) => selectedYears.includes(thesis.year));
    }

    if (selectedAccess.length > 0) {
      result = result.filter((thesis) => {
        const status = thesis.isPublic ? "public" : "restricted";
        return selectedAccess.includes(status);
      });
    }

    if (sortBy === "date") {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    setFilteredTheses(result);

  }, [searchQuery, selectedCategories, selectedYears, selectedAccess, sortBy, theses]);


  const toggleCategory = (value: string) => {
    setSelectedCategories(prev => 
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const toggleYear = (value: string) => {
    setSelectedYears(prev => 
      prev.includes(value) ? prev.filter(y => y !== value) : [...prev, value]
    );
  };

  const toggleAccess = (value: string) => {
    setSelectedAccess(prev => 
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedYears([]);
    setSelectedAccess([]);
    setSearchQuery("");
  };

  if (loading) {
     return (
      <div className="flex items-center justify-center p-8 min-h-screen"> 
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Browse Theses</h1>
          <p className="text-muted-foreground">Discover and explore academic research from our repository</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* --- Left Sidebar (Filters) --- */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Keywords, Title, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                       <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                         <X className="h-4 w-4" />
                       </button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Filter: Categories (ลบ max-h ออก เพื่อให้โชว์เต็มๆ) */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${cat.value}`} 
                          checked={selectedCategories.includes(cat.value)}
                          onCheckedChange={() => toggleCategory(cat.value)}
                        />
                        <label htmlFor={`cat-${cat.value}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          {cat.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Filter: Year (ใช้ YEARS คงที่) */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Publication Year</Label>
                  <div className="space-y-2">
                    {YEARS.map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`year-${year}`} 
                          checked={selectedYears.includes(year)}
                          onCheckedChange={() => toggleYear(year)}
                        />
                        <label htmlFor={`year-${year}`} className="text-sm leading-none cursor-pointer">
                          {year}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Filter: Access Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Access Level</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="access-public" 
                        checked={selectedAccess.includes("public")}
                        onCheckedChange={() => toggleAccess("public")}
                      />
                      <label htmlFor="access-public" className="text-sm leading-none cursor-pointer">Public</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="access-restricted" 
                        checked={selectedAccess.includes("restricted")}
                        onCheckedChange={() => toggleAccess("restricted")}
                      />
                      <label htmlFor="access-restricted" className="text-sm leading-none cursor-pointer">Restricted</label>
                    </div>
                  </div>
                </div>

                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* --- Right Content (Results) --- */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredTheses.length} results
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTheses.length > 0 ? (
                  filteredTheses.map((thesis) => (
                    <motion.div key={thesis._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                {/* Link Title */}
                                <Link href={`/dashboard/thesis/${thesis._id}`} className="group-hover:text-blue-600 transition-colors">
                                  <h3 className="text-lg font-heading font-semibold text-foreground hover:text-primary cursor-pointer">
                                    {thesis.title || "Untitled Thesis"}
                                  </h3>
                                </Link>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {thesis.author ? `${thesis.author.firstName} ${thesis.author.lastName}` : 'Unknown Author'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {thesis.year || "N/A"}
                                  </div>
                                  {/* --- แสดง Category บน Card --- */}
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    <Badge variant="secondary" className="font-normal">
                                      {getCategoryLabel(thesis.category)}
                                    </Badge>
                                  </div>
                                  {/* ----------------------------- */}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 items-end">
                                <Badge variant={thesis.isPublic ? "secondary" : "outline"}>
                                  {thesis.isPublic ? "Public" : "Restricted"}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {thesis.abstract || "No abstract available."}
                            </p>

                            {thesis.keywords && (
                              <div className="flex flex-wrap gap-2">
                                {thesis.keywords.split(',').map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t mt-4">
                               <div className="text-xs text-muted-foreground">
                                  Thesis ID: {thesis.thesis_id || "-"}
                               </div>
                               <div className="flex gap-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/thesis/${thesis._id}`}>
                                       <Eye className="h-4 w-4 mr-2" />
                                       View
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                     <a href={thesis.file_path || "#"} download>
                                       <Download className="h-4 w-4 mr-2" />
                                       Download
                                     </a>
                                  </Button>
                               </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/10 rounded-xl border-2 border-dashed">
                    <p className="text-muted-foreground">No theses found matching your criteria.</p>
                    <Button variant="link" onClick={clearFilters}>Clear Filters</Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
  )
}