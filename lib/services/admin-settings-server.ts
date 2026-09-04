import "server-only";

import { requireOwner } from "../auth/require-owner";
import { getDatabase } from "../database/client";
import { AdminSettingsService } from "./admin-settings";

export function getAdminSettingsService() {
  return new AdminSettingsService(getDatabase(), requireOwner);
}
