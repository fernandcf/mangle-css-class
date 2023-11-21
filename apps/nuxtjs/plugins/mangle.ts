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
