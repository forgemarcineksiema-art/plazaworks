import { defineConfig } from "astro/config";
import { normalizeBase, validatedSiteOrigin } from "./src/lib/site.mjs";

export default defineConfig({
  output: "static",
  site: validatedSiteOrigin(process.env.SITE_URL),
  base: normalizeBase(process.env.BASE_PATH || "/"),
  trailingSlash: "always",
  devToolbar: { enabled: false },
  server: { host: "0.0.0.0" },
  vite: { server: { allowedHosts: ["terminal.local"] } }
});
