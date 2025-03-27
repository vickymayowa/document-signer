"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2, AlertCircle } from "lucide-react"
import type { AnnotationType, Annotation } from "@/lib/types"
import SignatureCanvas from "@/components/signature-canvas"
import CommentPopover from "@/components/comment-popover"
import TextSelectionHighlighter from "@/components/text-selection-highlighter"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface DocumentViewerProps {
  file: File
  currentTool: AnnotationType
  currentColor: string
  annotations: Annotation[]
  onAddAnnotation: (annotation: Partial<Annotation>) => void
  onDeleteAnnotation: (id: number) => void
  currentPage: number
  onPageChange: (page: number) => void
  onDocumentLoad: (numPages: number) => void
  zoomLevel: number
}

export default function DocumentViewer({
  file,
  currentTool,
  currentColor,
  annotations,
  onAddAnnotation,
  onDeleteAnnotation,
  currentPage,
  onPageChange,
  onDocumentLoad,
  zoomLevel,
}: DocumentViewerProps) {
  const [selection, setSelection] = useState<{ x: number; y: number } | null>(null)
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [showCommentPopover, setShowCommentPopover] = useState(false)
  const [isTextSelected, setIsTextSelected] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileUrl = URL.createObjectURL(file)

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onDocumentLoad(numPages)
    setIsLoading(false)
    setLoadError(null)
  }

  const handleDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error)
    setLoadError(error)
    setIsLoading(false)
  }

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isTextSelected) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (currentTool === "signature") {
        setSelection({ x, y })
        setShowSignatureCanvas(true)
      } else if (currentTool === "comment") {
        setSelection({ x, y })
        setShowCommentPopover(true)
      }
    },
    [currentTool, isTextSelected],
  )

  const handleSignatureSave = (signatureData: string) => {
    if (selection) {
      onAddAnnotation({
        position: selection,
        data: signatureData,
      })
      setShowSignatureCanvas(false)
      setSelection(null)
    }
  }

  const handleCommentSave = (text: string) => {
    if (selection) {
      onAddAnnotation({
        position: selection,
        data: text,
      })
      setShowCommentPopover(false)
      setSelection(null)
    }
  }

  const handleTextSelection = (selectedText: string, position: { x: number; y: number }, boundingRect: DOMRect) => {
    if (selectedText && (currentTool === "highlight" || currentTool === "underline")) {
      onAddAnnotation({
        position,
        data: selectedText,
        boundingRect: {
          x: boundingRect.x,
          y: boundingRect.y,
          width: boundingRect.width,
          height: boundingRect.height,
        },
      })
    }
    setIsTextSelected(false)
  }

  const pageAnnotations = annotations.filter((annotation) => annotation.page === currentPage)

  return (
    <div
      className="relative bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out"
      ref={containerRef}
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center top" }}
    >
      {loadError && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load PDF document: {loadError.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={
          <div className="flex items-center justify-center h-[800px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading document...</p>
            </div>
          </div>
        }
        error={null} // We handle errors manually above
      >
        <div
          onClick={handleClick}
          className={cn(
            "transition-all duration-300",
            (currentTool === "signature" || currentTool === "comment") && "cursor-crosshair",
          )}
        >
          <TextSelectionHighlighter
            onTextSelected={handleTextSelection}
            isActive={currentTool === "highlight" || currentTool === "underline"}
            setIsTextSelected={setIsTextSelected}
            highlightColor={currentColor}
            isHighlight={currentTool === "highlight"}
          >
            <Page
              pageNumber={currentPage}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mx-auto shadow-sm"
              width={Math.min(window.innerWidth * 0.7, 800)}
              loading={null}
            />
          </TextSelectionHighlighter>
        </div>
      </Document>

      {/* Render annotations */}
      {pageAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className={cn(
            "absolute pointer-events-none transition-opacity duration-300",
            annotation.type === "highlight" && "bg-opacity-40 rounded",
            annotation.type === "underline" && "border-b-2",
          )}
          style={{
            left: `${annotation.position.x}px`,
            top: `${annotation.position.y}px`,
            ...(annotation.type === "highlight" && { backgroundColor: annotation.color }),
            ...(annotation.type === "underline" && { borderBottomColor: annotation.color }),
            ...(annotation.boundingRect && {
              width: `${annotation.boundingRect.width}px`,
              height: `${annotation.boundingRect.height}px`,
            }),
          }}
        >
          {annotation.type === "signature" && (
            <img src={annotation.data || "/placeholder.svg"} alt="Signature" className="max-w-[200px] max-h-[100px]" />
          )}
          {annotation.type === "comment" && (
            <div className="bg-yellow-100 p-2 rounded shadow-sm border border-yellow-300 max-w-[200px]">
              {annotation.data}
            </div>
          )}
        </div>
      ))}

      {showSignatureCanvas && (
        <SignatureCanvas
          onSave={handleSignatureSave}
          onCancel={() => {
            setShowSignatureCanvas(false)
            setSelection(null)
          }}
        />
      )}

      {showCommentPopover && selection && (
        <CommentPopover
          position={selection}
          onSave={handleCommentSave}
          onCancel={() => {
            setShowCommentPopover(false)
            setSelection(null)
          }}
        />
      )}
    </div>
  )
}

