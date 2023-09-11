declare namespace CordovaPluginShortcuts {
  interface Shortcut {
    /**
     * Android only
     */
    id: string;
    /** Click operation symbol. */
    action: string;
    /** This is the shortcut shown when user long press over the icon when it is located in the home screen. */
    shortLabel?: string;
    /** This is the shortcut shown when user long press over the icon when it is located in the app drawer. */
    longLabel?: string;
    /**
     * Android: should be the base64 icon or the name of this without extension.
     * iOS: custom icon, It must be a valid name of an icon template in your Assets catalog.
     */
    icon: string;
    /**
     * Android only.
     * Flag that indicates if the icon is base64 String or not. False by default.
     */
    iconIsBase64?: boolean;
    /**
     * iOS only
     * @link https://developer.apple.com/design/human-interface-guidelines/icons
     */
    iconType?: string;
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
  function removeAllDynamicShortcuts(onSuccess?: () => void, onError?: (err: string) => void): void;

  interface DynamicShortcuts {
    id: string;
    action: string;
    shortLabel?: string;
    longLabel?: string;
    disabledMessage?: string;
  }
  /**
   * Get dynamic shortcuts.
   * @param onSuccess success callback
   * @param onError fail callback
   * @example
   * ```javascript
   * Shortcuts.getDynamicShortcuts(
   *   (data) => {
   *     data.forEach((item) => {
   *       console.log(
   *         `Get dynamic shortcut: id: ${item.id}, action: ${item.action}, shortLabel: ${item.shortLabel}, longLabel: ${item.longLabel}, disabledMessage: ${item.disabledMessage}`
   *       );
   *     });
   *   },
   *   (err) => {
   *     console.log("getDynamicShortcuts error:", err);
   *   }
   * );
   * ```
   */
  function getDynamicShortcuts(onSuccess: (data: DynamicShortcuts[]) => void, onError?: (err: string) => void): void;

  /**
   * Set up dynamic shortcuts.
   * @param shortcuts the dynamic shortcut to be set.
   * @param onSuccess success callback
   * @param onError fail callback
   * @example
   * ```javascript
   * const shortcuts = [
   *   {
   *     id: "id_1",
   *     shortLabel: "short label 1",
   *     action: "action_1",
   *     icon: "icon_in_android_drawable_or_ios_assets",
   *   },
   *   {
   *     id: "id_2",
   *     shortLabel: "short label 2",
   *     action: "action_2",
   *     icon: "icon_android_base64",
   *     iconIsBase64: true,
   *   },
   *   {
   *     id: "id_3",
   *     shortLabel: "short label 3",
   *     action: "action_3",
   *     iconType: "ios_apple_icon",
   *   },
   * ];
   * Shortcuts.setDynamicShortcuts(shortcuts, () => {
   *   console.log("setDynamicShortcuts.ok");
   * });
   * ```
   */
  function setDynamicShortcuts(shortcuts: Shortcut[], onSuccess?: () => void, onError?: (err: string) => void): void;

  interface HomeIconPressedItem {
    /** Click operation symbol. */
    action: string;
    /** Title of pressed shortcut. */
    title: string;
    /** Subtitle of pressed shortcut. */
    subtitle: string;
  }
  /**
   * Callback method for pressing the desktop icon shortcut initialization
   * @param onHomeIconPressed When a home icon is pressed, your app launches and this JS callback is invoked.
   * @param onError error callback
   * @example
   * ```javascript
   * Shortcuts.initHomeIconPressed(payload => {
   *   console.log("Icon pressed. Action: " + payload.action + ". Title: " + payload.title + ".");
   *   if (payload.action == 'checkin') {
   *     document.location = 'checkin.html';
   *   } else if (payload.action == 'share') {
   *     document.location = 'share.html';
   *   } else {
   *     // hook up any other icons you may have and do something awesome (e.g. launch the Camera UI, then share the image to Twitter)
   *     console.log(JSON.stringify(payload));
   *   }
   * })
   * ```
   */
  function initHomeIconPressed(onHomeIconPressed: (data: HomeIconPressedItem) => void, onError?: () => void): void;

  /* --------------------------------- iOS only Start --------------------------------- */
  /**
   * **iOS only**
   * You need an iPhone 6S or some future tech to use the features of this plugin,
   * so you can check at runtime if the user's device is supported.
   */
  function isAvailable(callback: (avail: boolean) => void): void;

  interface TouchResult {
    force: number;
    timestamp: number;
    x: number;
    y: number;
  }
  /**
   * You can get a notification when the user force touches the webview.
   * The plugin defines a Force Touch when at least 75% of the maximum force is applied to the screen.
   * Your app will receive the x and y coordinates, so you have to figure out which UI element was touched.
   * @param onSuccess success callback
   * You can also track in JS which was the last element that received an ontouchstart event,
   * remember the timestamp when that happened and correlate that to the timestamp of the force touch.
   * If those are very close to each other you can safely assume the force touch was on that element.
   * @example
   * ```javascript
   * Shortcuts.watchForceTouches(function(result) {
   *   console.log("force touch % " + result.force); // 84
   *   console.log("force touch timestamp " + result.timestamp); // 1449908744.706419
   *   console.log("force touch x coordinate " + result.x); // 213
   *   console.log("force touch y coordinate " + result.y); // 41
   * });
   * ```
   */
  function watchForceTouches(onSuccess: (result: TouchResult) => void): void;

  /**
   * UIWebView and WKWebView (the webviews powering Cordova apps) don't allow the fancy new link preview feature of iOS9.
   * If you have a 3D Touch enabled device though,
   * you sometimes are allowed to force press a link and a preview pops up (see the screenshot above).
   * If you want to enable this feature, do:
   * @example
   * ```javascript
   * Shortcuts.enableLinkPreview();
   * ```
   */
  function enableLinkPreview(): void;

  /**
   * To disable the link preview feature again, do:
   * @example
   * ```javascript
   * Shortcuts.disableLinkPreview();
   * ```
   */
  function disableLinkPreview(): void;
  /* --------------------------------- iOS only End --------------------------------- */
}

interface Window {
  Shortcuts: typeof CordovaPluginShortcuts;
}
