import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// All /api calls from the browser go to Vite, which forwards them to FastAPI.
// Same origin in the browser means no CORS problems and no localhost vs 127.0.0.1 issues.
const API_TARGET = 'http://127.0.0.1:8000';

const proxy = {
  '/api': { target: API_TARGET, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
});
