# cordova-platform-specific-files

This plugin allows you to parse platform specific files in the following format: `name.platform.extension`

## Installation

```
cordova plugin add cordova-platform-specific-files
```

## Supported Platforms

 - iOS
 - Android
 - Windows
 - Wp8

## References to Platform-Specific Files

In your code, reference `name.platform.extension` files as `name.extension` files. For example, if your file is named main.wp8.css, reference it as main.css in your code. During a build for Windows Phone, the plugin will pick up main.wp8.css, rename it to main.css and include it in your app.

If an existing app contains files that the plugin identifies as platform-specific, you might need to change existing references or rename the files.
For platform-specific-only files, provide a file name in the following format: `name.platform.extension`

## Example:
```
index.ios.html
main.android.js
style.wp8.css
```
