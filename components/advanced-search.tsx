"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Calendar, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

interface SearchFilters {
  query: string
  location: string
  category: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  priceRange: [number, number]
  maxParticipants: number | undefined
  tags: string[]
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  isLoading?: boolean
}

const CATEGORIES = [
  "All",
  "Sports & Fitness",
  "Food & Dining",
  "Travel & Adventure",
  "Arts & Culture",
  "Technology",
  "Business & Networking",
  "Education",
  "Entertainment",
  "Health & Wellness",
  "Outdoor & Nature",
  "Music & Events",
  "Gaming",
  "Volunteering",
  "Other"
]

const POPULAR_TAGS = [
  "Free",
  "Family Friendly",
  "Beginner Friendly",
  "Advanced",
  "Weekend",
  "Evening",
  "Morning",
  "Virtual",
  "Outdoor",
  "Indoor",
  "Group Activity",
  "One-on-One",
  "Workshop",
  "Meetup",
  "Competition"
]

export function AdvancedSearch({ onSearch, onClear, isLoading }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    category: "All",
    dateRange: {
      from: undefined,
      to: undefined
    },
    priceRange: [0, 1000],
    maxParticipants: undefined,
    tags: []
  })

  const [isLocationFocused, setIsLocationFocused] = useState(false)

  // Handle location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (filters.location.length > 2) {
      // Simulate location suggestions (replace with actual geocoding service)
      const suggestions = [
        `${filters.location}, New York`,
        `${filters.location}, Los Angeles`,
        `${filters.location}, Chicago`,
        `${filters.location}, Houston`,
        `${filters.location}, Phoenix`
      ]
      setLocationSuggestions(suggestions)
    } else {
      setLocationSuggestions([])
    }
  }, [filters.location])

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      query: "",
      location: "",
      category: "All",
      dateRange: {
        from: undefined,
        to: undefined
      },
      priceRange: [0, 1000],
      maxParticipants: undefined,
      tags: []
    })
    onClear()
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const activeFiltersCount = [
    filters.query,
    filters.location,
    filters.category !== "All",
    filters.dateRange.from,
    filters.dateRange.to,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
    filters.maxParticipants,
    filters.tags.length > 0
  ].filter(Boolean).length

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Main Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search plans, activities, or keywords..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
              className="pl-10"
            />
            {isLocationFocused && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 mt-1">
                {locationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, location: suggestion }))
                      setIsLocationFocused(false)
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Filters</h4>
                
                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange, from: date }
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange, to: date }
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Max Participants */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Participants</label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={filters.maxParticipants || ""}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.query && (
              <Badge variant="secondary" className="gap-1">
                &quot;{filters.query}&quot;
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, query: "" }))}
                />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="gap-1">
                📍 {filters.location}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, location: "" }))}
                />
              </Badge>
            )}
            {filters.category !== "All" && (
              <Badge variant="secondary" className="gap-1">
                {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, category: "All" }))}
                />
              </Badge>
            )}
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 