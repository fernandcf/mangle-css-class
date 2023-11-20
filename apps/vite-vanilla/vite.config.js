import { defineConfig } from "vite";
import replaceMangleCSSClass from "vite-plugin-replace-mangle-css-class";

export default defineConfig({
  plugins: [
    replaceMangleCSSClass({
      extensions: [".html", ".js", ".ts", ".vue", ".tsx", ".jsx"],
      // exclude: "card",
    }),
  ],
});
