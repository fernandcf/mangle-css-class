import postCSSMangleCSSClass from "postcss-mangle-css-class";

export default {
  plugins: [
    postCSSMangleCSSClass({
      CSSinput: "./style.css",
      export: {
        rewrite: process.argv?.includes("--rewrite"),
      },
      classNameRename: "[name]_[hash]",
      getOutput(renamed, excluded) {
        // console.log("output", { renamed, excluded });
      },
    }),
  ],
};
