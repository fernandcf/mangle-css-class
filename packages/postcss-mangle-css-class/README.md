<h1 align="center">Postcss Mangle Css Class</h1>

<h4 align="center"> 
It is a postcss plugin to obfuscate and minify CSS classes without any modern CSS modules and c ompatible with bootstrapcss, tailwindcss, bulma ... and any CSS framework 
</h4>

## Usage

The plugin will generate optimized class name. Configure minimally as follows:

#### postcss.config.js
```js
import postCSSMangleCSSClass from "postcss-mangle-css-class";

export default {
  plugins: [
    postCSSMangleCSSClass({
      CSSinput: "./style.css",
      export: {
        JSONFile: "./.mangle-css-class/classes.json",
        JSFile: "./.mangle-css-class/classes.js"
      },
      classNameRename: "[name]_[hash]",
      getOutput(renamed, excluded) {
        console.log("output", { renamed, excluded });
      },
    }),
  ],
};
``` 

## Options

```js
const options = {
    enable: true,
    cwd: process.cwd(), 
    CSSinput: "",
    classNameRename: "[name]_[hash]", 
    hash: {
      type: "random",
      minLength: 5,
      salt: "",
    },
    exclude: {
      classNames: [],
      files: [],
    },
    CSSextensions: [".css", ".sass", ".scss", ".less", ".styl"],
    export: {
      JSONFile: "./.mangle-css-class/classes.json", JSFile: "./.mangle-css-class/classes.js",
      rewrite: false,
    },
    getOutput(renamed, excluded) {}
  };
```

#### enable Boolean
Enable/disable plugin. Default: `true` 

#### cwd String
The current working directory. Default: `process.cwd()`

#### CSSinput String, String[]
Establishes which CSS files should be analyzed. e.g: `'./app.css'`

#### classNameRename String
Set an interpolated string to rename CSS classes. Placeholders compatible:

- `[name]` is the class name 
- `[hash]` is the hash generate. You can set the type to `hash.type` and the minimum length `hash.minLength` and optionally `hash.salt`

e.g.: `prefix_[name]_[hash]`

#### hash.type String
Sets the hash type. Possible values: `none`,`random`,`salt`. Default: `random`

- `none` no hash will be applied.
- `random` generates an unpredictable random hash.
- `salt` generates a predictable random hash. If you need it to be unique; for example, in each project, you can configure: `hash.salt` 

#### hash.minLength Int
Set the minimum hash length. Default: `5`

#### hash.salt String
If you need to generate unique hashes for each project, you can set `salt` different in each one. e.g: `myProject1`. It is only applicable if you have defined `hash.type`:`salt`

#### exclude.classNames String, Regex, String[], Regex[]
CSS classes that will not be replaced. e.g: `["card",/text-/g]`

#### exclude.files String, Glob, String[], Glob[]
CSS classes that are used or found in these files will be ignored. e.g: `["./css-ignore.css","./js/*.js"]`

#### CSSextensions String, String[]
Establishes which files should be parsed as style sheets. Usually used if you set `exclude.files`. Default: `[".css", ".sass", ".scss", ".less", ".styl"]`

#### export.JSONFile String, Boolean
The path of the file where the replaced classes will be saved. Default: `"./.mangle-css-class/classes.json"`. The file will have the following structure:
```json
{
  "card":"ahJ25g",
  "card-body":"Awk1JO"
}
```

#### export.JSFile String, Boolean
The path of the file where the replaced classes will be saved in format `ESM`. Default: `"./.mangle-css-class/classes.js"`. The file will have the following structure:
```js
const card = "ahJ25g";
const card_body = "Awk1JO";
export default {card,card_body}
```

#### export.rewrite Boolean
Sets whether to rewrite previously generated files.
Default: `false`.

#### getOutput(renamed, excluded) Function
A callback that passes the renamed and excluded CSS classes.

## Utilities/Methods

#### init
Required to start; It should commonly be called before any script.

```js
const options_ = {
  cwd: process.cwd(),
  CSSinput: "",
  postcss: null,
  context: {},
};
```
- `cwd` the current working directory. Default `process.cwd()`
- `CSSinput` CSS files that are allowed to be analyzed. e.g: `'./app.css'`
- `postcss` PostCSS config. Default: load `postcss.config.js` in the root project

e.g:
```js
import initMangleCSSClass from "postcss-mangle-css-class/init";

initMangleCSSClass({
  CSSinput: "./style.css"
});
```

## Examples

Each package has its own particularity, which is why we have prepared the following examples of how you could use this plugin. For more details:

### If you are using `vite` ...
You can use the plugin `vite-plugin-replace-mangle-css-class` [Documentation](https://github.com/fernandcf/mangle-css-class/tree/main/packages/vite-plugin-replace-mangle-css-class)

- [Vite HTML Alpinejs](https://github.com/fernandcf/mangle-css-class/tree/main/apps/vite-vanilla)
<!-- - [Vite Reactjs]()
- [Vite Vuejs]() -->

### Others ...
- [Nextjs](https://github.com/fernandcf/mangle-css-class/blob/main/apps/nextjs)
- [Nuxtjs](https://github.com/fernandcf/mangle-css-class/blob/main/apps/nuxtjs)
<!-- - [Laravel]() -->

## Recommendations

- Use a single main style sheet as input. e.g:

Before: 
```js
// postcss.config.js
import postCSSMangleCSSClass from "postcss-mangle-css-class";

export default {
  plugins: [
    postCSSMangleCSSClass({
      CSSinput: ["./page-1.css","./page-2.css","./page-3.css"]
    }),
  ],
};
```
After:
```js
// postcss.config.js
import postCSSMangleCSSClass from "postcss-mangle-css-class";

export default {
  plugins: [
    postCSSMangleCSSClass({
      CSSinput: "./all-pages.css"
    }),
  ],
};
```

## MIT License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.