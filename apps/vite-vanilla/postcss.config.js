import postCSSMangleCSSClass from "postcss-mangle-css-class";

export default {
  plugins: [
    postCSSMangleCSSClass({
      CSSinput: "./style.css",
      export: {
        rewrite: process.env.INIT_MANGLE || false,
      },
      classNameRename:
        process.env.NODE_ENV == "development" ? "[name]_[hash]" : "[hash]",
      getOutput(renamed, excluded) {
        // console.log("output", { renamed, excluded });
      },
    }),
  ],
};
