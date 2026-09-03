export class MediaError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
    readonly mediaId?: string,
  ) { super(message); }
}
