import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path' // 引入 path 模块


export default defineConfig({
  plugins: [
    vue(),
    // --- 开始复制 ---
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // --- 结束复制 ---
  ],
  resolve: {
    alias: {
      // 设置 @ 符号指向 src 目录的绝对路径
      '@': path.resolve(__dirname, './src')
    }
  },
   css: {
    preprocessorOptions: {
      scss: {
        // 重点：这里修改为你新建的 var.scss
        // javascriptEnabled: true, // 如果报错建议加上这行
        additionalData: `@use "@/styles/var.scss" as *;`
      }
    }
  }
})