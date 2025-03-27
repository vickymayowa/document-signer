"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import DocumentUploader from "@/components/document-uploader"
import DocumentViewer from "@/components/document-viewer"
import AnnotationToolbar from "@/components/annotation-toolbar"
import DocumentHeader from "@/components/document-header"
import type { AnnotationType, Annotation, DocumentMetadata } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHotkeys } from "react-hotkeys-hook"

export default function DocumentSignerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [currentTool, setCurrentTool] = useState<AnnotationType>("highlight")
  const [currentColor, setCurrentColor] = useState<string>("#FFEB3B")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [zoomLevel, setZoomLevel] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const { toast } = useToast()

  // Set up keyboard shortcuts
  useHotkeys("h", () => setCurrentTool("highlight"), { enableOnFormTags: true })
  useHotkeys("u", () => setCurrentTool("underline"), { enableOnFormTags: true })
  useHotkeys("c", () => setCurrentTool("comment"), { enableOnFormTags: true })
  useHotkeys("s", () => setCurrentTool("signature"), { enableOnFormTags: true })
  useHotkeys("left", () => handlePageChange(Math.max(1, currentPage - 1)), { enableOnFormTags: true })
  useHotkeys("right", () => handlePageChange(Math.min(numPages, currentPage + 1)), { enableOnFormTags: true })
  useHotkeys("ctrl+z", handleUndo, { enableOnFormTags: true })
  useHotkeys("ctrl+=", () => setZoomLevel((prev) => Math.min(prev + 0.1, 2.0)), { enableOnFormTags: true })
  useHotkeys("ctrl+-", () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)), { enableOnFormTags: true })
  useHotkeys("f", toggleFullscreen, { enableOnFormTags: true })

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen)
  }

  function handleFileChange(file: File | null, metadata?: DocumentMetadata) {
    setFile(file)
    setAnnotations([])
    setCurrentPage(1)
    setDocumentMetadata(metadata || null)

    if (file) {
      setActiveTab("annotate")
      toast({
        title: "Document loaded successfully",
        description: `${file.name} is ready for annotation.`,
      })
    }
  }

  function handleToolChange(tool: AnnotationType) {
    setCurrentTool(tool)
    toast({
      title: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`,
      description: getToolDescription(tool),
      duration: 2000,
    })
  }

  function getToolDescription(tool: AnnotationType): string {
    switch (tool) {
      case "highlight":
        return "Click and drag to highlight text"
      case "underline":
        return "Click and drag to underline text"
      case "comment":
        return "Click anywhere to add a comment"
      case "signature":
        return "Click anywhere to place your signature"
      default:
        return ""
    }
  }

  function handleColorChange(color: string) {
    setCurrentColor(color)
  }

  function handleAddAnnotation(annotation: Partial<Annotation>) {
    const newAnnotation: Annotation = {
      id: Date.now(),
      type: currentTool,
      page: currentPage,
      position: annotation.position || { x: 0, y: 0 },
      color: currentColor,
      data: annotation.data || "",
      createdAt: new Date().toISOString(),
    }

    setAnnotations((prev) => [...prev, newAnnotation])

    toast({
      title: "Annotation added",
      description: `${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)} annotation added to page ${currentPage}.`,
      duration: 2000,
    })
  }

  function handleDeleteAnnotation(id: number) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))

    toast({
      title: "Annotation deleted",
      description: "The annotation has been removed.",
    })
  }

  function handleUndo() {
    setAnnotations((prev) => {
      const currentPageAnnotations = prev.filter((a) => a.page === currentPage)
      if (currentPageAnnotations.length === 0) return prev

      const lastAnnotation = currentPageAnnotations[currentPageAnnotations.length - 1]
      return prev.filter((a) => a.id !== lastAnnotation.id)
    })

    toast({
      title: "Undo",
      description: "Last annotation has been removed.",
      duration: 2000,
    })
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  async function handleExport() {
    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsExporting(false)

    toast({
      title: "Document exported successfully",
      description: "Your annotated document has been downloaded.",
    })
  }

  return (
    <main
      className={cn(
        "transition-all duration-300 ease-in-out",
        isFullscreen ? "fixed inset-0 z-50 bg-background" : "container mx-auto p-4 max-w-7xl",
      )}
    >
      <DocumentHeader
        file={file}
        documentMetadata={documentMetadata}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="annotate" disabled={!file}>
            Annotate Document
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <Card>
            <DocumentUploader onFileChange={handleFileChange} />
          </Card>
        </TabsContent>

        <TabsContent value="annotate" className="mt-0">
          {file && (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
              <AnnotationToolbar
                currentTool={currentTool}
                currentColor={currentColor}
                onToolChange={handleToolChange}
                onColorChange={handleColorChange}
                onExport={handleExport}
                currentPage={currentPage}
                numPages={numPages}
                onPageChange={handlePageChange}
                isExporting={isExporting}
                onUndo={handleUndo}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                annotations={annotations.filter((a) => a.page === currentPage)}
                onDeleteAnnotation={handleDeleteAnnotation}
              />

              <div className="relative flex-1 overflow-auto bg-muted/30 rounded-lg p-4 min-h-[800px] transition-all duration-300">
                {isExporting && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-lg font-medium">Exporting document...</p>
                    </div>
                  </div>
                )}

                <DocumentViewer
                  file={file}
                  currentTool={currentTool}
                  currentColor={currentColor}
                  annotations={annotations}
                  onAddAnnotation={handleAddAnnotation}
                  onDeleteAnnotation={handleDeleteAnnotation}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onDocumentLoad={setNumPages}
                  zoomLevel={zoomLevel}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {activeTab === "annotate" && file && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Keyboard shortcuts: (H)ighlight, (U)nderline, (C)omment, (S)ignature, ←→ Navigate pages, Ctrl+Z Undo,
            Ctrl+/- Zoom, (F) Fullscreen
          </p>
        </div>
      )}
    </main>
  )
}

