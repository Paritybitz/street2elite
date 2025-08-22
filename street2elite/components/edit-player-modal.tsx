"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Camera } from "lucide-react"

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name must be less than 60 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const dob = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      return dob < today && age < 18
    }, "Date of birth must be in the past and player must be under 18"),
  playerPhoto: z.any().optional(),
  medicalFile: z.any().optional(),
})

interface EditPlayerModalProps {
  open: boolean
  onClose: () => void
  onPlayerUpdated: () => void
  player: any
}

export function EditPlayerModal({ open, onClose, onPlayerUpdated, player }: EditPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [selectedMedicalFile, setSelectedMedicalFile] = useState<File | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    reset,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
    },
  })

  // Set form values when player changes
  useEffect(() => {
    if (player && open) {
      setValue("fullName", `${player.first_name} ${player.last_name}`)
      setValue("dateOfBirth", player.date_of_birth)
      setSelectedPhoto(null)
      setSelectedMedicalFile(null)
    }
  }, [player, open, setValue])

  const watchedFields = watch()
  const isFormValid = 
    watchedFields.fullName && 
    watchedFields.fullName.length >= 2 && 
    watchedFields.dateOfBirth &&
    Object.keys(errors).length === 0

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      setValue("playerPhoto", file)
      clearErrors("playerPhoto")
    }
  }

  const handleMedicalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedMedicalFile(file)
      setValue("medicalFile", file)
      clearErrors("medicalFile")
    }
  }

  const removePhoto = () => {
    setSelectedPhoto(null)
    setValue("playerPhoto", undefined)
  }

  const removeMedicalFile = () => {
    setSelectedMedicalFile(null)
    setValue("medicalFile", undefined)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("Not authenticated")
      }

      // Update child record
      const { error: updateError } = await supabase
        .from("children")
        .update({
          first_name: values.fullName.split(" ")[0],
          last_name: values.fullName.split(" ").slice(1).join(" ") || "",
          date_of_birth: values.dateOfBirth,
        })
        .eq("id", player.id)
        .eq("parent_id", user.id) // Security check

      if (updateError) {
        throw new Error(`Failed to update player: ${updateError.message}`)
      }

      // Handle photo upload if new photo selected
      if (selectedPhoto) {
        const photoExt = selectedPhoto.name.split(".").pop()
        const photoFileName = `${user.id}/${player.id}/photo.${photoExt}`
        
        const { error: photoUploadError } = await supabase.storage
          .from("player-photos")
          .upload(photoFileName, selectedPhoto, {
            cacheControl: '3600',
            upsert: true
          })

        if (photoUploadError) {
          console.warn("Failed to upload photo:", photoUploadError)
        } else {
          // Update photo URL in database
          await supabase
            .from("children")
            .update({ photo_url: photoFileName })
            .eq("id", player.id)
        }
      }

      // Handle medical file upload if new file selected
      if (selectedMedicalFile) {
        const medicalExt = selectedMedicalFile.name.split(".").pop()
        const medicalFileName = `${user.id}/${player.id}/medical.${medicalExt}`
        
        const { error: medicalUploadError } = await supabase.storage
          .from("medical-forms")
          .upload(medicalFileName, selectedMedicalFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (!medicalUploadError) {
          // Update or create medical form record
          const validFrom = new Date()
          const validTo = new Date(validFrom)
          validTo.setFullYear(validTo.getFullYear() + 1)

          await supabase
            .from("medical_forms")
            .upsert({
              child_id: player.id,
              file_url: medicalFileName,
              valid_from: validFrom.toISOString(),
              valid_to: validTo.toISOString(),
              status: "approved",
            })
        }
      }

      toast.success("Player updated successfully!")
      handleClose()
      onPlayerUpdated()
      
    } catch (error: any) {
      console.error("Error updating player:", error)
      toast.error(error.message || "Couldn't update player. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      setSelectedPhoto(null)
      setSelectedMedicalFile(null)
      onClose()
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-slate-900/95 backdrop-blur-sm border-slate-700 max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-white">Edit Player</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update {player?.first_name}'s information.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Full Name *
              </label>
              <Input
                {...register("fullName")}
                placeholder="Enter player's full name"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                autoFocus
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm font-medium text-red-400">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Date of Birth *
              </label>
              <Input
                {...register("dateOfBirth")}
                type="date"
                className="bg-slate-700/50 border-slate-600 text-white"
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-sm font-medium text-red-400">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Update Player Photo (Optional)
              </label>
              <div className="space-y-2">
                {!selectedPhoto ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold">Click to upload new photo</span>
                      </p>
                      <p className="text-xs text-slate-500">JPG, PNG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={handlePhotoChange}
                      disabled={isLoading}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <span className="text-sm text-slate-300 truncate">
                      📷 {selectedPhoto.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removePhoto}
                      disabled={isLoading}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Update Medical Form (Optional)
              </label>
              <div className="space-y-2">
                {!selectedMedicalFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold">Click to upload new form</span>
                      </p>
                      <p className="text-xs text-slate-500">PDF, JPG, PNG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleMedicalFileChange}
                      disabled={isLoading}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <span className="text-sm text-slate-300 truncate">
                      📄 {selectedMedicalFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeMedicalFile}
                      disabled={isLoading}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Player"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
