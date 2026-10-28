# images 目录说明

本目录预留给 tabBar 图标、活动图片等静态资源。

当前 `app.json` 的 tabBar 使用纯文字（不配置 iconPath），因此**无需**提供图标即可正常运行。
如需添加图标，请放置 81x81px 的 PNG，并在 `app.json` 的 tabBar list 中为每项补充 `iconPath` / `selectedIconPath`。
