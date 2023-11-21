import initMangleCSSClass from "postcss-mangle-css-class/init";

const postcssConfig = () => ({
  plugins: {
    "postcss-mangle-css-class": {
      CSSinput: "./assets/css/main.css",
      export: {
        rewrite: process.env.INIT_MANGLE || false
      },
      classNameRename:
        process.env.NODE_ENV == "development" ? "[name]_[hash]" : "[hash]",
    },
  },
});

(async function () {
  await initMangleCSSClass({
    CSSinput: "./assets/css/main.css",
    postcss() {
      // If you need access to 'process.env.INIT_MANGLE' you must provide a function
      // e.g:
      return postcssConfig();
    },
  });
})();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  postcss: postcssConfig()
});
