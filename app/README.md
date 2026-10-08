# 项目说明

Likai Wang 的个人作品集网站。源码位于本目录，线上地址为 https://peterwzrlk18.github.io 。

开发步骤见 [开发指南](../DEVELOPMENT.md)；新增内容见 [新增作品](docs/NEW_WORK_GUIDE.md)；布局约定见 [设计规则](docs/DESIGN_GUIDE.md)；检查结果见 [维护记录](docs/MAINTENANCE.md)。

## 技术与目录

使用 React 19、Vite 8、React Router 7、Tailwind CSS 4、MDX 3 和 pnpm。具体依赖版本以 `package.json` 和 `pnpm-lock.yaml` 为准。

| 路径 | 职责 |
|---|---|
| `src/main.jsx` | StrictMode、BrowserRouter、GitHub Pages 路由恢复 |
| `src/App.jsx` | 导航、页面路由、ModalProvider、滚动回顶 |
| `src/pages/` | Home、About、作品详情、404 |
| `src/data/works-index.js` | 首页卡片顺序、slug、封面、替代文字 |
| `src/works/*.mdx` | 9 个作品的正文及共享元信息引用 |
| `src/data/work-metadata.js`、`page-metadata.js` | 作品文字和全部页面的分享信息 |
| `src/components/WorkImgContainer.jsx` | 静态图片、视频和灯箱注册 |
| `src/components/LightboxGallery.jsx` | 当前作品图片集合与切图顺序 |
| `src/components/Modal.jsx` | 灯箱状态、键盘、焦点与原有控件 |
| `src/components/use-image-gestures.js` | 缩放、拖动、双击、滑动及冲突处理 |
| `src/components/Seo.jsx`、`src/lib/url.js` | 路由元信息与分享图片绝对地址 |
| `src/styles/tailwind.css` | 全局样式、设计变量和响应断点 |
| `src/styles/markup.js` | MDX 与详情页共享的布局、文字样式 |
| `src/modal.css` | 灯箱视觉、触控区域和安全区 |
| `public/` | 直接复制进构建结果的图片、视频、字体、简历、图标等 |
| `scripts/check-image-assets.mjs` | 构建前验证作品素材及引用 |
| `scripts/generate-static-pages.mjs` | 构建后生成独立分享入口和版本清单 |
| `scripts/wait-for-release.mjs` | 等待线上版本匹配本次发布 |
| `e2e/site.spec.mjs` | 生产预览和发布后共用的浏览器检查 |
| `scripts/optimize-images.mjs` | 只读仓库 PNG 备份，生成 WebP |
| `scripts/convert-gifs.mjs` | 手动转换 GIF 为 WebM 和 MP4 |
| `../assets/png-backups/` | 提交到源码仓库的 PNG 备份，不部署 |
| `../.github/workflows/deploy.yml` | 检查与发布流程 |

## 路由与数据流

- `/`：首页直接读取 `worksIndex`，按数组顺序显示卡片。
- `/about`：个人介绍与联系方式。
- `/work/:slug`：通过 `import.meta.glob` 提前加载 MDX，按文件名匹配 slug。
- 未匹配的页面或作品：显示 404。

详情页渲染 MDX 的 `meta.title`、`subtitle` 和 `description`，正文由 MDX 默认组件提供。`tags` 是保留的内容元信息，目前不显示，也未接入结构化数据。

静态图片通过 `WorkImgContainer` 注册到当前页的 `LightboxGallery`；打开时过滤已卸载条目，向灯箱传入有序图片集合。注册函数和上下文保持稳定，避免 StrictMode 下重复更新造成渲染循环。视频不参与灯箱集合。

构建为首页、About 和 9 件作品生成独立 HTML 入口；GitHub Pages 对目录入口补尾部斜杠，React 路由支持两种形式。其他深链接仍由 `public/404.html` 暂存路径并跳回首页，再由 `main.jsx` 恢复路由，路径暂存依赖 sessionStorage。本地生产预览也对已生成入口补斜杠。

## 图片与视频

页面、首页卡片、About 和灯箱直接使用 `public/img/` 中的 WebP。同一张详情图片和灯箱图片共用 URL，不另取 PNG。

