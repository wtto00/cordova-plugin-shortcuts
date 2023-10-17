# cordova-plugin-shortcuts

English | [中文简体](./README-ZH_CN.md)

References:

- Android: [kunder-lab/cordova-plugin-kunder-android-shortcuts](https://github.com//kunder-lab/cordova-plugin-kunder-android-shortcuts)
- iOS: [EddyVerbruggen/cordova-plugin-3dtouch](https://github.com/EddyVerbruggen/cordova-plugin-3dtouch)
- [Android Shortcut Document](https://developer.android.com/develop/ui/views/launch/shortcuts)
- [IOS Shortcut Document](https://developer.apple.com/documentation/uikit/menus_and_shortcuts/add_home_screen_quick_actions)
- [Android shortcut icon design specification](https://commondatastorage.googleapis.com/androiddevelopers/shareables/design/app-shortcuts-design-guidelines.pdf)

## Support Platforms

- android
- ios

## Install

```shell
cordova plugin add cordova-plugin-shortcuts
```

## Uninstall

```shell
cordova plugin uninstall cordova-plugin-shortcuts
```

## Usage

### Static shortcuts configuration

```txt
resources
├─── shortcuts
    └─── icons
        └─── icon_1.png //Use words, numbers and "_" characters only.
        └─── icon_2.png //Use words, numbers and "_" characters only.
        ...
        └─── icon_N.png
    └─── shortcuts.json
```

- Android platform supports `XML` and `PNG`, and if there are images with the same name, `XML` files are given priority.
- IOS platform supports `SVG` and `PNG`, and if there are images with the same name, `SVG` files are given priority.

In the shortcuts.json file you should set all the information about the shortcuts you want to create (maximum 4 shortcuts. If you define more than 4, these will be ignored):

```json
{
  "android": [
    {
      "shortcutId": "ID_1",
      "icon": "icon_1",
      "shortcutShortLabel": "Short Label 1",
      "shortcutLongLabel": "Long Label 1",
      "shortcutDisabledLabel": "Disabled message 1",
      "action": "ACTION_1"
    },
    {
      "shortcutId": "ID_2",
      "icon": "icon_2",
      "shortcutShortLabel": "Short Label 2",
      "shortcutLongLabel": "Long Label 2",
      "shortcutDisabledLabel": "Disabled message 2",
      "action": "ACTION_2"
    }
  ],
  "ios": [
    {
      "icon": "icon_1",
      "shortcutShortLabel": "Short Label 2",
      "shortcutLongLabel": "Long Label 2",
      "action": "ACTION_1"
    },
    {
      "iconType": "Compose",
      "shortcutShortLabel": "Short Label 2",
      "shortcutLongLabel": "Long Label 2",
      "action": "ACTION_2"
    }
  ]
}
```

| Field                 | Platform              | Note                                                             |
| --------------------- | --------------------- | ---------------------------------------------------------------- |
| shortcutId            | ✅ Android            | Unique ID for a shortcut.                                        |
| icon                  | ✅ Android<br/>✅ iOS | One of the icon names in shortcuts/icons without file extension. |
| iconType              | ✅ iOS                | icons which have been provided by Apple.<sup>\*</sup>            |
| shortcutShortLabel    | ✅ Android<br/>✅ iOS | Title for a shortcut.                                            |
| shortcutLongLabel     | ✅ Android<br/>✅ iOS | Subtitle for a shortcut.                                         |
| shortcutDisabledLabel | ✅ Android            | Text information displayed when shortcut is disabled.            |
| action                | ✅ Android<br/>✅ iOS | Click operation symbol.                                          |

> \*: iOS 9.0: Compose, Play, Pause, Add, Location, Search, Share  
> \*: iOS 9.1 added these: Prohibit, Contact, Home, MarkLocation, Favorite, Love, Cloud, Invitation, Confirmation, Mail, Message, Date, Time, CapturePhoto, CaptureVideo, Task, TaskCompleted, Alarm, Bookmark, Shuffle, Audio, Update  
> \*: More: <https://developer.apple.com/design/human-interface-guidelines/icons>

In the Android platform, static shortcuts, even if the app is running in the background, will always open the app from scratch, requiring initialization and going through the splash-screen, which takes a long time and is slower.  
There is no problem with static shortcuts in iOS. So you can use `device.platform === 'Android'` to determine.  
If you need to quickly open the app while it is running in the background in the Android platform,, you can use dynamic shortcuts. When the app is opened through a dynamic shortcut while running in the background, it triggers the "resume" event, so it needs to:

```javascript
function handleSelectShortcut() {
  window.Shortcuts.initHomeIconPressed((res) => {
    if (res?.action === "ACTION_1") {
      // do something
    } else if (res?.action === "ACTION_2") {
      // do something
    } else if (res?.action === "ACTION_3") {
      // do something
    }
  });
}

document.addEventListener(
  "deviceready",
  () => {
    // trigger when the APP is cold-started
    handleSelectShortcut();
    // set dynamic shortcuts
    window.Shortcuts.setDynamicShortcuts(
      [
        {
          icon: "icon_1",
          shortLabel: "Short Label 2",
          action: "ACTION_1",
        },
        {
          iconType: "Compose",
          shortLabel: "Short Label 2",
          longLabel: "Long Label 2",
          action: "ACTION_2",
        },
      ],
      () => {
        console.log("setDynamicShortcuts ok");
      }
    );
    document.addEventListener(
      "resume",
      () => {
        // trigger when the app is opened from the background
        handleSelectShortcut();
      },
      false
    );
  },
  false
);
```

### Get Selected Shortcut

```javascript
document.addEventListener(
  "deviceready",
  () => {
    Shortcuts.initHomeIconPressed((payload) => {
      console.log("Icon pressed. Action: " + payload.action + ". Title: " + payload.title + ".");
      if (payload.action == "ACTION_1") {
        // Do something
      } else if (payload.action == "ACTION_2") {
        // Do something
      } else {
        console.log(JSON.stringify(payload));
      }
    });
  },
  false
);
```

> `payload.title` is `undefined` on android platform.

### Create a dynamic shortcut

```javascript
Shortcuts.createDynamicShortcut(
  {
    id: "someID",
    action: "someAction",
    shortLabel: "ShortLabel",
    longLabel: "LongLabel",
    icon: "BASE64_String_icon",
    iconIsBase64: "true",
  },
  successCallback,
  errorCallback
);
```

| Field              | Platform              | Note                                                                                           |
| ------------------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| id                 | ✅ Android            | Unique ID for a shortcut.                                                                      |
| action             | ✅ Android<br/>✅ iOS | Click operation symbol.                                                                        |
| shortcutShortLabel | ✅ Android<br/>✅ iOS | Title for a shortcut.                                                                          |
| shortcutLongLabel  | ✅ Android<br/>✅ iOS | Subtitle for a shortcut.                                                                       |
| icon               | ✅ Android<br/>✅ iOS | Custom Icons.<sup>\*</sup>                                                                     |
| iconType           | ✅ iOS                | icons which have been provided by Apple.                                                       |
| iconIsBase64       | ✅ Android            | (Optional) Boolean. Flag that indicates if the icon is base64 String or not. False by default. |

> \*: Custom Icons on iOS platform can be used to provide your own icon. It must be a valid name of an icon template in your Assets catalog.  
> \*: On the Android platform, if `iconIsBase64=false`, the icon that is set needs to be manually copied to `platforms/android/app/src/main/res/drawable`. You can do this in `config.xml`: `<resource-file src="resources/shortcuts/icons/icon_1.xml" target="res/drawable/icon_1.xml" />`.

### Remove all dynamic shortcuts

```javascript
Shortcuts.removeAllDynamicShortcuts(
  function (response) {
    console.log(response);
  },
  function (error) {
    console.log(error);
  }
);
```

- Android platform will remove all dynamic shortcuts, but the static shortcuts will not be affected.
- IOS platform will remove all shortcuts, the static shortcuts are included.

### Get all dynamic shortcuts

```javascript
Shortcuts.getDynamicShortcuts(
  (data) => {
    data.forEach((item) => {
      console.log(
        `Get dynamic shortcut: id: ${item.id}, action: ${item.action}, shortLabel: ${item.shortLabel}, longLabel: ${item.longLabel}, disabledMessage: ${item.disabledMessage}`
      );
    });
  },
  (err) => {
    console.log("getDynamicShortcuts error:", err);
  }
);
```

### Set dynamic shortcuts

```javascript
const shortcuts = [
  {
    id: "id_1",
    shortLabel: "short label 1",
    action: "action_1",
    icon: "icon_in_android_drawable_or_ios_assets",
  },
  {
    id: "id_2",
    shortLabel: "short label 2",
    action: "action_2",
    icon: "icon_android_base64",
    iconIsBase64: true,
  },
  {
    id: "id_3",
    shortLabel: "short label 3",
    action: "action_3",
    iconType: "ios_apple_icon",
  },
];
Shortcuts.setDynamicShortcuts(shortcuts, () => {
  console.log("setDynamicShortcuts.ok");
});
```

### isAvailable

**iOS only**

You need an iPhone 6S or some future tech to use the features of this plugin, so you can check at runtime if the user's device is supported.

```javascript
Shortcuts.isAvailable(function (avail) {
  console.log(avail);
});
```

### watchForceTouches

**iOS only**

You can get a notification when the user force touches the webview. The plugin defines a Force Touch when at least 75% of the maximum force is applied to the screen. Your app will receive the x and y coordinates, so you have to figure out which UI element was touched.

Useful for context menu's, zooming in on images, whatnot.

```javascript
Shortcuts.watchForceTouches(function (result) {
  console.log("force touch % " + result.force); // 84
  console.log("force touch timestamp " + result.timestamp); // 1449908744.706419
  console.log("force touch x coordinate " + result.x); // 213
  console.log("force touch y coordinate " + result.y); // 41
});
```

You can also track in JS which was the last element that received an ontouchstart event, remember the timestamp when that happened and correlate that to the timestamp of the force touch. If those are very close to each other you can safely assume the force touch was on that element.

### enableLinkPreview

**iOS only**

UIWebView and WKWebView (the webviews powering Cordova apps) don't allow the fancy new link preview feature of iOS9. If you have a 3D Touch enabled device though, you sometimes are allowed to force press a link and a page preview pops up. If you want to enable this feature, do:

```javascript
Shortcuts.disableLinkPreview();
```

### disableLinkPreview

**iOS only**

To disable the link preview feature again, do:

```javascript
Shortcuts.disableLinkPreview();
```
