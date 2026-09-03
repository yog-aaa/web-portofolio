# Repository boundary

Server-only persistence queries and row-to-domain mappings belong here. Future
implementations import `getDatabase` from `@/lib/database/client` and start with
`import "server-only"`. Expose explicit public/owner methods, selected fields,
publication filters, and transactions as each use case requires.

Public queries must exclude drafts, archived content, and private fields before
returning domain/application data. Services own orchestration and cache refresh;
pages compose their results. Do not add direct SQL to pages or a generic CRUD
abstraction in advance of actual models. `owner.ts` currently supplies the persisted
owner-ID lookup for authentication; content repositories remain pending.
