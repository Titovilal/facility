"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface DocImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function DocImage({ src, alt, width, height, className = "w-full" }: DocImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="group relative cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="my-6 overflow-hidden rounded-lg border border-gray-700">
          <Image src={src} alt={alt} width={width} height={height} className={className} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-10 w-10 text-white" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] overflow-hidden p-1 sm:h-[90vh] sm:max-w-[85vw] sm:p-2 md:max-w-[80vw] md:p-4">
          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src={src}
              alt={alt}
              width={width * 3}
              height={height * 3}
              className="rounded-lg"
              priority
            />
          </div>
          <p className="text-muted-foreground text-center text-sm">{alt}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
