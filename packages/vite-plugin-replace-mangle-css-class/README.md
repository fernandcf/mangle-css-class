<h1 align="center">Vite Plugin Replace Mangle Css Class</h1>

<h4 align="center"> 
 Vite plugin to replace minified and obfuscated CSS classes at runtime. In addition to pure html. It is compatible with the most popular javascript frameworks such as reactjs, vuejs and alpinejs.
 </h4>

## Usage

The plugin will generate optimized class name in HTML and JavaScript. configure as follows:

### vite.config.js
```js
import { defineConfig } from "vite";
import replaceMangleCSSClass from "vite-plugin-replace-mangle-css-class";

export default defineConfig({
  plugins: [
    replaceMangleCSSClass({
      extensions: [".html", ".js", ".ts", ".vue", ".tsx", ".jsx"],
    }),
  ],
});
```

This will replace class name matched regex in HTML and JavaScript files. 

## How it works

This plugin in html type files it looks for and obtains the html `class` attribute and in javascript (others) files it also replaces strings like this: `.{classname}`. For example:

In html
```html
<!-- replace correctly -->
  <!-- input -->
  <div :class="{card: true}" class="card">
    <div class="card-body"></div>
  </div>
  <!-- output -->
  <div :class="{pkJ414a: true}" class="pkJ414a">
    <div class="mki4Aak"></div>
  </div>
```

But... in javascript:
```js
// replace correctly
const el = document.querySelector(".card");
const el = document.querySelector(".pkJ414a");
// not replace correctly
const el = document.getElementsByClassName("card");
const el = document.getElementsByClassName("card");
```

## Options

```js
 const options = {
    cwd: process.cwd(), // the current working directory
    enabled: true, // enabled/disabled
    extensions: [".html", ".js"], // files to find and replace obfuscated classes
    JSONFile: "./.mangle-css-class/classes.json", // the json file of renamed CSS classes
    exclude: [], // lists of all CSS classes to exclude
    generateBundle(classNames) {}, // callback after completion of replacements
  }
```

#### cwd String
the current working directory

#### enabled boolean
Enable/Disable the plugin 

#### extensions String[]
Files accepted for find and replace renamed css classes.
e.g.: `[".html",".js"]`


#### JSONFile String
The JSON file containing all the renamed css classes. From this file you will get the CSS classes to find and replace. It must have the following structure:

```json
{
  "card":"pkJ414a",
  "card-body":"mki4Aak"
}
```

#### exclude String, Regex, String[], Regex[]
List of all CSS classes that should not be replaced. Accepts values ​​of type string or regex type.
e.g.: `["card", /card/gi]`

#### generateBundle(classNames) Function
A callback that is called after generating the bundle.


## Example

Source code

```css
// css
.card {
}
.card-body {
}
```

```html
<!-- html -->
<div class="card">
  <div class="card-body"></div>
</div>
```

Output code

```css
// css
.pkJ414a {
}
.mki4Aak {
}
```

```html
<!-- html -->
<div class="pkJ414a">
  <div class="mki4Aak"></div>
</div>
```

## Notes

Dynamically generated css classes will not be replaced

We recommend using this vite plugin with [postcss-mangle-css-class](https://github.com/fernandcf/mangle-css-class/tree/main/packages/postcss-mangle-css-class) 

## License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.

Made with ❤️

