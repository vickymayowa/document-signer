import type { DocumentMetadata } from "@/lib/types"
import { pdfjs } from "react-pdf"

// Initialize PDF.js worker if not already initialized
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

// Define interface for PDF metadata info
interface PDFMetadataInfo {
  Title?: string
  Author?: string
  CreationDate?: string
  Keywords?: string
  Subject?: string
  [key: string]: any
}

/**
 * Extract metadata from a PDF file
 */
export async function extractPdfMetadata(file: File): Promise<DocumentMetadata> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer)
        const loadingTask = pdfjs.getDocument(typedArray)
        const pdf = await loadingTask.promise

        const metadata = await pdf.getMetadata()
        const pageCount = pdf.numPages

        // Cast the info object to our interface
        const info = (metadata.info as PDFMetadataInfo) || {}

        resolve({
          title: info.Title || file.name,
          author: info.Author || undefined,
          creationDate: info.CreationDate ? parseCreationDate(info.CreationDate) : undefined,
          pageCount,
          keywords: info.Keywords ? info.Keywords.split(",").map((k) => k.trim()) : undefined,
          subject: info.Subject || undefined,
        })
      } catch (error) {
        console.error("Error extracting PDF metadata:", error)
        // Return basic metadata even if extraction fails
        resolve({
          title: file.name,
          pageCount: 0,
        })
      }
    }

    fileReader.onerror = () => {
      reject(new Error("Failed to read PDF file"))
    }

    fileReader.readAsArrayBuffer(file)
  })
}

/**
 * Parse PDF creation date from PDF.js format
 */
function parseCreationDate(creationDate: string): string {
  // PDF.js returns dates in format: "D:20230815120000Z"
  if (creationDate.startsWith("D:")) {
    const dateString = creationDate.substring(2)
    try {
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)

      return `${year}-${month}-${day}`
    } catch (e) {
      return new Date().toISOString()
    }
  }
  return new Date().toISOString()
}

/**
 * This function handles exporting the PDF with annotations
 * In a real implementation, this would use pdf-lib or a similar library
 */
export async function exportAnnotatedPdf(file: File, annotations: any[]): Promise<Blob> {
  // This is a placeholder for the actual implementation
  // In a real app, you would use pdf-lib to modify the PDF

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // For now, just return the original file
  return new Blob([await file.arrayBuffer()], { type: "application/pdf" })
}

