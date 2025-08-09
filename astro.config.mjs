// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import icon from "astro-icon";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  // site: "https://joadio2.github.io/",
  // base: "/Odessa",

  integrations: [react(), icon()],

  adapter: node({
    mode: "standalone",
  }),
});