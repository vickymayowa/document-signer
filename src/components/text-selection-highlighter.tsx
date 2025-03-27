"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface TextSelectionHighlighterProps {
  children: React.ReactNode
  onTextSelected: (text: string, position: { x: number; y: number }, boundingRect: DOMRect) => void
  isActive: boolean
  setIsTextSelected: (isSelected: boolean) => void
  highlightColor: string
  isHighlight: boolean
}

export default function TextSelectionHighlighter({
  children,
  onTextSelected,
  isActive,
  setIsTextSelected,
  highlightColor,
  isHighlight,
}: TextSelectionHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleMouseUp = () => {
      const selection = window.getSelection()

      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
        return
      }

      const range = selection.getRangeAt(0)
      const selectedText = selection.toString().trim()

      if (selectedText) {
        setIsTextSelected(true)

        // Get the bounding rectangle of the selection
        const rect = range.getBoundingClientRect()

        // Get the container's position
        const containerRect = containerRef.current!.getBoundingClientRect()

        // Calculate position relative to the container
        const position = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
        }

        // Call the callback with the selected text and position
        onTextSelected(selectedText, position, rect)

        // Clear the selection
        selection.removeAllRanges()

        toast({
          title: isHighlight ? "Text highlighted" : "Text underlined",
          description: selectedText.length > 30 ? `${selectedText.substring(0, 30)}...` : selectedText,
          duration: 2000,
        })
      }
    }

    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isActive, onTextSelected, setIsTextSelected, toast, isHighlight])

  return (
    <div
      ref={containerRef}
      className={isActive ? "cursor-text" : ""}
      style={
        {
          position: "relative",
          ...(isActive &&
            isHighlight && {
              "--selection-background": highlightColor,
              "--selection-color": "#000000",
            }),
        } as React.CSSProperties
      }
    >
      {children}

      {/* Custom selection styling */}
      {isActive && (
        <style jsx global>{`
          ::selection {
            background-color: ${isHighlight ? highlightColor : "transparent"};
            color: #000000;
            text-decoration: ${!isHighlight ? `underline ${highlightColor}` : "none"};
          }
        `}</style>
      )}
    </div>
  )
}

