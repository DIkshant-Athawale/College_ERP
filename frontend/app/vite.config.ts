import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: true,
    proxy: {
      // Proxy specific login API sub-paths unconditionally
      '/login/refresh': 'http://localhost:3000',
      '/login/logout': 'http://localhost:3000',
      '/login/me': 'http://localhost:3000',
      // Proxy POST to /login (auth) but not GET (frontend page)
      '/login': {
        target: 'http://localhost:3000',
        bypass(req) {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url; // skip proxy, let Vite serve the frontend page
          }
        },
      },
      '/student': {
        target: 'http://localhost:3000',
        bypass(req) {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url; // skip proxy, let Vite serve the frontend page
          }
        },
      },
      '/admin': {
        target: 'http://localhost:3000',
        bypass(req) {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url; // skip proxy, let Vite serve the frontend page
          }
        },
      },
      '/teacher': {
        target: 'http://localhost:3000',
        bypass(req) {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url; // skip proxy, let Vite serve the frontend page
          }
        },
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
