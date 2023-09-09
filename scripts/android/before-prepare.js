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

  /* --------------------------------- copy icon files Start --------------------------------- */
  const iconPath = path.resolve(projectRoot, "./resources/shortcuts/icons");
  if (fs.existsSync(iconPath)) {
    const resPath = path.resolve(projectRoot, "./platforms/android/app/src/main/res/drawable");

    const icons = fs.readdirSync(iconPath);
    const includedName = [];
    const validExts = ["xml", "png"];
    icons.forEach((file) => {
      const index = file.lastIndexOf(".");
      const name = file.substring(0, index);
      const ext = file.substring(index + 1);
      if (validExts.includes(ext) && !includedName.includes(name)) {
        if (ext === "xml" || (ext === "png" && !icons.includes(`${name}.xml`))) {
          // xml first
          fs.cpSync(path.resolve(iconPath, file), path.resolve(resPath, file));
        }
      }
    });
  }
  /* --------------------------------- copy icon files End --------------------------------- */

  const jsonConfigPath = path.resolve(projectRoot, "./resources/shortcuts/shortcuts.json");
  if (fs.existsSync(jsonConfigPath)) {
    const jsonConfig = require(jsonConfigPath);
    if (Array.isArray(jsonConfig.shortcuts) && jsonConfig.shortcuts.length > 0) {
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

      jsonConfig.shortcuts.forEach((item, index) => {
        /* --------------------------------- string.xml Start --------------------------------- */
        const shortcutShortLabel = `shortcutShortLabel_${index + 1}`;
        const sslIndex = strList.findIndex((sn) => sn.attrib.name === shortcutShortLabel);
        if (sslIndex > -1) {
          originStringXml._root._children[sslIndex].text = item.shortcutShortLabel;
        } else {
          str += `\t<string name="${shortcutShortLabel}">${item.shortcutShortLabel}</string>\n`;
        }
        const shortcutLongLabel = `shortcutLongLabel_${index + 1}`;
        const sllIndex = strList.findIndex((sn) => sn.attrib.name === shortcutLongLabel);
        if (sllIndex > -1) {
          originStringXml._root._children[sllIndex].text = item.shortcutLongLabel;
        } else {
          str += `\t<string name="${shortcutLongLabel}">${item.shortcutLongLabel}</string>\n`;
        }
        const shortcutDisabledLabel = `shortcutDisabledLabel_${index + 1}`;
        const sdlIndex = strList.findIndex((sn) => sn.attrib.name === shortcutDisabledLabel);
        if (sdlIndex > -1) {
          originStringXml._root._children[sdlIndex].text = item.shortcutDisabledLabel;
        } else {
          str += `\t<string name="${shortcutDisabledLabel}">${item.shortcutDisabledLabel}</string>\n`;
        }
        /* --------------------------------- string.xml End --------------------------------- */

        xml += `\t<shortcut
          android:shortcutId="${item.shortcutId}"
          android:enabled="true"
          android:icon="@drawable/${item.icon}"
          android:shortcutShortLabel="@string/shortcutShortLabel_${index + 1}"
          android:shortcutLongLabel="@string/shortcutLongLabel_${index + 1}"
          android:shortcutDisabledMessage="@string/shortcutDisabledLabel_${index + 1}">
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
    }
  }
};
