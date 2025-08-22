"use client"

import { useState } from "react"
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
  playerPhoto: z
    .any()
    .refine((file) => file instanceof File, "Player photo is required")
    .refine((file) => file?.size <= 5 * 1024 * 1024, "Photo must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file?.type),
      "Photo must be JPG or PNG"
    ),
  medicalFile: z
    .any()
    .refine((file) => file instanceof File, "Medical form is required")
    .refine((file) => file?.size <= 5 * 1024 * 1024, "File must be less than 5MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file?.type),
      "File must be PDF, JPG, or PNG"
    ),
})

interface AddPlayerModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (newPlayer: any) => void  // Changed from onPlayerAdded to onSuccess to match parent usage
}

export function AddPlayerModal({ open, onClose, onSuccess }: AddPlayerModalProps) {
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

  const watchedFields = watch()
  const isFormValid = 
    watchedFields.fullName && 
    watchedFields.fullName.length >= 2 && 
    watchedFields.dateOfBirth && 
    selectedPhoto && 
    selectedMedicalFile &&
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
    setValue("playerPhoto", undefined as any)
  }

  const removeMedicalFile = () => {
    setSelectedMedicalFile(null)
    setValue("medicalFile", undefined as any)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("Not authenticated")
      }

      // Create child record
      const { data: child, error: childError } = await supabase
        .from("children")
        .insert({
          parent_id: user.id,
          first_name: values.fullName.split(" ")[0],
          last_name: values.fullName.split(" ").slice(1).join(" ") || "",
          date_of_birth: values.dateOfBirth,
        })
        .select()
        .single()

      if (childError || !child) {
        throw new Error(`Failed to create player: ${childError?.message}`)
      }

      // Upload player photo
      const photoExt = values.playerPhoto.name.split(".").pop()
      const photoFileName = `${user.id}/${child.id}/photo.${photoExt}`
      
      const { error: photoUploadError } = await supabase.storage
        .from("player-photos")
        .upload(photoFileName, values.playerPhoto, {
          cacheControl: '3600',
          upsert: true
        })

      if (photoUploadError) {
        throw new Error(`Failed to upload photo: ${photoUploadError.message}`)
      }

      // Upload medical form
      const medicalExt = values.medicalFile.name.split(".").pop()
      const medicalFileName = `${user.id}/${child.id}/medical.${medicalExt}`
      
      const { error: medicalUploadError } = await supabase.storage
        .from("medical-forms")
        .upload(medicalFileName, values.medicalFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (medicalUploadError) {
        throw new Error(`Failed to upload medical form: ${medicalUploadError.message}`)
      }

      // Update child record with photo URL
      const { error: updateError } = await supabase
        .from("children")
        .update({ photo_url: photoFileName })
        .eq("id", child.id)

      if (updateError) {
        console.warn("Failed to update photo URL:", updateError)
      }

      // Create medical form record
      const validFrom = new Date()
      const validTo = new Date(validFrom)
      validTo.setFullYear(validTo.getFullYear() + 1)

      const { error: medicalError } = await supabase
        .from("medical_forms")
        .insert({
          child_id: child.id,
          file_url: medicalFileName,
          valid_from: validFrom.toISOString(),
          valid_to: validTo.toISOString(),
          status: "approved",
        })

      if (medicalError) {
        console.warn("Failed to create medical form record:", medicalError)
      }

      toast.success("Player added successfully!")
      handleClose()
      
      // Pass the created child data to the parent
      onSuccess(child)
      
    } catch (error: any) {
      console.error("Error adding player:", error)
      toast.error(error.message || "Couldn't save player. Please try again.")
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
          <DialogTitle className="text-white">Add Player</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a player profile to book sessions.
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
                placeholder="e.g., John Smith"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                autoFocus
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Date of Birth *
              </label>
              <Input
                type="date"
                {...register("dateOfBirth")}
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.dateOfBirth && (
                <p className="text-red-400 text-sm">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Player Photo *
              </label>
              <div className="space-y-3">
                {!selectedPhoto ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-sm text-slate-400">
                        <span className="font-medium">Click to upload</span> player photo
                      </p>
                      <p className="text-xs text-slate-500">JPG or PNG (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handlePhotoChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-600 rounded flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{selectedPhoto.name}</p>
                          <p className="text-xs text-slate-400">
                            {(selectedPhoto.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removePhoto}
                        className="text-slate-400 hover:text-red-400 hover:bg-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {errors.playerPhoto && (
                  <p className="text-red-400 text-sm">{errors.playerPhoto.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Medical Form *
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Upload doctor's physical. Required once per year.
              </p>
              <div className="space-y-3">
                {!selectedMedicalFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-sm text-slate-400">
                        <span className="font-medium">Click to upload</span> medical form
                      </p>
                      <p className="text-xs text-slate-500">PDF, JPG or PNG (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,image/jpeg,image/jpg,image/png"
                      onChange={handleMedicalFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{selectedMedicalFile.name}</p>
                          <p className="text-xs text-slate-400">
                            {(selectedMedicalFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeMedicalFile}
                        className="text-slate-400 hover:text-red-400 hover:bg-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {errors.medicalFile && (
                  <p className="text-red-400 text-sm">{errors.medicalFile.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Player
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
