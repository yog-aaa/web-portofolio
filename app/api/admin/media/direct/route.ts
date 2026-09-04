import { getMediaService } from "@/lib/services/media/server";
import { mediaFailure, mediaResponse, parseDirectUploadRequest, requireSameOrigin } from "@/lib/services/media/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const service = await getMediaService(request.headers);
    requireSameOrigin(request);
    return mediaResponse(await service.authorizeDirectUpload(await parseDirectUploadRequest(request)), { status: 201 });
  } catch (error) {
    return mediaFailure(error);
  }
}
