import "server-only";

import { getDatabase } from "../database/client";
import { getAuth } from "./server";
import { authUnavailable, createAuthHttpHandler } from "./http";

export async function handleAuthRequest(request: Request) {
  try {
    return await createAuthHttpHandler(getAuth(), getDatabase())(request);
  } catch {
    return authUnavailable();
  }
}
