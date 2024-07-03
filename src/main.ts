import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import { createPinia } from "pinia";
import './demos/ipc'
import router from "./router";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

createApp(App).use(router).use(createPinia())
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
