// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import icon from "astro-icon";

import node from "@astrojs/node";

export default defineConfig({
  integrations: [react(), icon()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
