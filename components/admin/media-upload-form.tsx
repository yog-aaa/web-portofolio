"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadCmsMedia } from "@/app/admin/(protected)/media-actions";

export function MediaUploadForm() {
  const [state, action, pending] = useActionState(uploadCmsMedia, {});
  const router = useRouter();
  useEffect(() => {if (state.success) router.refresh();}, [state.success, router]);
  return <form action={action} className="cms-firestore-form" encType="multipart/form-data">
    <label htmlFor="media-file">Choose image</label><input id="media-file" name="file" type="file" accept="image/png,image/jpeg,image/webp" required />
    <p>PNG, JPG, or WebP, up to 3 MB.</p>
    <label htmlFor="media-alt">Image description</label><input id="media-alt" name="alt" minLength={3} maxLength={200} placeholder="Describe what appears in the image" required />
    {state.error && <p role="alert" className="cms-firestore-error">{state.error}</p>}
    {state.success && <p role="status" className="cms-firestore-success">{state.success}</p>}
    <div className="cms-firestore-actions"><button type="submit" disabled={pending}>{pending ? "Uploading…" : "Add to library"}</button></div>
  </form>;
}
