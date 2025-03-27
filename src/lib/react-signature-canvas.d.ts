declare module "react-signature-canvas" {
  import * as React from "react"

  export interface SignaturePadProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>
    clearOnResize?: boolean
    penColor?: string
    backgroundColor?: string
    dotSize?: number
    minWidth?: number
    maxWidth?: number
    throttle?: number
    velocityFilterWeight?: number
    onBegin?: () => void
    onEnd?: () => void
  }

  export default class SignaturePad extends React.Component<SignaturePadProps> {
    clear(): void
    isEmpty(): boolean
    toDataURL(type?: string, encoderOptions?: number): string
    fromDataURL(dataURL: string): void
    on(): void
    off(): void
  }
}

