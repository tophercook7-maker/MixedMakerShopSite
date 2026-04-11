// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Match `ClientConfig.siteUrl` for the active `PUBLIC_SITE_CLIENT` at build time.
const site = process.env.PUBLIC_SITE_URL || "https://freshcutpropertycare.com";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
});
