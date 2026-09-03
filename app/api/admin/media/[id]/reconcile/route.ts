import { getMediaService } from "@/lib/services/media/server";
import { mediaFailure, mediaResponse, requireSameOrigin } from "@/lib/services/media/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const service = await getMediaService(request.headers);
    requireSameOrigin(request);
    return mediaResponse({ asset: await service.reconcileUpload((await context.params).id) });
  } catch (error) {
    return mediaFailure(error);
  }
}
