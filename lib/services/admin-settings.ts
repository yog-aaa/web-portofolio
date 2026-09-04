import "server-only";

import type { OwnerPermission } from "../auth/authorization";
import type { Database } from "../database/connection";
import { AdminSettingsRepository } from "../repositories/admin-settings";
import type { SiteSettingsInput, ThemeSettingsInput } from "../validation/settings";

type Authorize = (permission: OwnerPermission) => Promise<unknown>;

export class AdminSettingsService {
  private readonly repository: AdminSettingsRepository;
  constructor(db: Database, private readonly authorize: Authorize) {
    this.repository = new AdminSettingsRepository(db);
  }
  async site() { await this.authorize("cms:read"); return this.repository.site(); }
  async theme() { await this.authorize("cms:read"); return this.repository.theme(); }
  async saveSite(input: SiteSettingsInput) { await this.authorize("cms:write"); return this.repository.saveSite(input); }
  async saveTheme(input: ThemeSettingsInput) { await this.authorize("cms:write"); return this.repository.saveTheme(input); }
}
