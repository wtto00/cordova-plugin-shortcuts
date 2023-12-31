#!/usr/bin/env node
const path = require("path");
const fs = require("fs");

module.exports = function (context) {
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

  /* --------------------------------- add content in plist Start --------------------------------- */
  const jsonConfigPath = path.resolve(projectRoot, "./resources/shortcuts/shortcuts.json");
  if (!fs.existsSync(jsonConfigPath)) {
    console.log("No static shortcut configuration available.");
    return;
  }
  const jsonConfig = require(jsonConfigPath);
  if (!Array.isArray(jsonConfig.ios) || jsonConfig.ios.length == 0) {
    console.log("The configured shortcuts were not found in the resources/shortcuts/shortcuts.json file.");
    return;
  }

  const shortcuts = jsonConfig.ios.map((item) => {
    const shortcutItem = {
      UIApplicationShortcutItemTitle: item.shortcutShortLabel,
      UIApplicationShortcutItemSubtitle: item.shortcutLongLabel || "",
      UIApplicationShortcutItemType: item.action,
    };
    if (item.iconType) {
      shortcutItem.UIApplicationShortcutItemIconType = `UIApplicationShortcutIconType${item.iconType}`;
    } else {
      shortcutItem.UIApplicationShortcutItemIconFile = camel2pascal(item.icon);
    }
    return shortcutItem;
  });

  const plistPath = path.resolve(projectRoot, `platforms/ios/${appName}/${appName}-Info.plist`);
  if (!fs.existsSync(plistPath)) {
    console.error(`File ${appName}-Info.plist does't exist.`);
    return;
  }
  const plist = require("plist");
  const originPlist = plist.parse(fs.readFileSync(plistPath, { encoding: "utf8" }));
  originPlist.UIApplicationShortcutItems = shortcuts;

  const resPlist = plist.build(originPlist);
  fs.writeFileSync(plistPath, resPlist, { encoding: "utf8" });
  /* --------------------------------- add content in plist End --------------------------------- */

  /* --------------------------------- copy icon files Start --------------------------------- */
  const assetsPath = path.resolve(projectRoot, `platforms/ios/${appName}/Assets.xcassets`);
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath);
  }
  const rootContentsPath = path.resolve(assetsPath, "Contents.json");
  if (!fs.existsSync(rootContentsPath)) {
    const rootContents = { info: { author: "xcode", version: 1 } };
    fs.writeFileSync(rootContentsPath, JSON.stringify(rootContents), { encoding: "utf8" });
  }

  const iconDir = path.resolve(projectRoot, "./resources/shortcuts/icons");
  (jsonConfig.ios || []).forEach((item) => {
    if (!item.icon) return;
    copyIcon(item.icon, iconDir, assetsPath);
  });
  /* --------------------------------- copy icon files End --------------------------------- */
};

function camel2pascal(name) {
  return name.replace(/(?:^|[\s_-])(\w)/g, function (_, c) {
    return c.toUpperCase();
  });
}

function copyIcon(icon, originPath, assetsPath) {
  let file = `${icon}.svg`;
  if (!fs.existsSync(path.resolve(originPath, file))) file = `${icon}.png`;
  if (!fs.existsSync(path.resolve(originPath, file))) return;
  const iconContents = {
    images: [
      { filename: file, idiom: "universal", scale: "1x" },
      { idiom: "universal", scale: "2x" },
      { idiom: "universal", scale: "3x" },
    ],
    info: { author: "xcode", version: 1 },
  };
  const iconDir = path.resolve(assetsPath, `${camel2pascal(icon)}.imageset`);
  if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir);
  fs.writeFileSync(path.resolve(iconDir, "Contents.json"), JSON.stringify(iconContents), {
    encoding: "utf8",
  });
  fs.cpSync(path.resolve(originPath, file), path.resolve(iconDir, file));
}
