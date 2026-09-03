import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MediaImage } from "../components/media-image";

test("private media rendering stays on the authenticated proxy and bypasses optimization", () => {
  const html = renderToStaticMarkup(<MediaImage sizes="100vw" image={{
    id: "00000000-0000-4000-8000-000000000000", access: "private",
    src: "/api/admin/media/00000000-0000-4000-8000-000000000000/content",
    width: 640, height: 480, alt: "Private preview",
  }} />);
  assert.match(html, /src="\/api\/admin\/media\/.+\/content"/);
  assert.doesNotMatch(html, /_next\/image/);
  assert.match(html, /alt="Private preview"/);
});
