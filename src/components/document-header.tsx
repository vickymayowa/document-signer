"use client"

import { FileText, Calendar, User, Maximize, Minimize, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DocumentMetadata } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DocumentHeaderProps {
  file: File | null
  documentMetadata: DocumentMetadata | null
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export default function DocumentHeader({
  file,
  documentMetadata,
  isFullscreen,
  onToggleFullscreen,
}: DocumentHeaderProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Document Signer & Annotation Tool</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold truncate">{file.name}</h1>
        </div>

        {documentMetadata && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
            {documentMetadata.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{documentMetadata.author}</span>
              </div>
            )}
            {documentMetadata.creationDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(documentMetadata.creationDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Share Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Share with collaborators
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Get shareable link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
          {isFullscreen ? (
            <>
              <Minimize className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4 mr-2" />
              Fullscreen
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

