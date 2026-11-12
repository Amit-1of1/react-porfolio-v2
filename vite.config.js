import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Sample review cards show on preview and local builds only, never on the live site.
  define: { __SAMPLE_REVIEWS__: JSON.stringify(process.env.VERCEL_ENV !== 'production') },
})
