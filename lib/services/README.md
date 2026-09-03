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

`react-markdown` and `remark-gfm` are installed for the future shared Markdown
renderer. Keep raw HTML disabled, reject unsafe URLs, and enforce the media policy
in both preview and publication. No editor, MDX execution, or renderer is added yet.
