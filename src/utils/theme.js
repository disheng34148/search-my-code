export default (theme) => {
  const root = document.querySelector(":root");

  if (theme === "dark") {
    root.style.setProperty("--color", "255,255,255");
    root.style.setProperty("--focusColor", "#262727");
  } else {
    root.style.setProperty("--color", "0,0,0");
    root.style.setProperty("--focusColor", "#f5f7fa");
  }
};
