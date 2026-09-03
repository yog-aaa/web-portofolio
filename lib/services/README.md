# Application services

Server-only queries/use cases orchestrate authorization requirements, validated
input, repositories, domain mapping, and revalidation. Public services return only
published, safe presentation data. Keep simple queries simple; add orchestration
when a use case needs it.

`media/cloudinary.ts` is a lazy server-only provider context. It reads validated
`CLOUDINARY_URL` and `CLOUDINARY_FOLDER_ROOT`, configures HTTPS delivery, and exposes
the SDK only to future internal media services. Context creation sends no provider
request and grants no authorization. Do not serialize the context or call it from UI.

Uploads, signatures, callback verification, MediaAsset persistence, protected
delivery, and deletion remain unimplemented. Those operations require owner checks
and server-controlled constraints before calling the adapter.

`react-markdown` and `remark-gfm` are installed for the future shared Markdown
renderer. Keep raw HTML disabled, reject unsafe URLs, and enforce the media policy
in both preview and publication. No editor, MDX execution, or renderer is added yet.
