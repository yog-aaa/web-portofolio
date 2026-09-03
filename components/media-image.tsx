import Image from "next/image";
import type { MediaImageData } from "@/lib/domain/media";

/** Presentation only. The calling query owns publication/access filtering. */
export function MediaImage({ image, sizes, className, priority = false }: {
  image: MediaImageData; sizes: string; className?: string; priority?: boolean;
}) {
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height}
    sizes={sizes} className={className} priority={priority} unoptimized={image.access === "private"} />;
}
