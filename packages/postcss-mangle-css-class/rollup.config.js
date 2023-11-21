// import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "./index.js",
    external: [
      "postcss-rename",
      "path",
      "fs",
      "fs-extra",
      "fast-glob",
      "hashids",
      "lodash.merge",
    ],
    output: [
      {
        file: "./dist/index.cjs",
        format: "cjs",
      },
      {
        file: "./dist/index.js",
        format: "es",
      },
    ],
  },
  {
    input: "./init.js",
    external: ["lodash.merge", "path", "fs", "postcss", "postcss-load-config"],
    output: [
      {
        file: "./dist/init.cjs",
        format: "cjs",
      },
      {
        file: "./dist/init.js",
        format: "es",
      },
    ],
  },
  // {
  //   input: "./in-browser.js",
  //   treeshake: "smallest",
  //   output: [
  //     {
  //       file: "./dist/in-browser.cjs",
  //       format: "cjs",
  //     },
  //     {
  //       file: "./dist/in-browser.js",
  //       format: "es",
  //     },
  //   ],
  //   plugins: [
  //     nodeResolve({ preferBuiltins: false }),
  //     commonjs({
  //       include: /node_modules/,
  //       requireReturnsDefault: "auto", // <---- this solves default issue
  //     }),
  //   ],
  // },
];
