const initMangleCSSClass = require("postcss-mangle-css-class/init");

(async function () {
  await initMangleCSSClass({ CSSinput: "./app/globals.css" });
})();

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
