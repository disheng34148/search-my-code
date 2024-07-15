import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import("@vscode/webview-ui-toolkit/dist/toolkit").then((toolkit) => {
  // if(toolkit) {
  //   toolkit.default()
  // }
});

createApp(App).mount("#app");
