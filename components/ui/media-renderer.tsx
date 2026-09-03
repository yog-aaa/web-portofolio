import type { MediaImageData } from "@/lib/domain/media";
import { MediaImage } from "@/components/media-image";

export function MediaRenderer({ image, caption, sizes, priority = false, className = "" }:
  { image: MediaImageData; caption?: string | null; sizes: string; priority?: boolean; className?: string }) {
  return <figure className={className}>
    <div className="overflow-hidden rounded-media bg-accent-very-soft">
      <MediaImage image={image} sizes={sizes} priority={priority} className="h-auto w-full object-cover" />
    </div>
    {caption ? <figcaption className="mt-3 max-w-reading text-caption text-foreground-secondary">{caption}</figcaption> : null}
  </figure>;
}
