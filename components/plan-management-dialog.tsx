"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Edit, 
  Trash2, 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  AlertTriangle,
  Save,
  Loader2
} from "lucide-react"
import { usePlanManagement } from "@/hooks/use-plan-management"
import { LoadingSpinner } from "./loading-spinner"
import { toast } from "sonner"
import { toDate } from "@/lib/firebase-services"
import type { Plan } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PlanManagementDialogProps {
  plan: Plan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanManagementDialog({ plan, open, onOpenChange }: PlanManagementDialogProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "cancel" | "delete">("edit")
  const [editForm, setEditForm] = useState({
    title: plan.title,
    description: plan.description,
    location: plan.location,
    dateTime: toDate(plan.dateTime)?.toISOString().slice(0, 16) || "",
    maxParticipants: plan.maxParticipants || "",
    costPerHead: plan.costPerHead,
    currency: plan.currency,
    tags: plan.tags?.join(", ") || "",
    requirements: plan.requirements?.join(", ") || "",
    whatToBring: plan.whatToBring?.join(", ") || "",
  })
  const [cancelReason, setCancelReason] = useState("")

  const { updatePlan, cancelPlan, deletePlan, isUpdating, isCancelling, isDeleting } = usePlanManagement()

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updates = {
      title: editForm.title,
      description: editForm.description,
      location: editForm.location,
      dateTime: new Date(editForm.dateTime),
      maxParticipants: editForm.maxParticipants ? parseInt(editForm.maxParticipants.toString()) : undefined,
      costPerHead: editForm.costPerHead,
      currency: editForm.currency,
      tags: editForm.tags ? editForm.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      requirements: editForm.requirements ? editForm.requirements.split(",").map(req => req.trim()).filter(Boolean) : [],
      whatToBring: editForm.whatToBring ? editForm.whatToBring.split(",").map(item => item.trim()).filter(Boolean) : [],
    }

    updatePlan({ planId: plan.id, updates })
  }

  const handleCancelPlan = () => {
    cancelPlan({ planId: plan.id, reason: cancelReason })
    onOpenChange(false)
  }

  const handleDeletePlan = () => {
    deletePlan(plan.id)
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Plan</DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("edit")}
            className={activeTab === "edit" ? "bg-orange-600 text-white" : "border-gray-600 text-white hover:bg-gray-800"}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
          <Button
            variant={activeTab === "cancel" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("cancel")}
            className={activeTab === "cancel" ? "bg-orange-600 text-white" : "border-gray-600 text-white hover:bg-gray-800"}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Plan
          </Button>
          <Button
            variant={activeTab === "delete" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("delete")}
            className={activeTab === "delete" ? "bg-red-600 text-white" : "border-gray-600 text-white hover:bg-gray-800"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Plan
          </Button>
        </div>

        {/* Edit Plan Tab */}
        {activeTab === "edit" && (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Plan Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateTime" className="text-white">Date & Time</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={editForm.dateTime}
                  onChange={(e) => handleInputChange("dateTime", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-white">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={editForm.maxParticipants}
                  onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="costPerHead" className="text-white">Cost per Person</Label>
                <Input
                  id="costPerHead"
                  type="number"
                  value={editForm.costPerHead}
                  onChange={(e) => handleInputChange("costPerHead", parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">Currency</Label>
                <Input
                  id="currency"
                  value={editForm.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={editForm.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                  placeholder="Adventure, Outdoor, Social"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-white">Requirements (comma-separated)</Label>
              <Input
                id="requirements"
                value={editForm.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                placeholder="Age 18+, Physical fitness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatToBring" className="text-white">What to Bring (comma-separated)</Label>
              <Input
                id="whatToBring"
                value={editForm.whatToBring}
                onChange={(e) => handleInputChange("whatToBring", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                placeholder="Water bottle, Comfortable shoes"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Cancel Plan Tab */}
        {activeTab === "cancel" && (
          <div className="space-y-6">
            <div className="bg-orange-600/20 border border-orange-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="text-orange-500 font-semibold">Cancel Plan</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Cancelling this plan will notify all participants and mark the plan as cancelled. 
                This action cannot be undone.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="text-white">Reason for Cancellation (Optional)</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling the plan..."
                rows={3}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isCancelling}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Plan
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Cancel Plan</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you sure you want to cancel this plan? All participants will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-white hover:bg-gray-800">
                      No, keep plan
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelPlan}
                      className="bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Yes, cancel plan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Delete Plan Tab */}
        {activeTab === "delete" && (
          <div className="space-y-6">
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-red-500 font-semibold">Delete Plan</h3>
              </div>
              <p className="text-gray-300 text-sm">
                This action will permanently delete the plan and all associated messages. 
                This cannot be undone.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Plan Details</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span>{toDate(plan.dateTime)?.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span>{plan.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span>{plan.currentParticipants} participants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <span>{plan.costPerHead} {plan.currency} per person</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Plan
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Plan</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you absolutely sure? This action cannot be undone. This will permanently delete the plan and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-white hover:bg-gray-800">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeletePlan}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete Plan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 