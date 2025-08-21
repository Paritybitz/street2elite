"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const floatingIcons = [
  { icon: "⚽", delay: 0, duration: 15 },
  { icon: "🏆", delay: 2, duration: 18 },
  { icon: "🥅", delay: 4, duration: 20 },
  { icon: "⚽", delay: 6, duration: 16 },
  { icon: "🏃‍♂️", delay: 8, duration: 22 },
  { icon: "🎯", delay: 10, duration: 19 },
]

export function FloatingElements() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Don't render anything until mounted on client
  if (!isMounted) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-10 blur-sm"
          initial={{
            x: Math.random() * dimensions.width,
            y: dimensions.height + 100,
            rotate: 0,
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: -100,
            rotate: 360,
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            filter: "blur(1px)",
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  )
}
