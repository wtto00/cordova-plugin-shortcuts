#!/usr/bin/env node

module.exports = function (context) {
  const path = require("path");
  const fs = require("fs");
  const { projectRoot, plugin } = context.opts;

  if (plugin.id !== "cordova-plugin-shortcuts") {
    return;
  }

  /* --------------------------------- get package name Start --------------------------------- */
  let ConfigParser = null;
  try {
    ConfigParser = context.requireCordovaModule("cordova-common").ConfigParser;
  } catch (e) {
    // fallback
    ConfigParser = context.requireCordovaModule("cordova-lib/src/configparser/ConfigParser");
  }
  const config = new ConfigParser(path.join(projectRoot, "config.xml"));
  const packageName = config.android_packageName() || config.packageName();
  /* --------------------------------- get package name End --------------------------------- */

  /* --------------------------------- ShortcutHelperActivity.java Start --------------------------------- */
  const originJavaPath = path.resolve(plugin.dir, "src/android/ShortcutHelperActivity.java");
  const javaStr = fs.readFileSync(originJavaPath, { encoding: "utf8" });
  const javaPath = path.resolve(
    projectRoot,
    `platforms/android/app/src/main/java/${packageName.replace(/\./g, "/")}/ShortcutHelperActivity.java`
  );
  fs.writeFileSync(javaPath, javaStr.replace("%CORDOVA_MAIN_PACKAGE%", packageName));
  /* --------------------------------- ShortcutHelperActivity.java End --------------------------------- */

  /* --------------------------------- ShortcutsPlugin.java Start --------------------------------- */
  const pluginJavaPath = path.resolve(
    projectRoot,
    "platforms/android/app/src/main/java/wang/tato/shortcuts/ShortcutsPlugin.java"
  );
  const pluginJavaStr = fs.readFileSync(pluginJavaPath, { encoding: "utf8" });
  fs.writeFileSync(pluginJavaPath, pluginJavaStr.replace("%CORDOVA_MAIN_PACKAGE%", packageName));
  /* --------------------------------- ShortcutsPlugin.java End --------------------------------- */
};
