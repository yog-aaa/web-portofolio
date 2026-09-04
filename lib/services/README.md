# Application services

Server-only queries/use cases orchestrate authorization requirements, validated
input, repositories, domain mapping, and revalidation. Public services return only
published, safe presentation data. Keep simple queries simple; add orchestration
when a use case needs it.

`media/cloudinary.ts` is a lazy server-only provider context. The provider-neutral
`MediaService` and `CloudinaryMediaService` now authorize and validate image uploads,
persist verified asset metadata, proxy private owner reads, inspect references, and
stage safe retryable deletions. The `CloudinaryGateway` alone imports/calls the SDK.
Context creation sends no provider request and grants no authorization. Do not
serialize its configuration, provider IDs, signed URLs, or SDK objects to UI code.
See `docs/media.md` for limits and lifecycle behavior.

The shared `react-markdown` + `remark-gfm` renderer keeps raw HTML disabled, rejects
unsafe URLs, and resolves only managed media in both preview and publication. The
owner editor stores Markdown text; executable MDX and arbitrary HTML remain disabled.
