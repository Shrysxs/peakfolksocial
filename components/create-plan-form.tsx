"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, ImageIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import useCreatePlan from "@/hooks/use-create-plan" // Import the new hook
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreatePlanFormProps {
  onPlanCreated?: () => void
}

export function CreatePlanForm({ onPlanCreated }: CreatePlanFormProps) {
  const { dbUser } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined)
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined)
  const [costPerHead, setCostPerHead] = useState<number | undefined>(undefined)
  const [currency, setCurrency] = useState("USD")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { createPlan, isCreatingPlan } = useCreatePlan() // Use the new hook

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!dbUser) {
      toast.error("You must be logged in to create a plan.")
      return
    }

    if (!title.trim() || !description.trim() || !location.trim() || !dateTime || costPerHead === undefined) {
      toast.error("Please fill in all required fields.")
      return
    }

    createPlan(
      {
        userId: dbUser.id,
        planData: {
          title,
          description,
          location,
          dateTime,
          maxParticipants,
          costPerHead,
          currency,
        },
        imageFile: imageFile || undefined,
      },
      {
        onSuccess: () => {
          setTitle("")
          setDescription("")
          setLocation("")
          setDateTime(undefined)
          setMaxParticipants(undefined)
          setCostPerHead(undefined)
          setCurrency("USD")
          setImageFile(null)
          setImagePreview(null)
          onPlanCreated?.()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title" className="text-white">
          Plan Title
        </Label>
        <Input
          id="title"
          placeholder="e.g., Weekend Trek to Everest Base Camp"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description" className="text-white">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your plan in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location" className="text-white">
          Location
        </Label>
        <Input
          id="location"
          placeholder="e.g., Himalayas, Nepal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dateTime" className="text-white">
          Date & Time
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                !dateTime && "text-gray-500",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTime ? format(dateTime, "PPP HH:mm") : <span>Pick a date and time</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 text-white">
            <Calendar
              mode="single"
              selected={dateTime}
              onSelect={setDateTime}
              initialFocus
              className="rounded-md border"
            />
            <div className="p-3 border-t border-gray-700">
              <Input
                type="time"
                value={dateTime ? format(dateTime, "HH:mm") : ""}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":").map(Number)
                  if (dateTime) {
                    const newDateTime = new Date(dateTime)
                    newDateTime.setHours(hours, minutes)
                    setDateTime(newDateTime)
                  } else {
                    const now = new Date()
                    now.setHours(hours, minutes)
                    setDateTime(now)
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white focus-visible:ring-orange-500"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="maxParticipants" className="text-white">
            Max Participants (Optional)
          </Label>
          <Input
            id="maxParticipants"
            type="number"
            placeholder="e.g., 10"
            value={maxParticipants === undefined ? "" : maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value ? Number.parseInt(e.target.value) : undefined)}
            min={1}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="costPerHead" className="text-white">
            Cost Per Head
          </Label>
          <div className="flex items-center">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[80px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="costPerHead"
              type="number"
              placeholder="e.g., 500"
              value={costPerHead === undefined ? "" : costPerHead}
              onChange={(e) => setCostPerHead(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
              min={0}
              step="0.01"
              required
              className="flex-1 ml-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image" className="text-white">
          Plan Image (Optional)
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1 bg-gray-800 border-gray-700 text-white file:text-orange-500 file:bg-gray-700 file:border-none file:rounded-md file:px-3 file:py-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("image")?.click()}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="sr-only">Upload Image</span>
          </Button>
        </div>
        {imagePreview && (
          <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden">
            <img src={imagePreview || "/placeholder.svg"} alt="Image Preview" className="object-cover w-full h-full" />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isCreatingPlan}>
        {isCreatingPlan ? <LoadingSpinner className="text-white" /> : "Create Plan"}
      </Button>
    </form>
  )
}