70 张现有 PNG 已迁到仓库根目录的备份区，逐张校验内容未变；迁移没有重新编码已有 WebP。它们是此前站内素材的备份，部分已经缩小、压缩，不能视为最初的高清母版。图片格式检查仅限制作品素材目录，favicon 和应用图标仍可使用 PNG。

转换规则和操作集中在 [PNG 备份说明](../assets/png-backups/README.md)。转换脚本不随构建运行。

首页按当前网格列数让首行 1 / 2 / 3 / 4 张图片使用 `loading="eager"`，其中第一张使用 `fetchPriority="high"`，其他图片保持 lazy。窗口宽度改变时同步调整提示，不更换图片 URL。作品 MDX 为封面图片添加 `priority`，立即加载并提高请求优先级；Plagiarism 的首组双图都标记 priority，其余详情图片 lazy。SONDER 的首屏视频维持原有播放和 metadata 预加载设置。

这是首行/首组的加载策略，不根据视口高度计算所有可见图片。浏览器仍可能提前加载临近视口的 lazy 图片，high 也只是优先级提示。自动尺寸信息和详情图片预留空间尚未实施。

动画以同名 WebM 与 MP4 配对保存；`WorkImgContainer` 优先播放 WebM，提供 MP4 后备，使用静音、循环和行内播放。YouTube 嵌入使用 iframe，不进入灯箱。

## 灯箱交互

保留原有黑色遮罩、关闭按钮和底部圆点，没有新增缩放或翻页虚拟按键。

| 输入 | 操作 |
|---|---|
| 手机双指 | 缩放，范围 1–4 倍；松开一指后可继续拖动 |
| 手机双击 | 以点击位置为中心放大到 2.5 倍，再双击恢复 |
| 手机单指，未放大 | 左右滑动切图，首尾循环；短距离、竖向和明显斜向手势忽略 |
| 手机单指，已放大 | 拖动图片，限制边界，不切图 |
| 鼠标 | 普通图双击缩放；长图单击放大到 1.8 倍或恢复；放大后拖动 |
| 键盘 | 左右方向键切图；放大时上下键平移，单图时左右键也平移 |
| 键盘 Enter / Space | 图片获得焦点时切换缩放 |
| Escape | 放大时先恢复，再按关闭 |
| Tab / Shift+Tab | 焦点保持在灯箱内，关闭后返回触发元素 |

手势取消、窗口尺寸变化和切图都会清理相关状态。长图目前按视口适配，不再有鼠标悬停扫描；手机隐藏桌面操作提示。

## 检查与发布

在本目录执行 `pnpm lint`、`pnpm test`、`pnpm build`。构建前验证静态素材引用、禁止作品 PNG/JPEG，并检查 WebM 的 MP4 后备文件。检查器针对源码中的直接路径，不能覆盖任意运行时拼接 URL。

测试覆盖首页与 404、响应式首行加载策略、9 个作品在 StrictMode 下渲染及封面优先级、灯箱顺序与焦点恢复、缩放/拖动/切图冲突。触控测试使用 jsdom 模拟事件；用户已反馈 Android 上几个灯箱的放大操作正常，仍需补充 iOS 和完整手势组合验证。

当前工作流：推送 `main` 运行 CI，包含生产预览浏览器检查；推送 `v*` 标签或手动触发工作流，在检查通过后将同一份产物发布到 `gh-pages`。部署后等待线上版本匹配，再运行相同的浏览器检查。CI 与部署是不同阶段，不能把 CI 绿勾等同于上线。报告保留 7 天，发布失败不自动回滚。

构建生成的 11 个入口各自带有标题、简介、canonical、Open Graph 与 Twitter 分享标签，作品复用对应首页 WebP 封面并声明真实尺寸，不依赖爬虫执行 JavaScript。启动时移除这些静态标签，由 `Seo` 接管客户端路由，避免导航后残留旧标签。页面正文仍由 React 渲染，未做完整预渲染；分享平台缓存与 WebP 支持需在实际平台核对。

Inter 普通体现在随网站托管，Roboto Mono 保持原有文件和用途。字体来源与许可证见设计规则。
