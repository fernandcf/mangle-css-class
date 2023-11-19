import postcssRename from "postcss-rename";
import merge from "lodash.merge";
import { normalize, parse, resolve } from "path";
import {
  random,
  writeJSONFile,
  convertToArray,
  getSources,
  replaceInterpolatedStr,
  generateHash,
  readJSONFile,
  writeJSFile,
} from "./utils";
import { existsSync } from "fs";

const PLUGIN_NAME = "postcss-obfuscate-css-class";
let processedFiles = 0;

/**
 * Description
 * @param {Object} userOptions
 * @param {Boolean} userOptions.enable
 * @param {String} userOptions.cwd
 * @param {Object} userOptions.export
 * @param {Boolean} userOptions.export.rewrite
 * @param {String} userOptions.export.JSONFile
 * @param {String} userOptions.export.JSFile
 * @param {String[]} userOptions.CSSinput
 * @param {String[]} userOptions.CSSextensions
 * @param {String|Function} userOptions.classNameRename
 * @param {Object} userOptions.hash
 * @param {"random" | "none" | "salt"} userOptions.hash.type
 * @param {Number} userOptions.hash.minLength
 * @param {String} userOptions.hash.salt
 * @param {Object} userOptions.exclude
 * @param {String[]} userOptions.exclude.classNames
 * @param {String[]} userOptions.exclude.files
 * @param {Function} userOptions.getOutput
 * @returns
 */
function postcssObfuscateCSSclass(userOptions) {
  const options = {
    enable: true, // enable/disable
    cwd: process.cwd(), // the current working directory

    CSSinput: "./index.css", // main CSS containing all styles
    CSSextensions: [".css", ".sass", ".scss", ".less", ".styl"], // CSS extensions

    classNameRename: "[name]_[hash]", // pass an interpolated string to generate a new class name [name] [hash]
    hash: {
      type: "random", // 'random', 'salt', 'none' type hash
      minLength: 5, // minimum length
      salt: "", // required is of type 'salt'
    },

    exclude: {
      classNames: [], // classes to ignore
      files: [], // classes found in these files are ignored
    },

    export: {
      JSONFile: "./.mangle-css-class/classes.json", // JSON file for transformed classes
      JSFile: "./.mangle-css-class/classes.js", // JS file (as ESM) for transformed classes
      rewrite: false, // force rewrite of exported files
    },

    getOutput(renamed, excluded) {}, // A callback that's passed a map from original class names to their renamed equivalents
  };

  merge(options, userOptions);

  // console.log("post-css-plugin", options);

  const { enable, cwd, CSSinput, exclude, hash, getOutput, classNameRename } =
    options;
  const { rewrite, JSFile, JSONFile } = options.export;
  const CSSextensions = convertToArray(options.CSSextensions);

  if (!enable) return null;

  //
  if (!JSONFile && JSFile) {
    console.error(
      PLUGIN_NAME,
      `You must configure a json file ('JSONFile') when you specify a javascript file ('JSFile').`
    );
  }

  const root = cwd;
  const CSSinputs = convertToArray(CSSinput).map((path) =>
    normalize(resolve(root, path))
  );
  const pathJSONFile = typeof JSONFile === "string" && resolve(root, JSONFile);
  const pathJSFile = typeof JSFile === "string" && resolve(root, JSFile);
  const forceRewrite = rewrite && processedFiles < 1;
  const exceptClassNames = convertToArray(exclude.classNames);
  const exceptClassNamesInFile = convertToArray(exclude.files);
  const fileSources = getSources(root, exceptClassNamesInFile);
  const hashMinLength = hash.minLength || 1;
  const hashType = hash.type;
  const hashSalt = hash.salt;
  const callbackGetOutput = getOutput;

  if (pathJSONFile && (!existsSync(pathJSONFile) || forceRewrite)) {
    writeJSONFile(pathJSONFile, {});
  }
  if (pathJSFile && (!existsSync(pathJSFile) || forceRewrite)) {
    writeJSFile(pathJSFile, {});
  }

  let interpolate = classNameRename;
  let data = readJSONFile(pathJSONFile);
  let classNameRenames = Object.values(data || {});

  return {
    postcssPlugin: PLUGIN_NAME,
    prepare(param) {
      const from = normalize(param.opts?.from || "");
      if (CSSinputs.includes(from)) {
        processedFiles += 1;

        return postcssRename({
          strategy: (input) => {
            if (data[input]) {
              return data[input];
            }

            const exists = fileSources.some((v) => {
              const { source, file } = v;
              const ext = parse(file).ext;

              if (source.indexOf("." + input) > -1) return true;

              // it is not css
              if (!CSSextensions.includes(ext))
                return source.indexOf(input) > -1;

              return false;
            });
            const match = exceptClassNames.some((e) => {
              const rgx = new RegExp(e);
              return rgx.test(input);
            });
            if (exists || match) {
              return input;
            }

            let __ = "";
            if (hashType == "random") {
              __ = random(hashMinLength, classNameRenames);
              classNameRenames.push(__);
            } else if (hashType == "salt") {
              __ = generateHash(input, hashSalt, hashMinLength);
            }

            if (typeof classNameRename === "function") {
              interpolate = classNameRename(input);
            }

            return replaceInterpolatedStr(interpolate, input, __);
          },
          outputMapCallback: function (map) {
            const excluded = {};
            const filtered = Object.entries(map).reduce((pv, cv) => {
              const [key, value] = cv;
              if (key != value) {
                pv[key] = value;
              } else {
                excluded[key] = value;
              }
              return pv;
            }, {});

            if (typeof callbackGetOutput === "function") {
              callbackGetOutput(filtered, excluded);
            }

            const jsonData = readJSONFile(pathJSONFile);
            const updateData = Object.keys(filtered).some(
              (x) => !Object.keys(jsonData).includes(x)
            );
            if (updateData) {
              data = { ...jsonData, ...filtered };

              if (pathJSONFile) {
                writeJSONFile(pathJSONFile, data);
              }
              if (pathJSFile) {
                writeJSFile(pathJSFile, data);
              }
            }
          },
        }).prepare(param);
      }

      console.warn(
        PLUGIN_NAME,
        `The file '${from}' will be ignored because it was not declared in 'CSSinput'`
      );

      return {};
    },
  };
}

postcssObfuscateCSSclass.postcss = true;

export default postcssObfuscateCSSclass;
