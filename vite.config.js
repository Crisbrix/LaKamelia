import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function backendPort() {
  try {
    const envPath = fileURLToPath(new URL('../backend/.env', import.meta.url));
    const match = fs.readFileSync(envPath, 'utf8').match(/^PORT=(\d+)/m);
    if (match) return match[1];
  } catch {
    // sin backend/.env
  }
  return process.env.VITE_API_PORT || '4000';
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort()}`,
        changeOrigin: true,
      },
    },
  },
});
