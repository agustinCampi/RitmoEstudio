"use client"

import NextImage from "next/image"
import type { ImageProps as NextImageProps } from "next/image"
import { cn } from "@/lib/utils"

type ImageProps = NextImageProps & {
  "data-ai-hint"?: string
}

const Image = ({ className, ...props }: ImageProps) => {
  return (
    <NextImage
      className={cn(
        "bg-muted/50 object-cover text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Image }
