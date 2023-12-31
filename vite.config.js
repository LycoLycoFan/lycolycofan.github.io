import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  if (command === 'serve') {
    return {
      plugins: [vue()],
    }
  } else {
    // command === 'build'
    return {
      // build 独有配置
      base: "/",
      plugins: [vue()],
    }
  }
})