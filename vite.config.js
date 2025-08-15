import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import dotenv from 'dotenv'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/project-1/' // 👈 repo name
  // define:{
  //   'process.env.VITE_KEY': JSON.stringify(process.env.VITE_KEY)
  // }
})
