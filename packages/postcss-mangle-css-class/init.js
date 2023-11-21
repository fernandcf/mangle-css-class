import postcss from "postcss";
import merge from "lodash.merge";
import { resolve } from "path";
import fs from "fs";
import postcssrc from "postcss-load-config";
import loadPlugins from "postcss-load-config/src/plugins";
import { convertToArray, isObject } from "./utils";

/**
 *
 * @param {Object} userOptions
 * @param {String} userOptions.cwd
 * @param {String[]} userOptions.CSSinput
 * @param {Object} userOptions.postcss
 * @param {Array} userOptions.postcss.plugins
 */
export default async function (userOptions) {
  const options = {
    cwd: process.cwd(),
    CSSinput: "",
    postcss: null,
  };
  merge(options, userOptions);

  process.env.INIT_MANGLE = true;

  const root = options.cwd;
  const CSSinputs = convertToArray(options.CSSinput);
  let postcssConfig = options.postcss;

  let loadPostcssConfig = true;
  if (typeof postcssConfig === "boolean") {
    if (!postcssConfig) {
      loadPostcssConfig = false;
    }
  } else if (typeof postcssConfig === "function") {
    loadPostcssConfig = false;
    postcssConfig = postcssConfig();
  } else if (isObject(postcssConfig) && Object.keys(postcssConfig).length) {
    loadPostcssConfig = false;
    postcssConfig = postcssConfig;
  }

  const postcss_ = { options: {}, plugins: [] };
  if (loadPostcssConfig) {
    const result = await postcssrc();
    postcss_.options = result.options;
    postcss_.plugins = result.plugins;
  } else {
    postcss_.plugins = loadPlugins(postcssConfig, root);
    delete postcssConfig.plugins;
    postcss_.options = postcssConfig;
  }

  for (const file of CSSinputs) {
    const pathAbsolute = resolve(root, file);
    const content = fs.readFileSync(pathAbsolute, "utf-8");
    const result = await postcss(postcss_.plugins).process(content, {
      ...postcss_.options,
      from: pathAbsolute,
      to: "",
    });
    const { css, map } = result;
    // console.log("init", { css, map });
  }
  process.env.INIT_MANGLE = false;
}
