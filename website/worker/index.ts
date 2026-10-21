import handler from "vinext/server/fetch-handler";
export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const response = await handler.fetch(request, env, ctx);
    if (!new URL(request.url).pathname.startsWith("/skrzynka")) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.set("Referrer-Policy", "no-referrer");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
