import type { DocumentMetadata } from "@/lib/types";
import { pdfjs } from "react-pdf";

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

interface PDFMetadataInfo {
  Title?: string;
  Author?: string;
  CreationDate?: string;
  Keywords?: string;
  Subject?: string;
  [key: string]: any;
}

/**
 * Extract metadata from a PDF file
 */
export async function extractPdfMetadata(
  file: File
): Promise<DocumentMetadata> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const loadingTask = pdfjs.getDocument(typedArray);
        const pdf = await loadingTask.promise;

        const metadata = await pdf.getMetadata();
        const pageCount = pdf.numPages;

        // Cast the info object to our interface
        const info = (metadata.info as PDFMetadataInfo) || {};

        resolve({
          title: info.Title || file.name,
          author: info.Author || undefined,
          creationDate: info.CreationDate
            ? parseCreationDate(info.CreationDate)
            : undefined,
          pageCount,
          keywords: info.Keywords
            ? info.Keywords.split(",").map((k) => k.trim())
            : undefined,
          subject: info.Subject || undefined,
        });
      } catch (error) {
        console.error("Error extracting PDF metadata:", error);
        resolve({
          title: file.name,
          pageCount: 0,
        });
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Failed to read PDF file"));
    };

    fileReader.readAsArrayBuffer(file);
  });
}

/**
 * Parse PDF creation date from PDF.js format
 */
function parseCreationDate(creationDate: string): string {
  // PDF.js returns dates in format: "D:20230815120000Z"
  if (creationDate.startsWith("D:")) {
    const dateString = creationDate.substring(2);
    try {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);

      return `${year}-${month}-${day}`;
    } catch (e) {
      return new Date().toISOString();
    }
  }
  return new Date().toISOString();
}

export async function exportAnnotatedPdf(
  file: File,
  annotations: any[]
): Promise<Blob> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return new Blob([await file.arrayBuffer()], { type: "application/pdf" });
}
