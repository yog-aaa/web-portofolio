import { revalidatePath, revalidateTag } from "next/cache";
import { allPublicContentTags } from "@/lib/queries/content-cache";
import { getMediaService } from "@/lib/services/media/server";
import { mediaFailure, mediaResponse, parseMetadataRequest, requireSameOrigin } from "@/lib/services/media/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const service = await getMediaService(request.headers);
    const { id } = await context.params;
    const [asset, references] = await Promise.all([service.retrieveMetadata(id), service.references(id)]);
    return mediaResponse({ asset, references });
  } catch (error) {
    return mediaFailure(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const service = await getMediaService(request.headers);
    requireSameOrigin(request);
    const asset = await service.updateMetadata((await context.params).id, await parseMetadataRequest(request));
    for (const tag of allPublicContentTags) revalidateTag(tag, { expire: 0 });
    revalidatePath("/", "layout");
    revalidatePath("/admin/media");
    return mediaResponse({ asset, references: await service.references(asset.id) });
  } catch (error) {
    return mediaFailure(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const service = await getMediaService(request.headers);
    requireSameOrigin(request);
    const result = await service.delete((await context.params).id);
    revalidatePath("/admin/media");
    return mediaResponse(result, { status: result.status === "pending" ? 202 : 200 });
  } catch (error) {
    return mediaFailure(error);
  }
}
