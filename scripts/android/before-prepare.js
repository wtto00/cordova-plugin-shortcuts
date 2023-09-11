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

  /* --------------------------------- xmlHelper Start --------------------------------- */
  const xmlHelpers = context.requireCordovaModule("cordova-common").xmlHelpers;
  /* --------------------------------- xmlHelper End --------------------------------- */

  const jsonConfigPath = path.resolve(projectRoot, "./resources/shortcuts/shortcuts.json");
  let jsonConfig = { android: [] };
  if (!fs.existsSync(jsonConfigPath)) {
    console.warn("There is no config file: resources/shortcuts/shortcuts.json.");
  } else {
    jsonConfig = require(jsonConfigPath);
  }
  /* --------------------------------- shortcuts.xml & strings.xml Start --------------------------------- */
  // str append res/values/string.xml
  let str = "";
  const stringPath = path.resolve(projectRoot, "./platforms/android/app/src/main/res/values/strings.xml");
  let originStringXml = {};
  let strList = [];
  const strExist = fs.existsSync(stringPath);
  if (!strExist) {
    str += `<?xml version='1.0' encoding='utf-8'?>\n<resources>\n`;
  } else {
    originStringXml = xmlHelpers.parseElementtreeSync(stringPath);
    strList = originStringXml.findall("string") || [];
  }

  let xml = '<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">\n';

  (jsonConfig.android || []).forEach((item, index) => {
    /* --------------------------------- string.xml Start --------------------------------- */
    const shortLabel = `shortcutShortLabel_${index + 1}`;
    const sslIndex = strList.findIndex((sn) => sn.attrib.name === shortLabel);
    if (sslIndex > -1) {
      originStringXml._root._children[sslIndex].text = item.shortcutShortLabel || "";
    } else {
      str += `\t<string name="${shortLabel}">${item.shortcutShortLabel || ""}</string>\n`;
    }
    const longLabel = `shortcutLongLabel_${index + 1}`;
    const sllIndex = strList.findIndex((sn) => sn.attrib.name === longLabel);
    if (sllIndex > -1) {
      originStringXml._root._children[sllIndex].text = item.shortcutLongLabel || item.shortcutShortLabel || "";
    } else {
      str += `\t<string name="${longLabel}">${item.shortcutLongLabel || item.shortcutShortLabel || ""}</string>\n`;
    }
    const disabledLabel = `shortcutDisabledLabel_${index + 1}`;
    const sdlIndex = strList.findIndex((sn) => sn.attrib.name === disabledLabel);
    if (sdlIndex > -1) {
      originStringXml._root._children[sdlIndex].text = item.shortcutDisabledLabel || "";
    } else {
      str += `\t<string name="${disabledLabel}">${item.shortcutDisabledLabel || ""}</string>\n`;
    }
    /* --------------------------------- string.xml End --------------------------------- */

    xml += `\t<shortcut
          android:shortcutId="${item.shortcutId}"
          android:enabled="true"
          android:icon="@drawable/${item.icon}"
          android:shortcutShortLabel="@string/${shortLabel}"
          android:shortcutLongLabel="@string/${longLabel}"
          android:shortcutDisabledMessage="@string/${disabledLabel}">
          <intent
            android:action="${item.action}"
            android:targetPackage="${packageName}"
            android:targetClass="${packageName}.ShortcutHelperActivity" />
        </shortcut>\n`;
  });

  xml += "</shortcuts>\n";
  const xmlPath = path.resolve(projectRoot, "./platforms/android/app/src/main/res/xml/shortcuts.xml");
  fs.writeFileSync(xmlPath, xml, { encoding: "utf8" });

  if (!strExist) {
    str += "</resources>";
  } else {
    str = originStringXml.write().replace("</resources>", `${str}</resources>`);
  }
  fs.writeFileSync(stringPath, str);
  /* --------------------------------- shortcuts.xml & strings.xml End --------------------------------- */

  /* --------------------------------- copy icon files Start --------------------------------- */
  const iconDir = path.resolve(projectRoot, "./resources/shortcuts/icons");
  const resPath = path.resolve(projectRoot, "./platforms/android/app/src/main/res/drawable");
  if (fs.existsSync(iconDir)) {
    (jsonConfig.android || []).forEach((item) => {
      if (!item.icon) return;
      let iconPath = path.resolve(iconDir, `${item.icon}.xml`);
      if (fs.existsSync(iconPath)) {
        fs.cpSync(iconPath, path.resolve(resPath, `${item.icon}.xml`));
      } else {
        iconPath = path.resolve(iconDir, `${item.icon}.png`);
        if (fs.existsSync(iconPath)) {
          fs.cpSync(iconPath, path.resolve(resPath, `${item.icon}.png`));
        } else {
          console.warn(`There is no ${item.icon} icon in resources/shortcuts/icons.`);
        }
      }
    });
  }
  /* --------------------------------- copy icon files End --------------------------------- */
};
