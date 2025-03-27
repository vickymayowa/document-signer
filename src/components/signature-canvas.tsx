"use client"

import { useRef, useState } from "react"
import SignaturePad from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eraser, Check, X, Type } from "lucide-react"

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void
  onCancel: () => void
}

export default function SignatureCanvas({ onSave, onCancel }: SignatureCanvasProps) {
  const [open, setOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("draw")
  const [typedName, setTypedName] = useState("")
  const [fontFamily, setFontFamily] = useState("'Dancing Script', cursive")
  const signatureRef = useRef<SignaturePad>(null)

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  const handleSave = () => {
    if (activeTab === "draw") {
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const signatureData = signatureRef.current.toDataURL("image/png")
        onSave(signatureData)
        setOpen(false)
      } else {
        alert("Please draw your signature before saving")
      }
    } else if (activeTab === "type" && typedName.trim()) {
      // Create a canvas to render the typed signature
      const canvas = document.createElement("canvas")
      canvas.width = 600
      canvas.height = 200
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.font = `48px ${fontFamily}`
        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2)

        const signatureData = canvas.toDataURL("image/png")
        onSave(signatureData)
        setOpen(false)
      }
    } else {
      alert("Please type your name before saving")
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add your signature</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="draw" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-4">
            <div className="border rounded-md bg-white">
              <SignaturePad
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-[200px]",
                }}
                penColor="black"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Draw your signature using your mouse or touchpad</p>
          </TabsContent>

          <TabsContent value="type" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Type your name</Label>
              <Input
                id="name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font">Font Style</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={fontFamily === "'Dancing Script', cursive" ? "default" : "outline"}
                  className="font-['Dancing_Script']"
                  onClick={() => setFontFamily("'Dancing Script', cursive")}
                >
                  Signature
                </Button>
                <Button
                  type="button"
                  variant={fontFamily === "'Caveat', cursive" ? "default" : "outline"}
                  className="font-['Caveat']"
                  onClick={() => setFontFamily("'Caveat', cursive")}
                >
                  Handwritten
                </Button>
                <Button
                  type="button"
                  variant={fontFamily === "'Roboto', sans-serif" ? "default" : "outline"}
                  className="font-['Roboto']"
                  onClick={() => setFontFamily("'Roboto', sans-serif")}
                >
                  Standard
                </Button>
              </div>
            </div>

            <div className="border rounded-md bg-white p-4 h-[200px] flex items-center justify-center">
              {typedName ? (
                <div style={{ fontFamily }} className="text-4xl text-center">
                  {typedName}
                </div>
              ) : (
                <div className="text-muted-foreground text-center flex flex-col items-center gap-2">
                  <Type className="h-8 w-8" />
                  <span>Your signature will appear here</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          {activeTab === "draw" && (
            <Button variant="outline" onClick={handleClear}>
              <Eraser className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

