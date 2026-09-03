import { getMediaService } from "@/lib/services/media/server";
import { mediaFailure } from "@/lib/services/media/http";
import { privateResponse } from "@/lib/auth/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const service = await getMediaService(request.headers);
    const image = await service.readPrivateImage((await context.params).id);
    return privateResponse(new Response(Uint8Array.from(image.bytes), {
      headers: { "Content-Type": image.mimeType, "Content-Length": String(image.bytes.byteLength),
        "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" },
    }));
  } catch (error) {
    return mediaFailure(error);
  }
}
