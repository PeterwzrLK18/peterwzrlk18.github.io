# 本地开发

网站源码在 `app/`。项目要求 Node.js 24 LTS，当前本机使用 24.21.0；pnpm 版本为 10.33.2。版本记录分别在 `app/.node-version` 和 `app/package.json`。

## 环境配置

当前电脑的 Node.js 和 pnpm 安装在用户目录，并加入用户 PATH：

- Node.js：`%LOCALAPPDATA%\Programs\WebDev\node-v24.21.0-win-x64`
- pnpm：`%LOCALAPPDATA%\Programs\WebDev\pnpm`

安装后重新打开终端和编辑器，让它们读取新的 PATH。验证：

```powershell
node --version
pnpm.cmd --version
```

PowerShell 使用 `pnpm.cmd` 可避免执行策略拦截同名 .ps1 文件。在命令提示符里可直接使用 `pnpm`。

其他电脑先从 [Node.js 官网](https://nodejs.org/en/download) 安装 Node.js 24，再安装固定 pnpm 版本：

```powershell
npm.cmd install -g pnpm@10.33.2
```

VS Code 用于编辑，GitHub Desktop 用于查看、提交和同步。React、Vite、Tailwind 等随依赖安装，无需单独配置数据库或 Docker。

## 启动

双击根目录 `preview.bat`，依赖缺失时会安装并打开浏览器。保持窗口打开，保存文件后自动更新；Ctrl+C 停止。端口占用时先关闭旧预览，脚本不会结束其他进程。

手动操作：

```powershell
cd C:\Users\peter\Documents\GitHub\peterwzrlk18.github.io\app
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev --host 127.0.0.1 --port 5173 --strictPort
```

访问 http://127.0.0.1:5173 。换电脑时把示例路径改为实际仓库路径；命令提示符切目录可用 `cd /d`。

## 修改后的检查

在 `app/` 中运行：

```powershell
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
```

lint 检查 React 代码和 Node 素材脚本；test 检查页面、图片集合和灯箱交互；build 先校验作品素材，再生成 `app/dist/`。

构建后可用 `pnpm.cmd preview --host 127.0.0.1` 检查生产结果，打开终端显示的地址。这些本地命令不会发布网站，正式发布流程见 [项目说明](app/README.md)。

## 素材工具

PNG 备份位于 `assets/png-backups/`，网站素材位于 `app/public/img/`，操作见 [备份说明](assets/png-backups/README.md)。sharp 随项目安装，转换会覆盖对应 WebP 输出，但不改 PNG 备份；普通开发无需重复转换。

只有新增 GIF 并运行 convert-gifs.mjs 时才需要 FFmpeg 和 ffprobe。它们不是普通启动、测试或构建的必要依赖。原 GIF 的备份只保存在本地，具体规则见 [新增作品指南](app/docs/NEW_WORK_GUIDE.md)。

常见问题：提示找不到 node/pnpm 时重新打开终端并检查 PATH；安装锁文件不匹配时先核对依赖修改；图片缺失时核对路径大小写与实际文件，不要跳过构建检查。
