import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    /** 默认语言 */
    lang: { value: 'zh', label: '简体中文' },
    langs: [
      { value: 'zh', label: '简体中文' },
      { value: 'en', label: 'English' },
    ],
    /** 自动登录 */
    autoLogin: false,
    /** 后端接口 */
    serverAddress: 'http://192.168.28.238:3000/api',
    // serverAddress: 'https://api.sccmdb.cn/api',
    uploadAddress: 'http://192.168.28.238:3001/upload',
    errorImg:
      'https://r2.scbbs.top/2025/1119/de379f1fe269fa74c1e701d7eb2cc78360de7c79cc6d843611ce0f5e7a382003-eb46c1ae-7616-4fb0-bf40-35d55d5b4836.png',

    /** 平板适配 */
    padAdaptation: false,
    /** 网络请求中 */
    loading: false,
    /** 鼠标位置 */
    menu: {
      x: 0,
      y: 0,
    },
    isDev: false,
  }),

  actions: {
    /** 运行时加载配置 */
    async loadRuntimeConfig() {
      // 检查当前域名是否为本地域名或本地ip
      const isLocal =
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname === '::1' ||
        /^192\.168\.\d+\.\d+$/.test(location.hostname) ||
        /^10\.\d+\.\d+\.\d+$/.test(location.hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(location.hostname)

      if (!isLocal) {
        try {
          try {
            const res = await import('../../../config.json')
            // 将加载到的 config 合并进当前 state
            Object.assign(this.$state, res.default)
          } catch (e) {
            return
          }
        } catch (err) {
          console.warn('无法加载 config.json，使用默认配置', err)
        }
      } else {
        console.log('本地环境，使用默认配置')
        this.serverAddress = 'http://192.168.28.238:3000/api'
        this.uploadAddress = 'http://192.168.28.238:3001/upload'
        this.isDev = true
      }
    },
  },

  persist: true,
})
