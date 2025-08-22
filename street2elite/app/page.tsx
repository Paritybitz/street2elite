"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FloatingElements } from "@/components/floating-elements"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black relative overflow-hidden">
      <FloatingElements />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Logo replacing text */}
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/s2e-white.png"
                  alt="Street 2 Elite"
                  width={120}
                  height={80}
                  className="h-10 w-auto rounded-lg"
                />
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/merch" className="text-white/80 hover:text-white transition-colors font-mono">
                  Merch
                </Link>
                <a href="#" className="text-white/80 hover:text-white transition-colors font-mono">
                  Contact Us
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Functional Sign In button */}
              <Link href="/auth/login" className="text-white/80 hover:text-white transition-colors font-mono">
                Sign In
              </Link>
              {/* Functional Join Now button */}
              <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-mono font-bold">
                <Link href="/auth/signup">Join Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo & Brand Name */}
          <div className="mb-12 animate-fade-up">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-wider font-mono uppercase">
              Street{""}
              <span className="text-7xl md:text-9xl text-teal-400 inline-block transform hover:scale-110 transition-transform duration-300 font-black">
                2
              </span>{""}
              <span className="relative inline-block">
                <span className="text-white decoration-yellow-400 decoration-4 underline-offset-8 animate-glow font-black">
                  Elite
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-mono">

              <span className="text-teal-400 font-bold">Elite training. Elite results.</span>
            </p>
          </div>

          {/* CTA Button - Functional */}
          <div className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-teal-500/25 hover:scale-110 transition-all duration-300 animate-wiggle-once font-mono font-bold uppercase tracking-wide">
              <Link href="/auth/signup">Join Now</Link>
            </Button>
          </div>

          {/* Subtitle */}
          <p
            className="mt-8 text-white/60 text-lg animate-fade-up font-mono font-bold uppercase tracking-widest"
            style={{ animationDelay: "1s" }}
          >
            Transform your game. Join the elite.
          </p>
        </div>
      </main>

      {/* Bottom Section */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/40 text-sm font-mono">Trusted by over 500 young athletes across the region</p>
      </div>
    </div>
  )
}
