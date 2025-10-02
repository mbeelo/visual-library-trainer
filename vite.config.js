import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Important for subdomain
  server: {
    port: 5174,
    strictPort: true,
    host: true
  }
})