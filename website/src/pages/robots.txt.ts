import { site } from "../data/site.mjs";
export const prerender = true;
export function GET() {
  return new Response("User-agent: *\n" + (site.publicationReady ? "Allow: /" : "Disallow: /") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
