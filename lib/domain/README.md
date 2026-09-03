# Domain boundary

Place provider-neutral content types, value objects, and business rules here as
their use cases are implemented. Follow the logical models in
[the PRD](../../docs/portfolio-prd.md#10-domaincontent-model).

Domain modules do not read environment variables or import Next.js, Drizzle,
database clients, Better Auth, or Cloudinary. Define public read models separately
from owner editing models. MediaAsset uses an application ID; provider identifiers
stay in infrastructure/persistence. Better Auth owns authentication models;
there is no duplicate administrator domain/table.

No speculative model or generic base repository is introduced in this phase.

`content-values.ts` defines provider-neutral JSON values and private draft payloads
used by persistence. These are not public DTOs or a substitute for input validation.
