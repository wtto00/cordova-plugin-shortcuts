const Shortcuts = {
  createDynamicShortcut: function (params, onSuccess, onError) {
    cordova.exec(onSuccess, onError, "ShortcutsPlugin", "createDynamicShortcut", [params]);
  },

  removeAllDynamicShortcuts: function (onSuccess, onError) {
    cordova.exec(onSuccess, onError, "ShortcutsPlugin", "removeAllDynamicShortcuts", []);
  },

  getDynamicShortcuts: function (onSuccess, onError) {
    cordova.exec(onSuccess, onError, "ShortcutsPlugin", "getDynamicShortcuts", []);
  },

  setDynamicShortcuts: function (params, onSuccess, onError) {
    cordova.exec(onSuccess, onError, "ShortcutsPlugin", "setDynamicShortcuts", [params]);
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
