// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev server proxies frontend requests to the FastAPI backend during local development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/upload-api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload-api/, "/api"),
      },

      "/static": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});
