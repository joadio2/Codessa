// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://joadio2.github.io/",
  base: "/Odessa",

  integrations: [react(), icon()],
});
