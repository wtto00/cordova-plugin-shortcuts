# cordova-plugin-shortcuts

如果这个项目帮到你了，请我喝瓶可乐吧。

<a href="https://www.buymeacoffee.com/wtto00" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;max-width: 217px !important;" ></a>
<a href="https://afdian.net/a/wtto00" target="_blank"><img style="height: 60px !important;max-width: 217px !important;" src="https://pic1.afdiancdn.com/static/img/welcome/button-sponsorme.jpg" alt="sponsorme"></a >

[English](./README.md) | 中文简体

引用借鉴:

- 安卓: [kunder-lab/cordova-plugin-kunder-android-shortcuts](https://github.com//kunder-lab/cordova-plugin-kunder-android-shortcuts)
- iOS: [EddyVerbruggen/cordova-plugin-3dtouch](https://github.com/EddyVerbruggen/cordova-plugin-3dtouch)
- [安卓官方文档](https://developer.android.com/develop/ui/views/launch/shortcuts)
- [iOS 官方文档](https://developer.apple.com/documentation/uikit/menus_and_shortcuts/add_home_screen_quick_actions)

## 支持的平台

- android
- ios

## 安装

```shell
cordova plugin add https://github.com/wtto00/cordova-plugin-shortcuts.git
```

## 卸载

```shell
cordova plugin uninstall cordova-plugin-shortcuts
```

## 用法

### 静态快捷方式配置

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

- 安卓平台支持 `XML` 和 `PNG` 图片，同名图片将以 `XML` 优先。
- iOS 平台支持 `SVG` 和 `PNG` 图片，同名图片将以 `SVG` 优先。

在 `shortcuts.json` 文件中，您应该设置有关您想要创建的快捷方式的所有信息（最多 4 个快捷方式。如果您定义了多于 4 个，多余的将被忽略）。

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

| 字段                  | 支持的平台            | 说明                                                |
| --------------------- | --------------------- | --------------------------------------------------- |
| shortcutId            | ✅ Android            | 快捷方式唯一 ID                                     |
| icon                  | ✅ Android<br/>✅ iOS | `shortcuts/icons`文件夹中的图片文件名称，不包含后缀 |
| iconType              | ✅ iOS                | Apple 官方提供的图标<sup>\*</sup>                   |
| shortcutShortLabel    | ✅ Android<br/>✅ iOS | 快捷方式标题                                        |
| shortcutLongLabel     | ✅ Android<br/>✅ iOS | 快捷方式副标题                                      |
| shortcutDisabledLabel | ✅ Android            | 快捷方式被禁用时的显示文本                          |
| action                | ✅ Android<br/>✅ iOS | 点击触发的操作标志                                  |

> \*: iOS 9.0 支持的 Apple 官方图标: Compose, Play, Pause, Add, Location, Search, Share  
> \*: iOS 9.1 增加了这些: Prohibit, Contact, Home, MarkLocation, Favorite, Love, Cloud, Invitation, Confirmation, Mail, Message, Date, Time, CapturePhoto, CaptureVideo, Task, TaskCompleted, Alarm, Bookmark, Shuffle, Audio, Update  
> \*: 更多查看: <https://developer.apple.com/design/human-interface-guidelines/icons>

安卓平台中静态快捷方式，即使 APP 在后台运行，点击启动时候全都是重新打开，重新初始化，需要经过启动屏，所以耗时长，比较慢。  
iOS 下的静态快捷方式没有问题。所以你可以使用 `device.platform==='Android'` 来判断。  
如果需要在安卓平台下在 APP 后台运行时，快速打开，可以使用动态快捷方式，动态快捷方式在 APP 后台运行的时候打开 APP，触发的是 resume 事件，所以需要这样做

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

### 获取点击的快捷方式

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

> `payload.title` 在安卓平台是 `undefined` 。

### 创建动态快捷方式

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

| 字段               | 支持的平台            | 说明                                                                |
| ------------------ | --------------------- | ------------------------------------------------------------------- |
| id                 | ✅ Android            | 快捷方式唯一 ID                                                     |
| action             | ✅ Android<br/>✅ iOS | 点击触发的操作标志                                                  |
| shortcutShortLabel | ✅ Android<br/>✅ iOS | 快捷方式标题                                                        |
| shortcutLongLabel  | ✅ Android<br/>✅ iOS | 快捷方式副标题                                                      |
| icon               | ✅ Android<br/>✅ iOS | 自定义图标<sup>\*</sup>                                             |
| iconType           | ✅ iOS                | Apple 官方提供的图标                                                |
| iconIsBase64       | ✅ Android            | 可选参数：布尔类型。 标志 icon 字段是否是 base 字符串。默认为 false |

> \*: 在 iOS 平台上，可以使用自定义图标来提供自己的图标。它必须是 Assets 目录中图标模板的有效名称。
> \*: 在安卓平台上, 如果 `iconIsBase64=false`, 设置的 icon 需要手动复制到 `platforms/android/app/src/main/res/drawable` 目录. 你可以在 `config.xml` 中这样做: `<resource-file src="resources/shortcuts/icons/icon_1.xml" target="res/drawable/icon_1.xml" />`.

### 移除快捷方式

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

- 安卓平台移除所有的快捷方式，但是静态配置的快捷方式不受影响。
- iOS 平台将会移除包括静态配置的所有快捷方式。

### isAvailable

**仅支持 iOS**

您需要一部 iPhone 6S 或类似的未来技术来使用此插件的功能，因此您可以在运行时检查用户的设备是否受支持。

```javascript
Shortcuts.isAvailable(function (avail) {
  console.log(avail);
});
```

### 监听用户长按

**仅支持 iOS**

当用户对 webview 进行强制触摸时，您可以收到通知。插件定义了当至少 75%的最大力量被应用到屏幕上时，才会出现 Force Touch。您的应用程序将收到 x 和 y 坐标，因此您需要弄清楚被触摸的 UI 元素是哪一个。

对于上下文菜单、放大图像等等，非常有用。

```javascript
Shortcuts.watchForceTouches(function (result) {
  console.log("force touch % " + result.force); // 84
  console.log("force touch timestamp " + result.timestamp); // 1449908744.706419
  console.log("force touch x coordinate " + result.x); // 213
  console.log("force touch y coordinate " + result.y); // 41
});
```

您还可以在 JS 中跟踪哪个元素最后收到了 ontouchstart 事件，记住那时发生的时间戳，并将其与力触的时间戳进行关联。如果它们非常接近，您可以安全地假设力触发生在那个元素上。

### 启用链接预览

**仅支持 iOS**

UIWebView 和 WKWebView（用于 Cordova 应用的 Web 视图）不支持 iOS9 的新链接预览功能。但是，如果你有一台支持 3D Touch 的设备，有时你可以强按一个链接，然后弹出一个页面预览。如果你想启用这个功能，请执行以下操作：

```javascript
Shortcuts.disableLinkPreview();
```

### 禁用链接预览

**仅支持 iOS**

禁用链接预览，请执行以下操作：

```javascript
Shortcuts.disableLinkPreview();
```
