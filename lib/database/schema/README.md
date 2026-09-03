# Schema boundary

Drizzle Kit discovers the explicit `index.ts` barrel in this directory. The initial
schema implements the PRD model and Better Auth's current core adapter tables.

Keep schema modules free of server-only runtime imports and environment reads so
Drizzle Kit can load them independently. Reviewed migrations live in root `drizzle/`.
Generation updates local artifacts only; applying one requires an explicitly verified
database target. Read [database infrastructure](../../../docs/database.md).
