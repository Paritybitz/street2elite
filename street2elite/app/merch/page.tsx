"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const merchItems = [
  {
    id: 1,
    name: "Street 2 Elite Jersey",
    price: "£25",
    image: "/teal-black-soccer-jersey.png",
    description: "Official training jersey",
  },
  {
    id: 2,
    name: "Elite Training Shorts",
    price: "£18",
    image: "/black-soccer-shorts.png",
    description: "Professional grade shorts",
  },
  {
    id: 3,
    name: "Academy Water Bottle",
    price: "£12",
    image: "/placeholder-gtl10.png",
    description: "Stay hydrated in style",
  },
  {
    id: 4,
    name: "Elite Soccer Ball",
    price: "£22",
    image: "/professional-soccer-ball.png",
    description: "Match quality ball",
  },
]

export default function MerchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white font-bold text-lg font-mono hover:text-teal-400 transition-colors">
              ← Street 2 Elite
            </Link>
            <h1 className="text-white font-black text-2xl font-mono uppercase tracking-wider">Merch Store</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4 font-mono uppercase tracking-wider">Elite Gear</h2>
          <p className="text-white/70 text-lg font-mono">Represent the academy with official merchandise</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {merchItems.map((item) => (
            <Card
              key={item.id}
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105"
            >
              <div className="p-6">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-white font-bold text-lg mb-2 font-mono">{item.name}</h3>
                <p className="text-white/60 text-sm mb-4 font-mono">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 font-bold text-xl font-mono">{item.price}</span>
                  <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-4 py-2 rounded-full font-mono font-bold text-sm">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 mb-6 font-mono">Questions about sizing or shipping?</p>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-full font-mono font-bold">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
