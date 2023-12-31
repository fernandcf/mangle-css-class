import fse from "fs-extra";
import { resolve } from "path";
import fg from "fast-glob";
import Hashids from "hashids";

export function random(length = 5, except = []) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let res = "";
  for (var i = 0; i < length; i++)
    res += charset.charAt(Math.floor(Math.random() * charset.length));

  if (except.includes(res) || !res) {
    return random(length, except);
  }
  return res;
}

export function readJSONFile(file = "") {
  if (fse.existsSync(file)) {
    const content = fse.readFileSync(file, "utf-8");
    return JSON.parse(content);
  }
  return {};
}

export function writeJSONFile(file = "", data = {}) {
  return fse.outputFileSync(file, JSON.stringify(data), { encoding: "utf-8" });
}

export function writeJSFile(file = "", data = {}) {
  let content = "";
  const classes = Object.entries(data)
    .map((v) => {
      const [key, value] = v;
      return `"${key}":"${value}"`;
    })
    .join(",");
  content += `export default {${classes}}`;
  return fse.outputFileSync(file, content, { encoding: "utf-8" });
}

export function isObject(obj) {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}

export function convertToArray(value) {
  const arr = Array.isArray(value) ? value : [value];
  return arr.filter((x) => x);
}

export function getSources(root, files) {
  if (files.length) {
    const entries = fg.sync(files, { dot: true });
    return entries.map((file) => ({
      file,
      source: fse.readFileSync(resolve(root, file), "utf-8"),
    }));
  }

  return [];
}

export function replaceInterpolatedStr(str, name, hash) {
  return str.replaceAll("[name]", name).replaceAll("[hash]", hash);
}

function calculate(str) {
  const res = [];
  for (var i = 0; i < str.length; i++) {
    res.push(str.charCodeAt(i));
  }
  return res;
}

export function generateHash(className, salt = "", minLenght = 1) {
  const hashids = new Hashids(String(salt || ""), minLenght || 1);

  const arr = calculate(className);
  const sum = arr.reduce((pv, cv) => pv + cv, 0);
  const rest = arr.toReversed().reduce((pv, cv) => pv - cv);
  const resultStr = String(sum) + String(rest);
  const resultCalculate = calculate(resultStr);
  const resultHash = hashids.encode(resultCalculate.join(""));

  // console.log("generateToeken: " + className, {
  //   sum,
  //   rest,
  //   result,
  //   resultStr,
  //   resultCalculate,
  //   resultHash,
  //   resultLenght: resultHash.length,
  //   cL: className.length,
  // });

  return resultHash;
}
