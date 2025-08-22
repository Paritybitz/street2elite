"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignupPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        toast.error("Passwords don't match")
        setIsLoading(false)
        return
      }

      // Validate password length
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        toast.error("An account with this email already exists")
        setIsLoading(false)
        return
      }

      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes("already registered")) {
          toast.error("An account with this email already exists")
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.user) {
        toast.success("Account created successfully!")
        router.push("/auth/signup-success")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image
              src="/s2e-white.png"
              alt="Street 2 Elite"
              width={160}
              height={120}
              className="h-16 w-auto mx-auto rounded-lg"
            />
          </Link>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Join Street2Elite</CardTitle>
            <p className="text-slate-400">Create your academy account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-200 block mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200 block mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-400 hover:text-teal-300">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
