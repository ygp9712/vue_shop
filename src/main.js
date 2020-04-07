import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.styl'

import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  const token = window.sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
