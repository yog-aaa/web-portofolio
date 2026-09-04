import { getMediaService } from "@/lib/services/media/server";
import { mediaFailure, mediaResponse, parseUploadRequest, requireSameOrigin } from "@/lib/services/media/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const service = await getMediaService(request.headers);
    return mediaResponse({ assets: await service.list() });
  } catch (error) {
    return mediaFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const service = await getMediaService(request.headers);
    requireSameOrigin(request);
    const { file, fields } = await parseUploadRequest(request);
    return mediaResponse({ asset: await service.upload(file, fields) }, { status: 201 });
  } catch (error) {
    return mediaFailure(error);
  }
}
