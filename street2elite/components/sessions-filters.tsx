"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, Filter } from "lucide-react"

export function SessionsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [skillLevel, setSkillLevel] = useState(searchParams.get("skill_level") || "all")
  const [date, setDate] = useState(searchParams.get("date") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (skillLevel !== "all") params.set("skill_level", skillLevel)
    if (date) params.set("date", date)
    if (location) params.set("location", location)

    router.push(`/sessions?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setSkillLevel("all")
    setDate("")
    setLocation("")
    router.push("/sessions")
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-slate-200">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Skill Level</Label>
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-slate-200">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-200">
            Location
          </Label>
          <Input
            id="location"
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters} className="flex-1 bg-teal-600 hover:bg-teal-700">
            Apply Filters
          </Button>
          <Button
            onClick={clearFilters}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
