export type AnnotationType =
  | "highlight"
  | "underline"
  | "comment"
  | "signature";

export interface Annotation {
  id: number;
  type: AnnotationType;
  page: number;
  position: {
    x: number;
    y: number;
  };
  color?: string;
  data?: string;
  boundingRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: string;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  creationDate?: string;
  pageCount?: number;
  keywords?: string[];
  subject?: string;
}
