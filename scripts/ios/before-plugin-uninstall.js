#!/usr/bin/env node

module.exports = function (context) {
  const path = require("path");
  const fs = require("fs");
  const { projectRoot, plugin } = context.opts;

  if (plugin.id !== "cordova-plugin-shortcuts") {
    return;
  }

  /* --------------------------------- get app name Start --------------------------------- */
  let ConfigParser = null;
  try {
    ConfigParser = context.requireCordovaModule("cordova-common").ConfigParser;
  } catch (e) {
    // fallback
    ConfigParser = context.requireCordovaModule("cordova-lib/src/configparser/ConfigParser");
  }
  const config = new ConfigParser(path.join(projectRoot, "config.xml"));
  const appName = config.name();
  /* --------------------------------- get app name End --------------------------------- */

  /* --------------------------------- remove content in plist Start --------------------------------- */
  const plistPath = path.resolve(projectRoot, `platforms/ios/${appName}/${appName}-Info.plist`);
  if (!fs.existsSync(plistPath)) {
    console.error(`File ${appName}-Info.plist does't exist.`);
    return;
  }
  const plist = require("plist");
  const originPlist = plist.parse(fs.readFileSync(plistPath, { encoding: "utf8" }));
  delete originPlist.UIApplicationShortcutItems;
  const resPlist = plist.build(originPlist);
  fs.writeFileSync(plistPath, resPlist, { encoding: "utf8" });
  /* --------------------------------- remove content in plist End --------------------------------- */

  /* --------------------------------- remove icon files Start --------------------------------- */
  const assetsPath = path.resolve(projectRoot, `platforms/ios/${appName}/Assets.xcassets`);
  if (!fs.existsSync(assetsPath)) return;

  const iconPath = path.resolve(projectRoot, "./resources/shortcuts/icons");
  if (fs.existsSync(iconPath)) {
    const icons = fs.readdirSync(iconPath);
    const includedName = [];
    const validExts = ["svg", "png"];

    icons.forEach((file) => {
      const index = file.lastIndexOf(".");
      const name = file.substring(0, index);
      const ext = file.substring(index + 1);

      if (validExts.includes(ext) && !includedName.includes(name)) {
        if (ext === "svg" || (ext === "png" && !icons.includes(`${name}.svg`))) {
          // svg first
          const iconDir = path.resolve(assetsPath, `${camel2pascal(name)}.imageset`);
          if (fs.existsSync(iconDir)) {
            fs.rmSync(iconDir, { recursive: true });
          }
        }
      }
    });
  }
  /* --------------------------------- remove icon files End --------------------------------- */
};

function camel2pascal(name) {
  return name.replace(/(?:^|[\s_-])(\w)/g, function (_, c) {
    return c.toUpperCase();
  });
}
