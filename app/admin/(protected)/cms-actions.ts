"use server";

import { revalidatePath } from "next/cache";
import { getServerFirestore } from "@/lib/firebase/admin";
import { requireOwner } from "@/lib/auth/require-owner";
import { isCmsCollection, type CmsCollection } from "@/lib/porto-v2/cms-firestore";
import { validateCmsPayload } from "@/lib/porto-v2/cms-schema";

type State = {error?: string; success?: string};
const editorial = new Set<CmsCollection>(["projects", "thoughts", "research"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function checkWriteTarget(mode: string, exists: boolean) {
  if (mode === "create" && exists) throw new Error("This entry already exists. Open it from the list before editing.");
  if (mode === "update" && !exists) throw new Error("This entry no longer exists. Return to the list and try again.");
}

function payloadFrom(form: FormData) {
  const raw = String(form.get("payload") ?? "");
  if (raw.length > 200_000) throw new Error("Document is too large.");
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Content must be a JSON object.");
  const content = parsed as Record<string, unknown>;
  if (Object.keys(content).some(key => ["__proto__", "constructor", "prototype"].includes(key))) throw new Error("Invalid field name.");
  return content;
}

export async function saveCmsDocument(_state: State, form: FormData): Promise<State> {
  try {
    await requireOwner("cms:write");
    const collection = String(form.get("collection") ?? "");
    const id = String(form.get("id") ?? "");
    const mode = String(form.get("mode") ?? "");
    const intent = String(form.get("intent") ?? "save");
    const revision = Number(form.get("revision") ?? 0);
    if (!isCmsCollection(collection) || collection === "mediaAssets") throw new Error("This collection cannot be edited here.");
    if (!slugPattern.test(id) || id.length > 100) throw new Error("Use a lowercase, hyphenated document ID.");
    if (collection === "site" && !["settings", "theme"].includes(id)) throw new Error("Invalid site document.");
    if (!Number.isSafeInteger(revision) || revision < 0) throw new Error("Invalid revision.");
    if (mode !== "create" && mode !== "update") throw new Error("Invalid editing mode.");
    if (!["save", "publish", "unpublish"].includes(intent)) throw new Error("Invalid action.");
    const payload = validateCmsPayload(collection, id, payloadFrom(form));
    const db = getServerFirestore();
    const ref = db.collection(collection).doc(id);
    if (editorial.has(collection)) {
      const slug = String(payload.slug ?? id);
      if (!slugPattern.test(slug) || String(payload.title ?? "").trim().length < 3) throw new Error("A title and valid slug are required.");
      if (slug !== id) throw new Error("The page address must match the record address. Create a new entry to use another address.");
      if (collection === "projects" && intent === "publish") {
        const visual = String(payload.visual ?? "");
        if (!visual) throw new Error("A project image is required before publishing.");
        const asset = await db.collection("mediaAssets").where("secureUrl", "==", visual).limit(1).get();
        if (asset.empty) throw new Error("The project image must be registered in Cloudinary media.");
      }
      await db.runTransaction(async tx => {
        const old = await tx.get(ref);
        checkWriteTarget(mode, old.exists);
        const kind = collection === "projects" ? "project" : collection === "thoughts" ? "thought" : "research";
        const reservation = db.collection("slugReservations").doc(`${kind}_${slug}`);
        const owner = await tx.get(reservation);
        if ((old.exists ? Number(old.data()?.revision ?? 0) : 0) !== revision) throw new Error("This document changed. Reload before saving.");
        if (owner.exists && owner.data()?.ownerId !== id) throw new Error("This slug is already used.");
        const now = new Date();
        const next = { ...(old.data() ?? {}), title: String(payload.title), slug,
          draft: payload, revision: revision + 1, updatedAt: now,
          status: intent === "publish" ? "published" : intent === "unpublish" ? "draft" : old.data()?.status ?? "draft",
          ...(intent === "publish" ? {published: payload, publishedAt: now} : {}),
          ...(!old.exists ? {createdAt: now} : {}) };
        tx.set(ref, next);
        if (!owner.exists) tx.create(reservation, {kind, slug, ownerId: id, createdAt: now});
      });
    } else {
      await db.runTransaction(async tx => {
        const old = await tx.get(ref);
        checkWriteTarget(mode, old.exists);
        if ((old.exists ? Number(old.data()?.revision ?? 0) : 0) !== revision) throw new Error("This document changed. Reload before saving.");
        const now = new Date();
        const publicRecord = ["experiences", "education", "credentials"].includes(collection);
        tx.set(ref, {...(old.data() ?? {}), ...payload,
          ...(publicRecord ? {status: payload.status ?? old.data()?.status ?? "published"} : {}),
          revision: revision + 1, updatedAt: now,
          ...(!old.exists ? {createdAt: now} : {})});
      });
    }
    for (const path of ["/", "/work", "/experience", "/about", "/credentials", "/thoughts", "/research", "/sitemap.xml"]) revalidatePath(path);
    revalidatePath(`/admin/${collection}`);
    return {success: "Saved. Reload to review the current version."};
  } catch (error) {
    return {error: error instanceof Error ? error.message : "Could not save the document."};
  }
}
