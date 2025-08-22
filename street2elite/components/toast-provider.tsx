"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster 
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgb(30 41 59)',
          border: '1px solid rgb(71 85 105)',
          color: 'rgb(248 250 252)',
        },
      }}
    />
  )
}
