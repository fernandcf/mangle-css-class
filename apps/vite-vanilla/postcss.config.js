import postCSSMangleCSSClass from "postcss-mangle-css-class";

export default (context) => ({
  plugins: [
    postCSSMangleCSSClass({
      CSSinput: "./style.css",
      export: {
        rewrite: context.rewrite || false,
      },
      classNameRename:
        context.env == "development" ? "[name]_[hash]" : "[hash]",
      getOutput(renamed, excluded) {
        // console.log("output", { renamed, excluded });
      },
    }),
  ],
});
