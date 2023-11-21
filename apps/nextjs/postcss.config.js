module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-mangle-css-class": {
      CSSinput: "./app/globals.css",
      export: {
        rewrite: process.env.INIT_MANGLE || false,
      },
      classNameRename:
        process.env.NODE_ENV == "development" ? "[hash]" : "[hash]",
    },
  },
};
