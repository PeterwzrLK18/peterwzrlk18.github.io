# PNG 素材备份

此目录保留从网站 public/img 移出的 70 张 PNG，迁移时逐张校验，文件内容未修改。它们是现有站内素材的备份，部分此前已经缩小、压缩，不能视为最初导出的高清母版。

## 保存规则

- 此目录随源码提交，不受 .gitignore 排除；要先提交、推送，在线仓库才有备份。
- 它不在 app/public 内，不进入网站部署。部署来源是 app/dist。
- 子目录和文件名对应 app/public/img 下的 WebP，例如此处 `ComfyPad/Main Cover.png` 对应网站 `ComfyPad/Main Cover.webp`。
- 新 PNG 按项目目录保存，首页封面保存在 home；不要把备份放回 public/img。
- favicon 和应用图标 PNG 独立保留在 public，属于网站功能素材。

## 生成 WebP

安装项目依赖后，从仓库根目录运行：

```powershell
node app/scripts/optimize-images.mjs
```

脚本只读取此目录中的 PNG，最长边限制为 1920px，不放大小图，WebP quality 为 72。输出到 app/public/img，并替换所有对应的现有 WebP；PNG 本身保持不变。

已有合适 WebP 可以直接使用，普通开发或构建无需运行转换。此次迁移沿用已有的 71 张 WebP，没有重新编码。页面与灯箱均直接引用 WebP，详细内容流程见 [新增作品](../../app/docs/NEW_WORK_GUIDE.md)。

GIF 备份不在这里，旧转换工具将它们保存到本地 gitignored 的 _fullres-img-backup/gif-backup，规则见新增作品指南。
