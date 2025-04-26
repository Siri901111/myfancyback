import { createApp } from "vue";
import App from "./App.vue";
import "@/assets/less/index.less";
import router from "@/router";
import "@/api/mock.js"
// element-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// api的全局挂载
import api from "@/api/mockData/api.js";
// element-plus icons
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// pinia
import { createPinia } from 'pinia'
const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.$api = api;
app.use(ElementPlus);
app.use(router).mount("#app");
app.use(pinia)

// icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
