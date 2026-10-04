import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages serves the site from /advent-calendar/
  base: process.env.GITHUB_ACTIONS ? '/advent-calendar/' : '/',
})
