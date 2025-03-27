"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Bold, Italic } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface CommentPopoverProps {
  position: { x: number; y: number }
  onSave: (text: string) => void
  onCancel: () => void
}

export default function CommentPopover({ position, onSave, onCancel }: CommentPopoverProps) {
  const [comment, setComment] = useState("")
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  const handleSave = () => {
    if (comment.trim()) {
      // Format the comment with markdown-like syntax if formatting is applied
      let formattedComment = comment
      if (isBold) formattedComment = `**${formattedComment}**`
      if (isItalic) formattedComment = `*${formattedComment}*`

      onSave(formattedComment)
    } else {
      onCancel()
    }
  }

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg border p-3 w-[300px] z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-1 mb-2">
        <ToggleGroup type="multiple" variant="outline" className="justify-start">
          <ToggleGroupItem value="bold" aria-label="Toggle bold" size="sm" pressed={isBold} onPressedChange={setIsBold}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-label="Toggle italic"
            size="sm"
            pressed={isItalic}
            onPressedChange={setIsItalic}
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Textarea
        placeholder="Add your comment here..."
        className="min-h-[100px] mb-3 resize-none"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        autoFocus
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  )
}

