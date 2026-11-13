"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import { uploadPortfolioImage } from "@/lib/services/media/upload-portfolio";

type State = {error?: string; success?: string};

export async function uploadCmsMedia(_state: State, form: FormData): Promise<State> {
  try {
    await requireOwner("cms:write");
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Choose an image.");
    const alt = String(form.get("alt") ?? "").trim();
    await uploadPortfolioImage(file, alt);
    revalidatePath("/admin/media");
    return {success: `Added ${file.name} to the media library. It is now available in content forms.`};
  } catch (error) {
    return {error: error instanceof Error ? error.message : "Upload failed."};
  }
}
