/// <reference types="vitest" />
/// <reference types="vite/client" />

import {defineConfig, loadEnv} from "vite";

import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import glsl from "vite-plugin-glsl";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
//@ts-ignore
export default defineConfig(() => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv("development", process.cwd(), "");
  return {
    // vite config

    plugins: [
      tsconfigPaths(),
      react(),
      glsl({
        include: [
          // Glob pattern, or array of glob patterns to import
          "**/*.glsl",
          "**/*.wgsl",
          "**/*.vert",
          "**/*.frag",
          "**/*.vs",
          "**/*.fs",
        ],
        exclude: undefined, // Glob pattern, or array of glob patterns to ignore
        warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
        defaultExtension: "glsl", // Shader suffix when no extension is specified
        compress: false, // Compress output shader code
        watch: true, // Recompile shader on change
        root: "/", // Directory for root imports
      }),
      svgr({
        svgrOptions: {
          exportType: "named",
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: "**/*.svg",
      }),
    ],
    worker: () => [react()],
    server: {
      port: env.PORT, // set port
    },
    esbuild: {
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@api": path.resolve(__dirname, "./src/api"),
        "@layout": path.resolve(__dirname, "./src/layout"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@/types": path.resolve(__dirname, "./src/types"),
        "@constants": path.resolve(__dirname, "./src/constants"),
        "@bim": path.resolve(__dirname, "./src/bim"),
      },
    },
    base: "./",
    build: {
      outDir: "./dist",
      chunkSizeWarningLimit: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("@thatopen/components")) {
              return "components.min";
            }
            if (id.includes("@thatopen/ui-obc")) {
              return "ui-obc.min";
            }
            if (id.includes("@thatopen/ui")) {
              return "ui.min";
            }
            if (id.includes("@thatopen/components-front")) {
              return "components-front.min";
            }
            if (id.includes("@thatopen/fragments")) {
              return "fragments.min";
            }
            if (id.includes("@tweenjs/tween.js")) {
              return "tweenjs.min";
            }
            if (id.includes("peerjs")) {
              return "peerjs.min";
            }
            if (id.includes("socket.io-client")) {
              return "socket.io-client.min";
            }
            if (id.includes("@radix-ui")) {
              return "radix-ui.min";
            }
            if (id.includes("clsx")) {
              return "clsx.min";
            }
            if (id.includes("class-variance-authority")) {
              return "class-variance-authority.min";
            }
            if (id.includes("three")) {
              return "three.min";
            }
            if (id.includes("web-ifc")) {
              return "web-ifc.min";
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      coverage: {
        reporter: ["text", "html"],
      },
      setupFiles: "./src/test/setup.ts",
      css: true,
      alias: {
        three: "./src/__mocks__/three.ts",
      },
    },
    optimizeDeps: {
      exclude: ["js-big-decimal"],
    },
  };
});
