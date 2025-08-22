import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { ToastProvider } from "@/components/toast-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Street 2 Elite",
  description: "Professional football academy training sessions",
  icons: {
    icon: "/s2e-white.png",
    shortcut: "/s2e-white.png",
    apple: "/s2e-white.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
