import classes from "../.mangle-css-class/classes";

export default function (classNames = "") {
  return classNames
    .split(" ")
    .map((cls) => classes[cls] || cls)
    .join(" ");
}
