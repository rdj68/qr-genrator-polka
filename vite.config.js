import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables; pass an empty string to load all variables, or 'VITE_' to filter only those prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Loaded API URL:', env.VITE_API_URL); // Check the console output
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL, // Should be your API URL from .env
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
