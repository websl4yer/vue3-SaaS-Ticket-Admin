import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // 引入刚才写的路由
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia()) // 使用 Pinia
app.use(router)      // 使用路由
app.use(ElementPlus)   // 使用 ElementPlus

app.mount('#app')