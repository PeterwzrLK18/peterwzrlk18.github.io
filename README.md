# Likai Wang — Portfolio

个人作品集网站，源码在 `app/`，使用 React 19、Vite 8、React Router 7 和 Tailwind CSS 4。

## 文档入口

| 文档 | 内容 |
|---|---|
| [项目说明](app/README.md) | 目录、路由、数据流、图片与灯箱、发布方式 |
| [开发指南](DEVELOPMENT.md) | Windows 环境、启动、检查与本地预览 |
| [新增作品](app/docs/NEW_WORK_GUIDE.md) | PNG 备份、WebP、MDX、索引、站点地图 |
| [设计规则](app/docs/DESIGN_GUIDE.md) | 字体、响应布局、间距和常量使用 |
| [维护记录](app/docs/MAINTENANCE.md) | 本轮清理、验证范围与待讨论事项 |
| [PNG 备份说明](assets/png-backups/README.md) | 素材保存与转换规则 |

双击 `preview.bat` 启动本地网站。首次开发先阅读开发指南。

源码提交到 `main` 后运行代码与生产预览检查；手动触发 GitHub Actions 或推送 `v*` 标签才部署网站，发布后自动核对线上版本、页面和素材。PNG 备份随源码提交，部署仅包含 `app/dist/`。各作品分享信息在构建时写入独立入口。
