import type React from "react"
import { useState } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  return `${count++}`
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  function toast({ title, description, variant, action }: Omit<ToasterToast, "id">) {
    const id = generateId()

    const newToast = {
      id,
      title,
      description,
      variant,
      action,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 3000)

    return {
      id,
      dismiss: () => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)),
      update: (props: Omit<ToasterToast, "id">) => {
        setToasts((prevToasts) => prevToasts.map((toast) => (toast.id === id ? { ...toast, ...props } : toast)))
      },
    }
  }

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      setToasts((prevToasts) => (toastId ? prevToasts.filter((toast) => toast.id !== toastId) : []))
    },
  }
}

