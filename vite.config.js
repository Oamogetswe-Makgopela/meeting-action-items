import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import extractApiPlugin from './server/devMiddlewarePlugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to import.meta.env by default.
  // The extraction dev middleware runs in this Node process and needs
  // ANTHROPIC_API_KEY in process.env for the Anthropic SDK to pick up.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  }

  return {
    plugins: [react(), extractApiPlugin()],
  }
})
