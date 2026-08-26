import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import browserslistToEsbuild from "browserslist-to-esbuild";

const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

export default defineConfig({
  define: {
    __CARD_VERSION__: JSON.stringify(version),
  },
  build: {
    target: browserslistToEsbuild(),
    minify: "terser",
    sourcemap: false,
    // Le bundle doit rester un fichier unique : HACS ne descend pas dans les
    // sous-dossiers de dist/ et enregistre une seule resource.
    lib: {
      entry: "src/skeuo-cards.ts",
      formats: ["es"],
      fileName: () => "skeuo-cards.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  // Serveur de dev : déclarer http://<ip>:4000/skeuo-cards.js en resource
  // dashboard sur une instance HA de test.
  preview: {
    port: 4000,
    host: "0.0.0.0",
    cors: true,
  },
});
