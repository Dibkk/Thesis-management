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
import { Search, Filter, BookOpen, User, Calendar, Download, FileText, Tag, X, Eye, LayoutGrid, List, ChevronLeft, ChevronRight, Star, Shuffle } from "lucide-react"
import { LoadingScreen } from "@/components/loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  downloadCount?: number;
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
  const [user, setUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]) 
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedAccess, setSelectedAccess] = useState<string[]>([])

  // New State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Featured Logic
  const [featuredTab, setFeaturedTab] = useState("popular");
  const [randomTheses, setRandomTheses] = useState<IThesis[]>([]);

  useEffect(() => {
    async function fetchData() {
      const storedUser = localStorage.getItem("user");
      let obj;
      if (storedUser) {
        try {
          obj = JSON.parse(storedUser);
          setUser(obj);
        } catch (err) {
          console.error("Invalid user in localStorage", err);
        }
      }
      
      try {
        const res = obj.role == "advisor" ? await fetch('/api/query/thesis') : await fetch('/api/query/thesisPub');
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

  useEffect(() => {
    if (theses.length > 0) {
        // Generate random theses only once when theses are loaded
        const shuffled = [...theses].sort(() => 0.5 - Math.random());
        setRandomTheses(shuffled.slice(0, 3));
    }
  }, [theses]);

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
    setCurrentPage(1); // Reset to page 1 when filters change

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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = theses.length > 0 ? indexOfLastItem - itemsPerPage + 1 : 0;
  const currentItems = filteredTheses.slice(indexOfFirstItem - 1, indexOfLastItem);
  const totalPages = Math.ceil(filteredTheses.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Featured Logic Helpers
  const mostPopularTheses = [...theses]
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, 3);

  const displayedFeatured = featuredTab === "popular" ? mostPopularTheses : randomTheses;

  const handleRefreshRandom = () => {
      const shuffled = [...theses].sort(() => 0.5 - Math.random());
      setRandomTheses(shuffled.slice(0, 3));
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Author", "Advisor", "Year", "Category", "Status", "Downloads"];
    const rows = filteredTheses.map(t => [
      t.thesis_id,
      `"${t.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${t.author?.firstName} ${t.author?.lastName}"`,
      `"${t.advisor?.firstName} ${t.advisor?.lastName}"`,
      t.year,
      t.category,
      t.status,
      t.downloadCount || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "thesis_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
     return <LoadingScreen />
  }

  const savelog = async (_id: string) => {
    console.log(user.id)
    console.log(_id)

    try {
      const res = await fetch('/api/log-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          thesis_id: _id,
        })
      });

      if (res.ok) {
        
      } else {
        console.error("Failed Save log");
      }

    } catch (error) {
      console.error("Error Save log:", error);
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 min-h-screen">
      <div className="mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl -z-10"/>
          
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-purple-500/10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">Browse Theses</h1>
                </div>
                <p className="text-muted-foreground text-lg">Discover and explore academic research from our repository</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} hidden={ !(user.role == 'advisor') }>
                <Button variant="outline" onClick={handleExportCSV} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </motion.div>
              {/* <button onClick={() => savelog("")}>Click</button> */}
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <section>
           <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                 <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Featured Research
               </h2>
               <Tabs defaultValue="popular" className="w-[320px]" onValueChange={setFeaturedTab}>
                  <TabsList className="grid w-full grid-cols-2 h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-xl shadow-lg">
                    <TabsTrigger value="popular" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-yellow-500/30 transition-all duration-300 py-2 px-3 text-sm font-medium">Most Popular</TabsTrigger>
                    <TabsTrigger value="random" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/30 transition-all duration-300 py-2 px-3 text-sm font-medium">Discover</TabsTrigger>
                  </TabsList>
               </Tabs>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {displayedFeatured.map((thesis, index) => (
               <motion.div
                 key={thesis._id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 whileHover={{ y: -4, scale: 1.01 }}
                 hidden={ !(thesis.isPublic || user.role == 'advisor') }
               >
                 <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                   {/* Gradient overlay on hover */}
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   {featuredTab === "popular" && (
                       <div className="absolute top-0 right-0 z-10">
                         <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-bl-2xl font-bold shadow-lg shadow-yellow-500/30">
                             ⭐ Top {index + 1}
                         </div>
                       </div>
                   )}
                   
                   <CardContent className="relative p-6 space-y-4">
                      <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-sm backdrop-blur-sm text-xs font-medium px-2.5 py-0.5">
                            {getCategoryLabel(thesis.category)}
                          </Badge>
                         <span className="text-sm text-muted-foreground font-semibold">{thesis.year}</span>
                      </div>
                      <Link href={thesis.isPublic ? `/dashboard/thesis-view/${thesis._id}` : `/dashboard/thesis/${thesis._id}`}>
                        <h3 className="font-bold text-xl leading-tight hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all line-clamp-2 h-[3.5rem]">
                          {thesis.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                         <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                               <User className="h-3 w-3 text-white" />
                             </div>
                             <span className="font-medium">{thesis.author?.firstName} {thesis.author?.lastName}</span>
                         </div>
                         {featuredTab === "popular" && (
                             <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                 <Download className="h-3 w-3 text-green-600" />
                                 <span className="text-xs font-semibold text-green-600">{thesis.downloadCount || 0}</span>
                             </div>
                         )}
                      </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
           {featuredTab === "random" && (
               <div className="flex justify-center mt-6">
                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button variant="outline" size="sm" onClick={handleRefreshRandom} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 transition-all duration-300">
                         <Shuffle className="mr-2 h-4 w-4" /> Shuffle Suggestions
                     </Button>
                   </motion.div>
               </div>
           )}
        </section>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* --- Left Sidebar (Filters) --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Filters Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden rounded-2xl p-0">
                  {/* Gradient Header - Full Width */}
                  <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-5 py-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <CardTitle className="font-heading flex items-center gap-2 text-white relative z-10">
                      <Filter className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </div>

                  <CardContent className="p-5 space-y-5">
                    
                    {/* Search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-blue-600" />
                        Search
                      </Label>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          placeholder="Keywords, Title, ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {searchQuery && (
                           <button 
                             onClick={() => setSearchQuery("")} 
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground transition-all"
                           >
                             <X className="h-3.5 w-3.5" />
                           </button>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                    {/* Filter: Categories */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-purple-600" />
                        Categories
                      </Label>
                      <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                          <motion.div 
                            key={cat.value} 
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors group"
                            whileHover={{ x: 2 }}
                          >
                            <Checkbox 
                              id={`cat-${cat.value}`} 
                              checked={selectedCategories.includes(cat.value)}
                              onCheckedChange={() => toggleCategory(cat.value)}
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-pink-600 data-[state=checked]:border-none"
                            />
                            <label 
                              htmlFor={`cat-${cat.value}`} 
                              className="text-sm leading-none cursor-pointer group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-1"
                            >
                              {cat.label}
                            </label>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                    {/* Filter: Year */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                        Publication Year
                      </Label>
                      <div className="space-y-2">
                        {YEARS.map((year) => (
                          <motion.div 
                            key={year} 
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group"
                            whileHover={{ x: 2 }}
                          >
                            <Checkbox 
                              id={`year-${year}`} 
                              checked={selectedYears.includes(year)}
                              onCheckedChange={() => toggleYear(year)}
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600 data-[state=checked]:border-none"
                            />
                            <label 
                              htmlFor={`year-${year}`} 
                              className="text-sm leading-none cursor-pointer group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-1"
                            >
                              {year}
                            </label>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                    {/* Filter: Access Level */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5 text-orange-600" />
                        Access Level
                      </Label>
                      <div className="space-y-2">
                        <motion.div 
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
                          whileHover={{ x: 2 }}
                        >
                          <Checkbox 
                            id="access-public" 
                            checked={selectedAccess.includes("public")}
                            onCheckedChange={() => toggleAccess("public")}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-600 data-[state=checked]:to-red-600 data-[state=checked]:border-none"
                          />
                          <label 
                            htmlFor="access-public" 
                            className="text-sm leading-none cursor-pointer group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-1"
                          >
                            Public
                          </label>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
                          whileHover={{ x: 2 }}
                        >
                          <Checkbox 
                            id="access-restricted" 
                            checked={selectedAccess.includes("restricted")}
                            onCheckedChange={() => toggleAccess("restricted")}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-600 data-[state=checked]:to-red-600 data-[state=checked]:border-none"
                          />
                          <label 
                            htmlFor="access-restricted" 
                            className="text-sm leading-none cursor-pointer group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-1"
                          >
                            Restricted
                          </label>
                        </motion.div>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={clearFilters} 
                        variant="outline" 
                        className="w-full bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium transition-all duration-300"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear All Filters
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* --- Right Content (Results) --- */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Controls Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 rounded-xl shadow-lg"
            >
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                Showing <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-md text-xs">{indexOfFirstItem}-{Math.min(indexOfLastItem, filteredTheses.length)}</span> of <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-md text-xs">{filteredTheses.length}</span> results
              </p>
              
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/80 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-md">
                   <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`h-9 px-3 rounded-md flex items-center gap-2 transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setViewMode('grid')}
                   >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="text-xs font-medium hidden sm:inline">Grid</span>
                   </motion.button>
                   <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`h-9 px-3 rounded-md flex items-center gap-2 transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setViewMode('list')}
                   >
                      <List className="h-4 w-4" />
                      <span className="text-xs font-medium hidden sm:inline">List</span>
                   </motion.button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] bg-white/80 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-700">
                    <SelectItem value="relevance" className="focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-600">📊 Sort by Relevance</SelectItem>
                    <SelectItem value="date" className="focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-600">📅 Sort by Date</SelectItem>
                    <SelectItem value="title" className="focus:bg-pink-50 dark:focus:bg-pink-900/20 focus:text-pink-600">🔤 Sort by Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Results Grid/List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {currentItems.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* <div className="flex flex-row flex-wrap justify-start gap-6"> */}
                      {currentItems.map((thesis, index) => (
                        <motion.div 
                          key={thesis._id} 
                          layout 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                          className="w-fit"
                          hidden={ !(thesis.isPublic || user.role == 'advisor') }
                        >
                          <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full w-fit flex flex-col">
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <CardContent className="relative p-6 flex-1 space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-sm backdrop-blur-sm text-xs font-medium px-2.5 py-0.5">
                                  {getCategoryLabel(thesis.category)}
                                </Badge>
                                <Badge variant="outline" className={thesis.isPublic ? "text-xs text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 font-medium" : "text-xs text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30 font-medium"}>
                                  {thesis.isPublic ? "Public" : "Restricted"}
                                </Badge>
                              </div>
                              
                              <Link href={thesis.isPublic ? `/dashboard/thesis-view/${thesis._id}` : `/dashboard/thesis/${thesis._id}`} className="block group/title">
                                <h3 className="text-lg font-heading font-semibold text-foreground group-hover/title:text-transparent group-hover/title:bg-clip-text group-hover/title:bg-gradient-to-r group-hover/title:from-blue-600 group-hover/title:to-purple-600 transition-all line-clamp-2 min-h-[3.5rem]">
                                  {thesis.title || "Untitled Thesis"}
                                </h3>
                              </Link>

                              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {thesis.abstract || "No abstract available."}
                              </p>
                              
                              <div className="flex flex-wrap gap-2">
                                {thesis.keywords?.split(',').slice(0, 3).map((keyword, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 font-medium">
                                    {keyword.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                            
                            <CardFooter className="relative p-6 pt-0 flex flex-col gap-3">
                               <Separator />
                               <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md">
                                      <User className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="truncate max-w-[120px] font-medium">{thesis.author?.firstName}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    <span className="font-medium">{thesis.year}</span>
                                  </div>
                               </div>
                               <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300" asChild>
                                  <Link href={thesis.isPublic ? `/dashboard/thesis-view/${thesis._id}` : `/dashboard/thesis/${thesis._id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                               </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // LIST VIEW - Enhanced Premium Design
                    <div className="space-y-4">
                      {currentItems.map((thesis, index) => (
                        <motion.div 
                          key={thesis._id} 
                          layout
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ 
                            delay: index * 0.05,
                            layout: { duration: 0.3, ease: "easeInOut" }
                          }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                           <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                              {/* Gradient overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              
                              {/* Left gradient accent bar */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              
                              <CardContent className="relative p-5">
                                 <div className="flex flex-col md:flex-row items-start gap-5">
                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0 space-y-3">
                                       {/* Header with badges */}
                                       <div className="flex items-center gap-2 flex-wrap">
                                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-md text-xs font-semibold px-3 py-1">
                                            {getCategoryLabel(thesis.category)}
                                          </Badge>
                                          <Badge variant="outline" className={thesis.isPublic ? "text-xs text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 font-medium px-2.5 py-0.5" : "text-xs text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30 font-medium px-2.5 py-0.5"}>
                                            {thesis.isPublic ? "🌐 Public" : "🔒 Restricted"}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {thesis.thesis_id}
                                          </span>
                                       </div>
                                       
                                       {/* Title */}
                                       <Link href={thesis.isPublic ? `/dashboard/thesis-view/${thesis._id}` : `/dashboard/thesis/${thesis._id}`} className="block group/title">
                                         <h3 className="font-heading font-bold text-xl text-foreground group-hover/title:text-transparent group-hover/title:bg-clip-text group-hover/title:bg-gradient-to-r group-hover/title:from-blue-600 group-hover/title:to-purple-600 transition-all line-clamp-2">
                                           {thesis.title || "Untitled Thesis"}
                                         </h3>
                                       </Link>
                                       
                                       {/* Abstract */}
                                       <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                         {thesis.abstract || "No abstract available."}
                                       </p>
                                       
                                       {/* Metadata row */}
                                       <div className="flex items-center gap-5 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-2">
                                             <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                               <User className="h-3.5 w-3.5 text-white" />
                                             </div>
                                             <span className="font-medium">{thesis.author?.firstName} {thesis.author?.lastName}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <Calendar className="h-3.5 w-3.5 text-purple-600" />
                                             <span className="font-medium">{thesis.year}</span>
                                          </div>
                                          {thesis.downloadCount !== undefined && (
                                             <div className="flex items-center gap-2 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <Download className="h-3.5 w-3.5 text-green-600" />
                                                <span className="text-xs font-semibold text-green-600">{thesis.downloadCount}</span>
                                             </div>
                                          )}
                                       </div>
                                       
                                       {/* Keywords */}
                                       {thesis.keywords && (
                                          <div className="flex flex-wrap gap-2">
                                             {thesis.keywords.split(',').slice(0, 4).map((keyword, idx) => (
                                               <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium">
                                                 {keyword.trim()}
                                               </Badge>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto">
                                       <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-none w-full md:w-auto">
                                          <Button 
                                             variant="outline" 
                                             size="sm" 
                                             className="w-full bg-white/60 dark:bg-gray-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium transition-all" 
                                             asChild
                                          >
                                             <a onClick={() => savelog(thesis._id)} href={`/api/thesis/${thesis._id}/file`} download className="flex items-center justify-center gap-2">
                                                <Download className="h-4 w-4" /> Download
                                             </a>
                                          </Button>
                                       </motion.div>
                                       <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-none w-full md:w-auto">
                                          <Button 
                                             size="sm" 
                                             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 font-medium transition-all duration-300" 
                                             asChild
                                          >
                                             <Link href={thesis.isPublic ? `/dashboard/thesis-view/${thesis._id}` : `/dashboard/thesis/${thesis._id}`} className="flex items-center justify-center gap-2">
                                                <Eye className="h-4 w-4" /> View Details
                                             </Link>
                                          </Button>
                                       </motion.div>
                                    </div>
                                 </div>
                              </CardContent>
                           </Card>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 bg-muted/10 rounded-xl border-2 border-dashed">
                    <p className="text-muted-foreground">No theses found matching your criteria.</p>
                    <Button variant="link" onClick={clearFilters}>Clear Filters</Button>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {filteredTheses.length > itemsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     // Simple pagination logic to show limited page numbers
                     let pageNum = i + 1;
                     if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                     }
                     if (pageNum > totalPages) return null;

                     return (
                       <Button
                         key={pageNum}
                         variant={currentPage === pageNum ? "default" : "ghost"}
                         size="sm"
                         className="w-8 h-8 p-0"
                         onClick={() => handlePageChange(pageNum)}
                       >
                         {pageNum}
                       </Button>
                     )
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}