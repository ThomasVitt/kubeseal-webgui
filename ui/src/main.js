import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
installElementPlus(app)
app.mount('#app')