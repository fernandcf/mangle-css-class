import { defineConfig } from "vite";
import replaceMangleCSSClass from "vite-plugin-replace-mangle-css-class";
import initMangleCSSClass from "postcss-mangle-css-class/init";

await initMangleCSSClass({ CSSinput: "./style.css" });

export default defineConfig({
  plugins: [
    replaceMangleCSSClass({
      extensions: [".html", ".js", ".ts", ".vue", ".tsx", ".jsx"],
      // exclude: "card",
    }),
  ],
});
