import chokidar from "chokidar";
import { parse, resolve } from "path";
import { existsSync, readFileSync } from "fs";
import fsp from "fs/promises";

const PLUGIN_NAME = "vite-plugin-replace-obfuscate-css-class";

function sortAndFilter(sourceJSON = "", exclude = []) {
  const classNames = JSON.parse(sourceJSON || "{}");

  return Object.keys(classNames)
    .sort((a, b) => b.length - a.length)
    .reduce((obj, key) => {
      const hasExcluded = exclude.some((v) => {
        try {
          return v.test(key);
        } catch (error) {
          return key == v;
        }
      });

      if (!hasExcluded) {
        obj[key] = classNames[key];
      }

      return obj;
    }, {});
}

function replaceClassNames(source = "", classNames = {}, isHTML = false) {
  const obj = classNames;
  let contains = false;

  if (!isHTML) {
    Object.keys(classNames).forEach((key) => {
      const obfuscate = classNames[key];
      if (obfuscate) {
        source = source.replaceAll("." + key, () => {
          contains = true;
          return "." + obfuscate;
        });
      }
    });
  }

  /**
   * Catch class names
   */

  // 1. regular - html,reactjs
  const regexRegular = [
    / (?:class|className)\s*=\s*"([^"]+)"/gim,
    / (?:class|className)\s*=\s*'([^']+)'/gim,
  ];

  // 2. tenary operator - alpinejs
  const regexTernaryOperator = [
    /:(?:class)\s*=\s*"([^"]+)"/gim,
    /:(?:class)\s*=\s*'([^']+)'/gim,
  ];

  // 3. reactjs
  const regexReactjs = [/(?:className)\s*:\s*"([^"]+)"/gm];

  // 4. vuejs
  const regexVuejs = [/(?:class)\s*:\s*"([^"]+)"/gm];

  const regex = regexRegular.concat(regexReactjs, regexVuejs, regexVuejs);
  regex.forEach((rgx, i) => {
    source = source.replace(rgx, (match, capture) => {
      if (contains === false) {
        contains = true;
      }

      capture = capture?.trim();
      if (capture) {
        const classes = capture.split(" ");
        const replaced = classes
          .map((cls) => (cls ? obj[cls] || cls : ""))
          .join(" ");
        return match.replace(/(["'])(.*?)(["'])/g, `$1${replaced}$3`);
      }

      return match;
    });
  });

  regexTernaryOperator.forEach((rgx, i) => {
    const quotesMain = i == 0 ? '"' : "'";

    source = source.replace(rgx, (match, capture) => {
      if (contains === false) {
        contains = true;
      }

      capture = capture?.trim();
      if (capture) {
        // const insideContainsQuotes = ['"', "'", "`"].some(
        //   (v) => capture.indexOf(v) > -1
        // );
        const isObj = capture.startsWith("{") && capture.endsWith("}");

        if (isObj) {
          const clean = capture.slice(1, -1);
          const chunks = clean.split(",");

          const quotekey = ["'", "`"].find((q) => quotesMain != q);

          const str = chunks
            .map((chunk) => {
              let [key, value] = chunk.split(":");
              if (!key || !value) {
                return chunk;
              }

              key = key.trim();

              // the key contains quotes
              const toArr = Array.from(key);
              const quote = ['"', "'", "`"].find((q) => toArr[0] == q);
              const containsQuotes = quote && toArr[toArr.length - 1] == quote;
              if (containsQuotes) {
                const cleanKey = key.slice(1, -1);
                const obfuscate = obj[cleanKey];
                if (obfuscate) {
                  return quote + obfuscate + quote + ":" + value;
                } else {
                  return chunk;
                }
              }

              // the key does not contain quotes
              const obfuscate = obj[key];
              if (obfuscate) {
                return quotekey + obfuscate + quotekey + ":" + value;
              }
              return chunk;
            })
            .join(",");

          return match.replace(capture, "{" + str + "}");
        }
      }

      return match;
    });
  });

  return { contains, source };
}

function toString(value, required = false, key) {
  if (typeof value === "string") {
    if (required && value.length < 1) {
      throw new Error(`${PLUGIN_NAME}: the ${key} cannot be empty.`);
    }

    return value;
  }

  throw new Error(
    `${PLUGIN_NAME}: the ${key} must have a value of type string.`
  );
}

function toArray(value, required = false, key) {
  let arr = Array.isArray(value) ? value : [value];
  arr = arr.filter((x) => x);

  if (required && arr.length < 1) {
    throw new Error(`${PLUGIN_NAME}: the ${key} cannot be empty.`);
  }

  return arr;
}

/**
 *
 * @param {Object} options
 * @param {String} options.cwd
 * @param {Boolean} options.enabled
 * @param {String[]} options.extensions
 * @param {String} options.JSONFile
 * @param {String[]} options.exclude
 * @param {Function} options.generateBundle
 * @returns
 */
export default function (options) {
  const optionsDefault = {
    cwd: process.cwd(), // the current working directory
    enabled: true, // enabled/disabled
    extensions: [".html", ".js"], // files to find and replace obfuscated classes
    JSONFile: "./.mangle-css-class/classes.json", // the json file of renamed CSS classes
    exclude: [], // lists of all CSS classes to exclude
    generateBundle(classNames) {}, // callback after completion of replacements
  };
  options = Object.assign(optionsDefault, options);

  const enabled = options.enabled;
  const callbackFinish = options.generateBundle;
  const extensions = toArray(options.extensions);
  const root = toString(options.cwd, true, "root");
  const excluded = toArray(options.exclude);
  let pathJSON = toString(options.JSONFile, true, "JSONFile");

  if (!enabled) return false;

  if (typeof callbackFinish !== "function") {
    console.error(PLUGIN_NAME, `must provide a function in 'generateBundle'`);
  }

  pathJSON = resolve(root, pathJSON);
  const extJSON = parse(pathJSON || "").ext;
  if (!existsSync(pathJSON) || extJSON != ".json") {
    console.error(
      PLUGIN_NAME,
      `the file provided in 'pathJSON' is not of type json or does not exist`
    );
  }

  const paths = [];
  let pathHTML = null;
  let sourceJSON = readFileSync(pathJSON, "utf-8")?.trim();
  let classNames = sortAndFilter(sourceJSON, excluded);
  let timerID = null;
  return {
    name: PLUGIN_NAME,
    async buildStart() {
      chokidar.watch(pathJSON).on("change", async () => {
        // console.log("json changes");

        if (timerID) {
          clearTimeout(timerID);
        }

        timerID = setTimeout(async () => {
          const source = await fsp.readFile(pathJSON, "utf-8");
          const hasChanged = sourceJSON != source;

          if (paths.length && hasChanged && source) {
            sourceJSON = source;
            classNames = sortAndFilter(sourceJSON, excluded);

            const paths_ = paths.concat(pathHTML).filter((x) => x);
            for (const path of paths_) {
              if (
                path.indexOf(".vite") === -1 &&
                path.indexOf("node_modules") === -1
              ) {
                try {
                  const content = await fsp.readFile(path, "utf-8");
                  await fsp.writeFile(path, content, { encoding: "utf-8" });

                  // const { base, ext } = parse(path);
                  // console.log("write id", base, { hasChanged });
                } catch (error) {
                  console.error(error);
                }
              }
            }
          }
        }, 500);
      });
    },
    async generateBundle() {
      callbackFinish(classNames);
    },
    transformIndexHtml(html, ctx) {
      const id = ctx.filename;
      const { base, ext } = parse(id);

      if (extensions.includes(ext)) {
        const { contains, source } = replaceClassNames(html, classNames, true);
        pathHTML = contains ? id : null;
        return source;
      }
    },
    transform(code, id) {
      const { base, ext } = parse(id);

      if (extensions.includes(ext)) {
        let { contains, source } = replaceClassNames(code, classNames);
        const index = paths.indexOf(id);

        if (index > -1) {
          paths.splice(index, 1);
        }

        if (contains) {
          paths.push(id);
        }

        // console.log("transform", { base, classNames, contains, source });

        return source;
      }
    },
  };
}
