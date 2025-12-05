import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import svgLoader from 'vite-svg-loader'
import tailwindcss from '@tailwindcss/vite'
// import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __INTLIFY_PROD_DEVTOOLS__: false, // 禁用生产环境 devtools
    __VUE_I18N_FULL_INSTALL__: false, // 禁用完整安装
    __VUE_I18N_LEGACY_API__: false,
    __VUE_I18N_PROD_DEVTOOLS__: false,
  },
  plugins: [
    vue(),
    svgLoader(),
    tailwindcss(),
    // visualizer({ open: true }), // 构建后自动打开分析页面
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 小于1kb的文件不压缩
      deleteOriginFile: true, // 删除原文件
    }),
  ],
  base: '/xianyu-vue/', // 设置基础路径
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    open: true, // 自动打开浏览器
    port: 5173, // 设置端口号
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        dead_code: true, // 移除未使用的代码
        unused: true, // 删除未使用的变量/函数
        keep_fnames: true, // 保留函数名
        keep_classnames: true, // 保留类名
        drop_console: true, // 移除所有 console.log
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.info'], // 移除特定函数（如 console.info）
      },
      format: {
        comments: false, // 移除注释
      },
      mangle: {
        // 保留 Pinia 相关关键字
        reserved: [
          'defineStore',
          'storeToRefs',
          'use.*Store', // 匹配所有 Store
        ],
      },
    },
    chunkSizeWarningLimit: 2000, // 设置 chunk 大小警告限制
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. 语言文件单独分包
          if (id.includes('/lang/')) {
            return id.includes('zh.json') ? 'zh-lang' : 'en-lang'
          }

          // 2. Pinia Store 单独分包
          if (id.includes('/stores/')) {
            const match = id.match(/stores\/(.+?)\.ts/)
            return match ? `store-${match[1]}` : 'stores'
          }

          // 3. 第三方库分组
          if (id.includes('node_modules')) {
            if (id.includes('lucide-vue-next')) return 'vendor-lucide'
            return 'lucide-vue-next'
          }
        },
      },
    },
  },
})
