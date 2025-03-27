"use client"

import { useState } from "react"
import {
  HighlighterIcon,
  Underline,
  MessageSquare,
  PenTool,
  Download,
  ChevronLeft,
  ChevronRight,
  Undo2,
  ZoomIn,
  ZoomOut,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AnnotationType, Annotation } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AnnotationToolbarProps {
  currentTool: AnnotationType
  currentColor: string
  onToolChange: (tool: AnnotationType) => void
  onColorChange: (color: string) => void
  onExport: () => void
  currentPage: number
  numPages: number
  onPageChange: (page: number) => void
  isExporting: boolean
  onUndo: () => void
  zoomLevel: number
  onZoomChange: (zoom: number) => void
  annotations: Annotation[]
  onDeleteAnnotation: (id: number) => void
}

const colorOptions = [
  { value: "#FFEB3B", label: "Yellow" },
  { value: "#4CAF50", label: "Green" },
  { value: "#2196F3", label: "Blue" },
  { value: "#F44336", label: "Red" },
  { value: "#9C27B0", label: "Purple" },
  { value: "#FF9800", label: "Orange" },
  { value: "#00BCD4", label: "Cyan" },
  { value: "#607D8B", label: "Blue Grey" },
]

const tools = [
  { id: "highlight" as AnnotationType, icon: HighlighterIcon, label: "Highlight Text", shortcut: "H" },
  { id: "underline" as AnnotationType, icon: Underline, label: "Underline Text", shortcut: "U" },
  { id: "comment" as AnnotationType, icon: MessageSquare, label: "Add Comment", shortcut: "C" },
  { id: "signature" as AnnotationType, icon: PenTool, label: "Draw Signature", shortcut: "S" },
]

export default function AnnotationToolbar({
  currentTool,
  currentColor,
  onToolChange,
  onColorChange,
  onExport,
  currentPage,
  numPages,
  onPageChange,
  isExporting,
  onUndo,
  zoomLevel,
  onZoomChange,
  annotations,
  onDeleteAnnotation,
}: AnnotationToolbarProps) {
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [activeTab, setActiveTab] = useState("tools")

  const handleZoomChange = (value: number[]) => {
    onZoomChange(value[0])
  }

  const formatZoomLevel = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden sticky top-4 max-h-[800px] flex flex-col">
      <Tabs defaultValue="tools" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="layers" className="relative">
            Layers
            {annotations.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              >
                {annotations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="p-4 space-y-6 m-0">
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
              <span>Annotation Tools</span>
              <Button variant="ghost" size="sm" onClick={onUndo} className="h-7 px-2">
                <Undo2 className="h-4 w-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                {tools.map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentTool === tool.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onToolChange(tool.id)}
                        className="h-10 w-full justify-start gap-2"
                      >
                        <tool.icon className="h-4 w-4" />
                        <span>{tool.label}</span>
                        <kbd className="ml-auto inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                          {tool.shortcut}
                        </kbd>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>
                        {tool.label} (Press {tool.shortcut})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {(currentTool === "highlight" || currentTool === "underline") && (
            <div className="transition-all duration-200">
              <h3 className="text-sm font-medium mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <Tooltip key={color.value}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "h-6 w-6 rounded-full border border-muted-foreground/25 transition-all",
                          currentColor === color.value && "ring-2 ring-primary ring-offset-2 scale-110",
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() => onColorChange(color.value)}
                      >
                        <span className="sr-only">{color.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-3">Page Navigation</h3>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentPage} / {numPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Zoom</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoomLevel]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={handleZoomChange}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onZoomChange(Math.min(2.0, zoomLevel + 0.1))}
                disabled={zoomLevel >= 2.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium w-12 text-center">{formatZoomLevel(zoomLevel)}</span>
            </div>
          </div>

          <Separator />

          <Button className="w-full" onClick={onExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </TabsContent>

        <TabsContent value="layers" className="m-0 p-0 flex flex-col h-[600px]">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-medium">Annotations</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAnnotations(!showAnnotations)} className="h-8 px-2">
              {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {annotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Layers className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No annotations on this page</p>
              </div>
            ) : (
              <ul className="p-2">
                {annotations.map((annotation) => (
                  <li key={annotation.id} className="mb-2">
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
                      {annotation.type === "highlight" && (
                        <HighlighterIcon className="h-4 w-4" style={{ color: annotation.color }} />
                      )}
                      {annotation.type === "underline" && (
                        <Underline className="h-4 w-4" style={{ color: annotation.color }} />
                      )}
                      {annotation.type === "comment" && <MessageSquare className="h-4 w-4" />}
                      {annotation.type === "signature" && <PenTool className="h-4 w-4" />}

                      <div className="flex-1 text-xs">
                        <div className="font-medium capitalize">{annotation.type}</div>
                        <div className="text-muted-foreground truncate">
                          {annotation.type === "comment"
                            ? annotation.data && annotation.data.length > 20
                              ? `${annotation.data.substring(0, 20)}...`
                              : annotation.data
                            : `Added ${new Date(annotation.createdAt).toLocaleTimeString()}`}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onDeleteAnnotation(annotation.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-6 m-0">
          <div>
            <h3 className="text-sm font-medium mb-3">Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Annotations</span>
                <Button
                  variant={showAnnotations ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                >
                  {showAnnotations ? "Visible" : "Hidden"}
                </Button>
              </div>

              <div>
                <span className="text-sm block mb-2">Default Zoom Level</span>
                <Slider value={[zoomLevel]} min={0.5} max={2.0} step={0.1} onValueChange={handleZoomChange} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {tools.map((tool) => (
                <div key={tool.id} className="flex justify-between">
                  <span>{tool.label}</span>
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    {tool.shortcut}
                  </kbd>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Navigate Pages</span>
                <div className="flex gap-1">
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    ←
                  </kbd>
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    →
                  </kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Undo</span>
                <div className="flex gap-1">
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    Ctrl
                  </kbd>
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    Z
                  </kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Zoom In/Out</span>
                <div className="flex gap-1">
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    Ctrl
                  </kbd>
                  <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                    +/-
                  </kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Fullscreen</span>
                <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                  F
                </kbd>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

