import "server-only";

import { requireOwner } from "../auth/require-owner";
import { getDatabase } from "../database/client";
import { AdminContentService } from "./admin-content";

export function getAdminContentService() {
  return new AdminContentService(getDatabase(), requireOwner);
}
