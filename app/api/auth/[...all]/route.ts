import { handleAuthRequest } from "@/lib/auth/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = handleAuthRequest;
export const POST = handleAuthRequest;
