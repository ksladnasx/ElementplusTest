import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css"; // 核心样式
import "element-plus/theme-chalk/dark/css-vars.css"; // 深色主题支持

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
