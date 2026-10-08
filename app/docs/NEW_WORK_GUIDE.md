# 新增作品

开发环境和启动方式见 [开发指南](../../DEVELOPMENT.md)，布局常量见 [设计规则](DESIGN_GUIDE.md)。下列素材命令从仓库根目录执行，检查命令从 `app/` 执行。

## 1. 准备素材与 slug

选用小写连字符 slug，例如 `my-new-project`。MDX 文件名、首页索引和 URL 必须一致。

PNG 放在 `assets/png-backups/New Project/`，封面放在 `assets/png-backups/home/`。已有合适的 WebP 可直接放入 `app/public/img/`。生成方法见 [PNG 备份说明](../../assets/png-backups/README.md)；转换脚本会重新生成全部对应 WebP，不必在每次开发时运行。

网页使用 `/img/New Project/Cover.webp` 这类路径，允许空格，但大小写必须与实际文件一致。Linux 构建区分大小写。作品 PNG/JPEG 不放在 `public/img/`。

## 2. 创建 MDX

新建 `app/src/works/my-new-project.mdx`，最小可用内容：

```mdx
import WorkImgContainer from '../components/WorkImgContainer';
import { sectionImgCls } from '../styles/markup';
import { workMetadata } from '../data/work-metadata.js';

export const meta = workMetadata['my-new-project'];

<div className={sectionImgCls}>
  <WorkImgContainer src="/img/New Project/Cover.webp" alt="作品封面" priority />
</div>
```

在 `app/src/data/work-metadata.js` 添加同 slug 的对象，包含 `title`、`subtitle`、`description`。title 必填；subtitle、description 选填，但分享预览建议填写 description。tags 可保存内容分类，目前不展示，也未接入 schema。详情页与静态分享入口共用这份数据。

MDX 使用 JSX 语法：`className`、`<br />`、`allowFullScreen`；注释使用 `{/* 注释 */}`，不要使用 HTML 注释。

纯图布局参考 `italian-cookbook.mdx`；带段落布局参考 `wilderness-rescue.mdx`；三图布局参考 `nybs.mdx`。封面与连续 feature 段应一起放进 featureBlockGroupCls，维持块内 1 倍、块间 2 倍间距。

双图示例：

```mdx
import { section2imgCls, section2imgItemCls } from '../styles/markup';

<div className={section2imgCls}>
  <div className={section2imgItemCls}>
    <WorkImgContainer src="/img/New Project/Research 1.webp" alt="研究过程一" />
  </div>
  <div className={section2imgItemCls}>
    <WorkImgContainer src="/img/New Project/Research 2.webp" alt="研究过程二" />
  </div>
</div>
```

把所需 import 放在文件顶部，只导入实际使用的常量。首组封面静态图添加 `priority`，立即加载并提高请求优先级；后续图片默认 lazy，不要全部标记 priority。图片组件负责灯箱注册与键盘打开，无需自己再写点击处理。

## 3. 首页索引与站点地图

在 `app/src/data/works-index.js` 的期望顺序位置添加：

```js
{ slug: 'my-new-project', title: 'My New Project', img: '/img/home/my-new-project-img.webp', alt: '作品封面' },
```

确认封面文件真实存在。当前首页封面统一为 780 × 500，分享图复用首页封面；构建会核对尺寸。如果引入不同尺寸，需要同步调整 `page-metadata.js` 中该作品的分享尺寸声明，不涉及详情图片自动预留空间。在 `app/public/sitemap.xml` 的 `</urlset>` 前加入：

```xml
<url><loc>https://peterwzrlk18.github.io/work/my-new-project</loc><priority>0.7</priority><changefreq>yearly</changefreq></url>
```

测试中首页卡片数量目前固定为 9；新增作品后同步更新 `src/App.test.jsx` 中的预期数量。详情页参数化测试自动读取 worksIndex。

## 4. 可选视频

已有动画放同名 `.webm` 与 `.mp4`，MDX 的 WorkImgContainer 写 `.webm` 路径；动画静音循环播放，不进入灯箱。

需要转换 GIF 时，安装 FFmpeg 和 ffprobe、放入 `app/public/img/<Project>/`，再运行：

```powershell
node app/scripts/convert-gifs.mjs
```

该脚本将原 GIF 备份到本地 gitignored 的 `_fullres-img-backup/gif-backup/`，两种视频生成成功才删除 public GIF。GIF 备份不属于在线 PNG 备份区；若同路径已存在不同内容的备份，脚本报错并保留输入。

YouTube 嵌入参考 ComfyPad：

```mdx
import { iframeContainerCls, iframePosterCls } from '../styles/markup';

<div className={iframeContainerCls}>
  <iframe
    className={iframePosterCls}
    loading="lazy"
    src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
    title="作品演示"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>
```

## 5. 本地检查

在 `app/` 中执行：

```powershell
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
pnpm.cmd test:site
```

首次浏览器检查前运行 `pnpm.cmd exec playwright install chromium`。也可双击根目录 preview.bat 进行交互检查：

- 首页卡片、详情标题、封面和正文正确，图片没有缺失。
- 桌面与手机宽度下左右对齐，双图切换为纵排，没有横向溢出。
- 灯箱按页面顺序切图、首尾循环，关闭后焦点返回。
- 手机双指缩放、双击恢复；原始比例左右滑动切图，放大后拖动不切图。
- 桌面普通图双击、长图单击缩放，拖动后不会误触恢复。
- URL 与 sitemap 一致；分享图使用绝对 WebP 地址。

测试环境模拟触控事件，正式发布前尽量用真实手机验证。静态图片放在 public，新增图片增加部署素材体积，不会直接变成 JS bundle 内容。

## 6. 提交与发布

先在 GitHub Desktop 或 Git diff 中确认代码、网站 WebP、PNG 备份和 sitemap 都包含在预期修改中，再提交、推送。

推送 main 触发 lint、单元测试、build 和生产预览浏览器检查。发布需要在 GitHub Actions 手动运行 Build & Deploy to GitHub Pages，或推送 v* 标签；检查通过后将同一份已测试构建部署到 gh-pages。不要使用重建 Git 索引或强推来“刷新缓存”。

发布后自动等待线上 `build-info.json` 的提交号和构建指纹匹配本次产物，再检查页面、素材、字体、灯箱及分享信息；最多等待 5 分钟，超时或检查失败会使工作流失败。检查报告可在该次 Actions 的 Artifacts 中下载：`preview-test-report` 和 `online-test-report`。自动检查不自动回滚，失败时先查看报告和正式站。

分享平台可能缓存旧预览，更新后需在目标平台重新抓取链接；独立静态分享标签不等同于完整页面预渲染。真实手机交互和 sitemap 仍应人工核对。
