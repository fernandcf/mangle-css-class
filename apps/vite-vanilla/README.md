<h1 align="center">Vite Vanilla</h1>

### Plugins used

- `postcss-mangle-css-class` [documentation](https://github.com/fernandcf/mangle-css-class/tree/main/packages/postcss-mangle-css-class)
- `vite-plugin-replace-mangle-css-class` [documentation](https://github.com/fernandcf/mangle-css-class/tree/main/packages/vite-plugin-replace-mangle-css-class)

### Commands

#### `npm run dev` : Start Vite dev server
#### `npm run build` : Build for production.

### Edited files...

```js
// vite.config.js 
import { defineConfig } from "vite";
import replaceMangleCSSClass from "vite-plugin-replace-mangle-css-class";
import initMangleCSSClass from "postcss-mangle-css-class/init";

// initialize and wait
await initMangleCSSClass({
  CSSinput: "./style.css",
  context: { rewrite: true },
});

export default defineConfig({
  plugins: [
    replaceMangleCSSClass({
      extensions: [".html", ".js", ".ts", ".vue", ".tsx", ".jsx"],
      // exclude: "card",
    }),
  ],
});
```

```js
// postcss.config.js 
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
```

## MIT License ##

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.
