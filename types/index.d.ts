declare namespace CordovaPluginShortcuts {
  interface LaunchParams {
    action: string;
  }
  /**
   * This plugin saves in memory the selected action shortcut. You can get the action string using the following javascript command:
   * @example
   * ```javascript
   * Shortcuts.getSelectedShortcut(function(response){
   *     if(response.action === 'ACTION_1') {
   *       //Do something
   *     } ...
   *     else if(response.action === 'ACTION_4') {
   *       //Do something
   *     }
   *     // ignore other cases
   * }, function(error) {
   *     console.log(error);
   * });
   * ```
   * It is possible that getSelectedShortcut returns a response with null action. If this happens you should ignore it.
   * As a recomendation, you should call getSelectedShortcut when "resume" event is called.
   * @param onSuccess success callback
   * @param onError fail callback
   */
  function getSelectedShortcut(
    onSuccess?: (eventData: LaunchParams | null) => void,
    onError?: (err: string) => void
  ): void;

  interface Shortcut {
    id: string;
    action: string;
    /** This is the shortcut shown when user long press over the icon when it is located in the home screen. */
    shortLabel: string;
    /** This is the shortcut shown when user long press over the icon when it is located in the app drawer. */
    longLabel: string;
    /** should be the base64 icon or the name of this without extension. */
    icon: string;
    /** Flag that indicates if the icon is base64 String or not. False by default. */
    iconIsBase64?: boolean;
  }
  /**
   * This plugin provides you the following method to create shortcuts dynamically (on runtime):
   * @example
   * ```javascript
   * Shortcuts.createDynamicShortcut(
   * {
   *   id: 'someID',
   *   action: 'someAction',
   *   shortLabel: 'ShortLabel', //String. This is the shortcut shown when user long press over the icon when it is located in the home screen.
   *   longLabel: 'LongLabel', //String. This is the shortcut shown when user long press over the icon when it is located in the app drawer.
   *   icon: 'BASE64_String_icon', //String, should be the base64 icon or the name of this without extension.
   *   iconIsBase64: 'true' // (Optional) Boolean. Flag that indicates if the icon is base64 String or not. False by default.
   * },function(response){
   *     console.log(response);
   * }, function(error) {
   *     console.log(error);
   * });
   * ```
   * @param
   * @param onSuccess success callback
   * @param onError fail callback
   */
  function createDynamicShortcut(data: Shortcut, onSuccess?: () => void, onError?: (err: string) => void): void;

  /**
   * Use the following method to remove all dynamic shortcuts. The static shortcuts will not be affected:
   * @example
   * ```javascript
   * Shortcuts.removeAllDynamicShortcuts(function(response){
   *     console.log(response);
   * }, function(error) {
   *     console.log(error);
   * });
   * ```
   * @param onSuccess success callback
   * @param onError fail callback
   */
  function removeAllDynamicShortcuts(onSuccess?: () => void, onError?: () => void): void;
}

interface Window {
  Shortcuts: typeof CordovaPluginShortcuts;
}
