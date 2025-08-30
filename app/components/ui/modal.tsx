"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "w-full h-full max-w-none max-h-none",
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "lg",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose()
      }
    },
    [onClose, closeOnEscape],
  )

  // Handle focus trap
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Tab" || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        event.preventDefault()
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Prevent body scroll
      document.body.style.overflow = "hidden"

      // Add event listeners
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("keydown", handleTabKey)

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      // Restore body scroll
      document.body.style.overflow = "unset"

      // Remove event listeners
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("keydown", handleTabKey)

      // Restore focus to previous element
      previousActiveElement.current?.focus()
    }

    return () => {
      document.body.style.overflow = "unset"
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [isOpen, handleEscape, handleTabKey])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ margin: 0, padding: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className={
              size === "full"
                ? "absolute bg-white rounded-xl border-0 overflow-hidden"
                : `relative bg-white rounded-xl shadow-lg ${sizeClasses[size]} m-4 ${className}`
            }
            style={
              size === "full"
                ? {
                    top: "10vh",
                    left: "10vw",
                    right: "10vw",
                    bottom: "10vh",
                  }
                : undefined
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            tabIndex={-1}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={size === "full" ? "flex-1 overflow-hidden" : ""}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Render in portal
  return typeof window !== "undefined" ? createPortal(modalContent, document.body) : null
}

// Hook for modal state management
export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), [])

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  }
}
