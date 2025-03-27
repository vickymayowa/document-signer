"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Check, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DocumentMetadata } from "@/lib/types";
import { CardContent } from "@/components/ui/card";
import { extractPdfMetadata } from "@/lib/pdf-utils";

interface DocumentUploaderProps {
  onFileChange: (file: File | null, metadata?: DocumentMetadata) => void;
}

export default function DocumentUploader({
  onFileChange,
}: DocumentUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const fileRef = useRef<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }

      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
      setIsUploading(true);
      setError(null);
      fileRef.current = file;

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Extract metadata from PDF after the interval is complete
          extractPdfMetadata(file)
            .then((metadata) => {
              setMetadata(metadata);
            })
            .catch((err) => {
              console.error("Failed to extract metadata:", err);
            });
        }
      }, 50);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError("File is too large. Maximum size is 10MB.");
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Please upload a PDF file");
      } else {
        setError(rejection.errors[0].message);
      }
    },
  });

  const handleReset = () => {
    setFileName("");
    setFileSize("");
    setUploadProgress(0);
    setMetadata(null);
    setError(null);
    fileRef.current = null;
    onFileChange(null);
  };

  const handleContinue = () => {
    if (fileRef.current) {
      onFileChange(fileRef.current, metadata || undefined);
    }
  };

  return (
    <CardContent className="pt-6 pb-8">
      {!fileName ? (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive && isDragAccept
                ? "border-primary bg-primary/5 scale-[1.01]"
                : isDragActive && isDragReject
                ? "border-destructive bg-destructive/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
              <div
                className={`rounded-full p-4 ${
                  isDragActive && isDragAccept ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <Upload
                  className={`h-10 w-10 ${
                    isDragActive && isDragAccept
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">
                  Drag & drop your PDF here
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  or click to browse files
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="relative overflow-hidden group"
                >
                  <span className="relative z-10">Select PDF Document</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Maximum file size: 10MB
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-muted rounded-lg p-3">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium truncate">{fileName}</h3>
              <p className="text-sm text-muted-foreground">{fileSize}</p>
              {isUploading ? (
                <p className="text-sm text-amber-500 mt-1">
                  Processing document...
                </p>
              ) : (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ready to annotate
                </p>
              )}
            </div>
          </div>

          {isUploading ? (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : metadata ? (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium mb-2">Document Information</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {metadata.title && (
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    {metadata.title}
                  </div>
                )}
                {metadata.author && (
                  <div>
                    <span className="text-muted-foreground">Author:</span>{" "}
                    {metadata.author}
                  </div>
                )}
                {metadata.creationDate && (
                  <div>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    {new Date(metadata.creationDate).toLocaleDateString()}
                  </div>
                )}
                {metadata.pageCount && (
                  <div>
                    <span className="text-muted-foreground">Pages:</span>{" "}
                    {metadata.pageCount}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleContinue} disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="animate-pulse">Processing...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Continue to Annotation
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  );
}
