import { createPinia } from "pinia";
import { createApp, h } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const pinia = createPinia();

createApp({
  render: () => h(App),
})
  .use(pinia)
  .use(router)
  .mount("#app");
