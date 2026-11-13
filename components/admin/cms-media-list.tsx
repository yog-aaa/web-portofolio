"use client";

import Image from "next/image";
import { useState } from "react";

export function CmsMediaList({items}: {items: {id: string; name: string; url: string; alt: string; format: string}[]}) {
  const [copied, setCopied] = useState("");
  return <div className="cms-firestore-media-list">
    {items.length === 0 && <p className="cms-record-empty">No images yet. Upload one to make it available in content forms.</p>}
    {items.map(item => <article className="cms-media-list-item" key={item.id}>
      <Image src={item.url} alt={item.alt} width={74} height={64} unoptimized={item.format === "svg"} />
      <div><strong>{item.name}</strong><span>{item.alt}</span><button type="button" onClick={async () => {await navigator.clipboard.writeText(item.url); setCopied(item.id);}}>{copied === item.id ? "Copied link" : "Copy image link"}</button></div>
    </article>)}
  </div>;
}
