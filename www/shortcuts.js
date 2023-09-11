const Shortcuts = {
  createDynamicShortcut: function (params, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShortcutsPlugin", "createDynamicShortcut", [params]);
  },

  removeAllDynamicShortcuts: function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShortcutsPlugin", "removeAllDynamicShortcuts", []);
  },

  isAvailable: (onSuccess) => {
    cordova.exec(onSuccess, null, "ShortcutsPlugin", "isAvailable", []);
  },

  watchForceTouches: (onSuccess) => {
    cordova.exec(onSuccess, null, "ShortcutsPlugin", "watchForceTouches", []);
  },

  enableLinkPreview: (onSuccess) => {
    cordova.exec(onSuccess, null, "ShortcutsPlugin", "enableLinkPreview", []);
  },

  disableLinkPreview: (onSuccess) => {
    cordova.exec(onSuccess, null, "ShortcutsPlugin", "disableLinkPreview", []);
  },

  onHomeIconPressed: () => {},

  initHomeIconPressed: (onHomeIconPressed, errorCallback) => {
    if (cordova.platformId === "android") {
      cordova.exec(onHomeIconPressed, errorCallback, "ShortcutsPlugin", "getSelectedShortcut", []);
    } else if (cordova.platformId === "ios") {
      Shortcuts.onHomeIconPressed = onHomeIconPressed;
      cordova.exec(null, errorCallback, "ShortcutsPlugin", "deviceIsReady", []);
    }
  },
};

module.exports = Shortcuts;
