# Schema boundary

Drizzle Kit will discover TypeScript schemas in this directory. No tables or schema
barrel are defined yet: logical models in the PRD still need a reviewed persistence
design, including Better Auth's supported schema and the stable owner binding.

Keep schema modules free of server-only runtime imports and environment reads so
Drizzle Kit can load them independently. Future reviewed migrations belong in root
`drizzle/`. Do not generate/apply migrations or push an empty schema during this
foundation phase. Read [database infrastructure](../../../docs/database.md).
