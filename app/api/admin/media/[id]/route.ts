import { getMediaService } from "@/lib/services/media/server";
import { mediaFailure, mediaResponse, requireSameOrigin } from "@/lib/services/media/http";

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

export async function DELETE(request: Request, context: Context) {
  try {
    const service = await getMediaService(request.headers);
    requireSameOrigin(request);
    const result = await service.delete((await context.params).id);
    return mediaResponse(result, { status: result.status === "pending" ? 202 : 200 });
  } catch (error) {
    return mediaFailure(error);
  }
}
