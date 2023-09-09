module.exports = {
  getSelectedShortcut: function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShortcutsPlugin", "getSelectedShortcut", []);
  },

  createDynamicShortcut: function (params, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShortcutsPlugin", "createDynamicShortcut", [params]);
  },

  removeAllDynamicShortcuts: function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShortcutsPlugin", "removeAllDynamicShortcuts", []);
  },
};
