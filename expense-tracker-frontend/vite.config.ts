import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/ExpenseTrackerApi/
const githubPagesBase = '/ExpenseTrackerApi/'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? githubPagesBase : '/',
})
