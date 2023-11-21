# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.


### Files created and/or edited...

```js
// nuxt.config.ts
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
```

```js
// plugins/mangle.ts
import classes from "../.mangle-css-class/classes";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      mangle: (classNames) => {
        return classNames
          .split(" ")
          .map((cls) => classes[cls] || cls)
          .join(" ");
      }
    }
  }
})
```

```html
// app.vue
<template>
  <div :class="$mangle('hello')">Hello Nuxt {{ version }}!</div>
</template>
```


## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
