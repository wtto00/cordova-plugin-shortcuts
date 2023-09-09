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

  /* --------------------------------- delete ShortcutHelperActivity.java Start --------------------------------- */
  const javaPath = path.resolve(
    projectRoot,
    `platforms/android/app/src/main/java/${packageName.replace(/\./g, "/")}/ShortcutHelperActivity.java`
  );
  if (fs.existsSync(javaPath)) fs.rmSync(javaPath);
  /* --------------------------------- delete ShortcutHelperActivity.java End --------------------------------- */

  /* --------------------------------- delete shortcuts.xml Start --------------------------------- */
  const xmlPath = path.resolve(projectRoot, "./platforms/android/app/src/main/res/xml/shortcuts.xml");
  if (fs.existsSync(xmlPath)) {
    fs.rmSync(xmlPath);
  }
  /* --------------------------------- delete shortcuts.xml End --------------------------------- */

  /* --------------------------------- delete icon files Start --------------------------------- */
  const iconPath = path.resolve(projectRoot, "./resources/shortcuts/icons");
  const files = fs.readdirSync(iconPath);
  files.forEach((file) => {
    const resPath = path.resolve(projectRoot, `./platforms/android/app/src/main/res/drawable/${file}`);
    if (fs.existsSync(resPath)) {
      fs.rmSync(resPath, { recursive: true });
    }
  });
  /* --------------------------------- delete icon files End --------------------------------- */

  /* --------------------------------- remove content in string.xml Start --------------------------------- */
  const stringPath = path.resolve(projectRoot, "./platforms/android/app/src/main/res/values/strings.xml");
  const xmlHelpers = context.requireCordovaModule("cordova-common").xmlHelpers;
  const originStringXml = xmlHelpers.parseElementtreeSync(stringPath);
  originStringXml._root._children = originStringXml._root._children.filter(
    (item) =>
      !item.attrib.name.startsWith("shortcutShortLabel_") &&
      !item.attrib.name.startsWith("shortcutLongLabel_") &&
      !item.attrib.name.startsWith("shortcutDisabledLabel_")
  );
  fs.writeFileSync(stringPath, originStringXml.write({ indent: 4 }), {
    encoding: "utf8",
  });
  /* --------------------------------- remove content in string.xml End --------------------------------- */
};
