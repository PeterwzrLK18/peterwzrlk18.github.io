# Likai Wang — Portfolio

设计师个人作品集站点，基于 **React 19 + Vite 8 + react-router-dom 7**。部署在 GitHub Pages (`peterwzrlk18.github.io`)。

本仓库根目录是从旧静态 HTML 站点迁移至 React SPA 的工作区。代码主体在 `app/`；根目录还有 `scripts/deploy_refresh.sh`(手动缓存刷新)与 `_fullres-img-backup/`(印刷级原图备份,gitignored 只留本地,不上线)。

> **演进总结**(Phase 1 → 6 + 4b + 5b + 清理 A/B/C + D1-D3 已完成):
> - SPA 化 + 404 fallback + 9 个作品 MDX 模块化
> - 图片 webp -89% 体积;灯箱系统 + 长图 hover-follow / click-zoom / drag-pan / 键盘 pan
> - Tailwind v4 CSS-first:所有 token 在 `@theme`,旧 6 个 CSS 文件已删除,className 全部内联或集中到 `src/styles/markup.js`
> - a11y(focus-visible / ARIA / reduced-motion)+ CI 缓存 + lint+test 门禁 + 3 个 vitest 冒烟测试
> - SEO:`og:image`/`twitter:image` 改 absolute URL + width/height/alt + og:site_name;`sitemap.xml` + `robots.txt` 上线;简历 PDF 改 ASCII 文件名避免 URL 乱码;404 页 Tailwind 化 + "Back to Home" 按钮
> - 清理:删除 Vite 脚手架残留 assets、根目录冗余 docs/、35MB PSD 源文件;注释与 .gitignore 同步现状(原迁移源 `archive_old/` 已删,印刷级原图统一收进 gitignored 的 `_fullres-img-backup/`)

---

## 技术栈

| 层 | 选择 |
|---|---|
| 框架 | React 19 |
| 构建 | Vite 8 (`@vitejs/plugin-react`) |
| 路由 | react-router-dom 7 (`BrowserRouter`) |
| 样式 | Tailwind v4 CSS-first:`@theme` 含 brand 色 + 字体 + 6 个自定义断点 + 所有响应 CSS 变量;`@layer base` 含 `@font-face` / `button:focus-visible`;app 内所有页面 className 改为 utility 字符串集中放 `src/styles/markup.js` |
| 内容 | `@mdx-js/rollup` v3,作品内容按 `src/works/<slug>.mdx` 模块化 |
| 包管理 | pnpm |
| 部署 | GitHub Actions 双 job:`ci`(每次 push 验证)+ `deploy`(v* tag 或手动触发才上线)→ `gh-pages` 分支 |

---

## 目录结构

```
app/
├── index.html                 # 入口 HTML,含 SEO/OG/Schema.org 元数据
├── vite.config.js             # plugin-react + @mdx-js/rollup
├── postcss.config.js          # @tailwindcss/postcss(v4 自带 autoprefixer)
├── tailwind.config.js         # 已删除(v4 CSS-first 配置改在 tailwind.css 里)
├── docs/
│   └── NEW_WORK_GUIDE.md      # 加新 Work 的 8 步操作手册(MDX 骨架 / magick webp 命令 / 验证清单)
├── scripts/
│   ├── optimize-images.mjs    # 图片优化:webp/png 压到 max-1920 q72/q85,原图备份到 _fullres-img-backup/
│   └── convert-gifs.mjs       # GIF → WebM(VP9)+ MP4(H.264),原 GIF 备份到 _fullres-img-backup/gif-backup/
├── public/
│   ├── 404.html               # GitHub Pages SPA fallback → sessionStorage redirect
│   ├── docs/                  # 中文简历 PDF(Navbar Resume 链接目标,Likai-Wang-Resume-CN.pdf)
│   ├── fonts/                 # Roboto Mono VariableFont(font-display:swap)
│   ├── favicon.ico / favicon.svg / favicon-96x96.png / apple-touch-icon.png
│   ├── web-app-manifest-192x192.png / web-app-manifest-512x512.png
│   ├── site.webmanifest       # PWA manifest(name 已从脚手架占位改回 "Likai Wang — Portfolio")
│   ├── img/
│   │   ├── home/              # Home 卡片封面图(每张 .png 配同名 .webp)
│   │   ├── about/             # About 页图片(Kowsky Plaza / Good Luck)
│   │   └── <project>/         # 各项目详情图(NYBS / Starseeker / ComfyPad / ...含 .webm/.mp4 视频)
│   ├── sitemap.xml            # 11 个 URL(/ , /about , 9 个 work)
│   └── robots.txt             # Allow all + sitemap pointer
└── src/
    ├── main.jsx               # BrowserRouter(无 view transitions)+ StrictMode + SPA redirect restore + render
    ├── App.jsx                # 路由 + 根 div(固定 Tailwind 字符串 + data-page 诊断 attr)
    ├── components/
    │   ├── Navbar.jsx         # 导航:active 态用 useLocation 推断 + group-hover
    │   ├── WorkCard.jsx       # 单张作品卡(slug 缺失返回 null 防御)+ aspect-ratio + reduced-motion
    │   ├── ScrollToTop.jsx    # 路由切换自动滚回顶部
    │   ├── Seo.jsx            # 路由级 <title>/<meta> 封装(React 19 原生 hoist)
    │   ├── Modal.jsx          # 灯箱系统:Provider(记录触发元素 + 关闭后焦点还原)+ 长图 hover-follow + click-zoom + drag-pan + 键盘 pan + focus trap
    │   ├── WorkImgContainer.jsx  # 自动 webp(静态图)/ <video> 渲染(webm/mp4)+ 注册 LightboxGallery + 点击触发 modal
    │   ├── LightboxGallery.jsx   # 收集页内图片为 array,点击触发 ModalProvider.open
    │   ├── modal-context.js / lightbox-gallery-context.js  # Context 分离
    ├── data/
    │   └── works-index.js     # 作品索引(slug/title/img/alt),静态 import
    ├── works/
    │   └── <slug>.mdx         # 9 个作品:nybs / wilderness-rescue / orb-starseeker / form-of-vertebra / comfypad / cellphone-info / italian-cookbook / sonder / plagiarism
    ├── pages/
    │   ├── HomePage.jsx       # import worksIndex → 渲染 4 列响应网格(1310→3 / 900→2 / 490→1)
    │   ├── AboutPage.jsx      # 静态 About 内容(全部 Tailwind inline,无外 CSS)
    │   ├── WorkDetailPage.jsx # import.meta.glob 找 MDX → 渲染 meta + LightboxGallery + body
    │   └── NotFoundPage.jsx   # Tailwind 化 404 页:巨 404 + "Back to Home" pill 按钮
    ├── lib/
    │   └── url.js             # absoluteUrl(path) — 拼绝对 URL + encodeURI,社交卡 OG/Twitter 用
    ├── styles/
    │   ├── tailwind.css       # Tailwind v4 入口 + @theme(token + 6 个自定义断点) + @layer base + @font-face + @layer utilities
    │   └── markup.js          # 21 个 Tailwind class 常量,供 WorkDetailPage + 9 个 MDX 共用(含 section3imgCls NYBS 三图 / iframeContainerCls / descriptionTextCls)
    └── modal.css              # 灯箱 scoped 组件级 CSS(keyframe / dots / zoom hint / 5b pan 助动)
```

CSS 当前仅 2 个文件:

| 文件 | 职责 | 入口 |
|---|---|---|
| `styles/tailwind.css` | **全局**:Tailwind v4 入口 + `@theme`(brand 色 / 字体 / 6 个自定义断点 / layout spacing / clamp 字号等 token) + `@layer base`(box-sizing、`a{text-decoration:none}`、`@font-face`、`button:focus-visible`、body) + `@layer utilities`(`.sr-only`)+ 响应式 `:root --side-padding` override | `main.jsx` |
| `modal.css` | **组件级 scoped**:灯箱 keyframe + `.modal` overlay + `.modal-dot` / `.modal-content-long` / `.modal-content-zoomed` / `.modal-long-hint-zoomed` (5b 长图 pan/zoom) | `components/Modal.jsx` |

---

## 设计系统

### 颜色 token(`tailwind.css` → `@theme`)

| 变量 | 值 | 用途 |
|---|---|---|
| `--color-brand-900` | `rgba(30,30,30,1)` | 强调(导航 active、标题) |
| `--color-brand-800` | `rgba(44,44,44,1)` | 正文标题(`--color-text-brand-default`) |
| `--color-brand-700` | `rgba(90,90,90,1)` | 中性背景(`--color-background-neutral-default`,About 卡灰底) |
| `--color-brand-500` | `rgba(117,117,117,1)` | 次级文本(`--color-text-brand-tertiary`,导航非 active) |
| `--color-brand-400` | `rgba(179,179,179,1)` | 更浅灰(弱化文本) |
| `--color-brand-100` | `rgba(245,245,245,1)` | 近白灰 |
| `--color-paper` | `#fff` | 亮色背景(`--color-background-default-default`) |

> `--color-background-default-default` / `--color-text-brand-default` / `--color-text-brand-tertiary` / `--color-background-neutral-default` 是语义别名(映射到上面的 brand 原语),组件里优先用语义名。

**主题**:架构审计(Phase 8)已删除原 `[data-color-mode="SDS-light/SDS-dark"]` 暗色切换 block —— 全站没有任何元素设置过该属性,目前只有亮色一套。将来要加暗色,直接在 `tailwind.css` 的 `@theme` 语义 token 上做 `prefers-color-scheme` 重映射即可。

### 字体

- **Inter** — 标题与正文(`--font-heading`)
- **Roboto Mono** — 代码风、subtitle、title-page(`--font-mono`)
- 可变字重 `100–700`,通过 `@font-face` 加载,均已加 `font-display: swap`(避免 FOIT)
- 字体文件位于 `app/public/fonts/`,build 时 Vite 直接拷贝到 dist 根

### 字号流体化(`clamp()`)

避免断点处 cliff 跳变,核心字号全部内联为 `clamp(min, preferred, max)` utility(集中在 `markup.js` 各常量与 Navbar/WorkCard),在视口区间内连续变化:

| 位置 | 表达式 | 大屏(≥1200px) | 768px | 320px |
|---|---|---|---|---|
| 作品标题 `titleBlockCls` | `clamp(28px, 1.5rem + 2vw, 48px)` | 48px | ~32.8px | 28px |
| 副标题 `worksubtitleCls` | `clamp(16px, 0.8rem + 0.6vw, 20px)` | 20px | ~17.4px | 16px |
| 正文 `featuretitleCls / descriptionTextCls / workDescriptionTextCls` | `clamp(14px, 0.6rem + 0.9vw, 24px)` | 24px | ~16.5px | 14px |
| Navbar logo / Home 卡片标题 | `clamp(14px, 0.6rem + 0.9vw, 24px)` | 24px | ~16.5px | 14px |

移动端专用字号 token(`--fs-h1` / `--fs-h2` / `--fs-body` + `--lh-tight` / `--lh-normal`)用于 Work detail 页等强结构化排版,仍是断点式(768/490/390 三档,`tailwind.css` 底部媒体查询里递减),保留设计节奏。

### Navbar 比例流体化

navbar 高度与纵向 padding 也用 `clamp()`,视口连续变化,768 断点处不再"咯哒"跳一档:

| 属性 | 表达式 |
|---|---|
| 高度 | `clamp(72px, 4rem + 2vw, 90px)` |
| 纵向 padding | `clamp(24px, 1rem + 0.6vw, 30px)` |
| 横向 padding | `var(--side-padding)`(见下,断点式) |

---

## 响应式设计

### 1. `--side-padding` 全局对齐变量

整站横向内边距统一由 `--side-padding` 一个变量控制,在不同视口断点切换:

| 视口 | `--side-padding` |
|---|---|
| 默认(>1310) | `50px` |
| ≤1310px | `40px` |
| ≤900px | `30px` |
| ≤768px | `20px` |
| ≤390px | `16px` |

**单变量原则**:`Navbar.jsx` header 与 `HomePage.jsx` works grid 都用 `px-[var(--side-padding)]`,谁都不另叠 padding,所以无论视口宽到哪一档,首卡左缘永远与 `likai.wang` logo 左缘对齐,末卡右缘永远与 `RESUME` 右缘对齐。

### 2. 华夫饼网格(Home 卡片)

`HomePage.jsx` 用 CSS Grid(`grid-cols-4` 等工具),`aspect-[var(--card-ratio)]` 锁卡片比例:

```jsx
<section
  id="works-list"
  className="grid grid-cols-4 gap-y-5 gap-x-5 mx-auto w-full max-w-[1720px] px-[var(--side-padding)] max-wide:grid-cols-3 max-desktop:grid-cols-2 max-mini:grid-cols-1"
>
  {worksIndex.map((work) => (
    <WorkCard key={work.slug} work={work} />
  ))}
</section>
```

`max-wide / max-desktop / max-tablet / max-navcol / max-mini / max-ultra` 是 `tailwind.css @theme` 里定义的 6 个自定义断点(取值 `1311 / 901 / 769 / 501 / 491 / 391`),`max-` 前缀映射成 `max-width:${N-1}px`,所以 `max-wide:grid-cols-3` = 视口 ≤1310 时 3 列。

**纵向节奏(WorkCard 内 title ↔ image 与行间 gap 固定 1:4)**:`WorkCard.jsx` 的 `<h2>` 是自然高度标题(不再有 50px 居中条),`mb-[5px]` 让 title → 自己的 image 恒为 5px;`#works-list` 的 `gap-y-5`(20px)让 title → 上方卡片 image 底部恒为 20px,即 1:4 分组:标题紧贴自己的图,与上一件作品拉开四倍距。

| 视口 | 列数 |
|---|---|
| >1310px | 4 |
| ≤1310 | 3 |
| ≤900 | 2 |
| ≤490 | 1 |

卡片比例抽出为 `--card-ratio: 390 / 250`,在不同场景可换 16/9 等不同比例(WorkImgContainer 不带 aspect-ratio,只 WorkCard 用)。

### 3. Navbar active 态

`Navbar.jsx` 用 `useLocation` 推断 active tab,在 `<Link>` className 上加 `group-hover` + `group-active` 工具字符:
- 路径 `/` 或 `/work/*` → `WORK` active
- 路径 `/about` → `ABOUT` active
- `RESUME` 是外链 PDF,没有 active 态

每个 nav-item 的外层 `<div>` 用 `group` class 成 group 容器,内层 link 用 `group-hover:text-[var(--color-brand-900)] group-hover:font-semibold` — 与 `text-[var(--color-brand-900)] font-semibold` active 态共用同一组强调样式(变深 + 加粗)。

### 4. 路由根容器

`App.jsx` 根据 `useLocation().pathname` 计算 `page` 字符串,挂在根 div 的 `data-page` 属性上(仅作诊断与 DevTools 选择器探查):
- `/` / `/about` / `/work/*` / 其它 → `home` / `about` / `work` / `home`

⚠️ **历史架构 → Phase 4b 后已取消**:4b 前曾经 `.home / .about / .work` 切根 class 作为 CSS 作用域前缀(命中 `index.css` / `about.css` / `works.css` 内对应 `.home .xxx` 规则)。4b 把这些 CSS 文件全部删除并改为 Tailwind utility 内联后,根 class 失去作用域意义,因此改为固定的 `flex flex-col min-h-screen gap-[var(--gap-after-nav)]` + 诊断 attr。

历史上曾经因把 `/work/*` 也标成 `.home`,触发 `.home .sector-item { aspect-ratio }` 误命中 work detail 页图片、产生 127px 空白的 bug —— 这种"作用域污染"在新架构下不再可能发生(根 div 不再有动态 CSS class)。

---

## 路由

| 路径 | 组件 | 状态 |
|---|---|---|
| `/` | `HomePage` | ✅ |
| `/about` | `AboutPage` | ✅ |
| `/work/:slug` | `WorkDetailPage` | ✅ 9 个作品 MDX 已全部迁完,未匹配 slug 走 `NotFoundPage` |
| `*` | `NotFoundPage` | ✅ |

**SPA fallback**:GitHub Pages 不做 server-side fallback,直接刷新 `/about` 或 `/work/xxx` 会 404。已用 `public/404.html` + `main.jsx` 中的 redirect 消费逻辑解决:404 页把原路径存入 `sessionStorage['spa-redirect']`,跳到 `/` 后由 `main.jsx` 读取并 `history.replaceState` 恢复正确路由。

**滚动恢复**:`<ScrollToTop />` 组件挂在 `<App>` 顶部,监听 `useLocation().pathname` 变化,路由切换时滚回窗口顶部。

**路由级 SEO**:React 19 原生支持在组件中渲染 `<title>` / `<meta>`,自动 hoist 到 `<head>`(无需 react-helmet)。`<Seo />` 组件封装 og:title / og:description / og:image / twitter:card 等共享元数据,每个 page 顶部各调用一次。

---

## 数据流

**Home 页**:`import { worksIndex } from './data/works-index'` → 静态渲染 9 张 WorkCard(零 fetch)。

每个作品索引项字段:
```js
{ slug: 'kebab-case', title: '...', img: '/img/home/xxx.png', alt: '...' }
```

**Work Detail 页**:`import.meta.glob('../works/*.mdx', { eager: true })` 一次性收集所有 MDX 模块,按 URL 参数 `:slug` 匹配文件,渲染其 `default` 组件 + `meta` 元数据。未匹配的 slug 渲染 `<NotFoundPage />`。

**作品 MDX 内部约定**:
- 文件顶部必须有 `export const meta = { title, subtitle, description, ... }`
- body 内容用 JSX 语法写(MDX 不支持裸 HTML 风格,`class=` → `className=`、`<br>` → `<br />`、`allowfullscreen` → `allowFullScreen` 等)
- 在文件顶部 `import WorkImgContainer` 与需要的常量 from `'../styles/markup'`(`sectionImgCls`、`featureUnitCls` 等)
- 每个图段用 `<WorkImgContainer src=... alt=... />`(自动 webp + 自动注册到 LightboxGallery;无需手写 `<picture>`)
- feature 段用 `featureUnitCls` 包父(见下文「三层亲密性梯度」)
- self-identity 级别的描述是 `workDescriptionWrapCls`(外层 div,仅 layout)+ `workDescriptionTextCls`(内层 p,仅 typography);feature 段正文是 `descriptionCls`(外层 div)+ `descriptionTextCls`(内层 p)。**div 与 p 不要套同一个类名**,也别混用两组
- 灯箱系统零配置:MDX 只写 `<WorkImgContainer>`,点击行为由组件统一处理;无需手写 "Enlarge" 按钮
- **视频支持**:`src` 以 `.webm`/`.mp4` 结尾时,`WorkImgContainer` 自动渲染 `<video autoPlay muted loop playsInline>`(双 `<source>`:webm 优先 + mp4 兜底),并**不注册进灯箱**(示例:SONDER 的 4 段动图用 `.webm`);只有静态图(.png/.jpg)才走 picture→webp + 灯箱注册

---

## 三层亲密性梯度(Proximity Principle)

作品详情页的 visual unit 用三层嵌套 + 三档 gap 表达"亲密性"。核心思想来自格式塔 Proximity Principle —— 物理间距越近,读者越倾向于把它们读作同一组。

### 结构

```
WorkDetailPage @ workDetailContainerCls (gap --work-section-gap=20px)   ← 第 3 层:unit ↔ unit
├── selfIdentityCls                                            (顶部框架)
├── sectionImgCls / section2imgCls                             (纯图段,作为独立 unit)
└── featureUnitCls (gap calc(--work-section-gap/2)=10px)        ← 第 2 层:header ↔ gallery
    ├── featureHeaderCls (gap 2 = 8px)                        ← 第 1 层:title ↔ description
    │   ├── featureCls > featuretitleCls
    │   └── descriptionCls (wrapper) > descriptionTextCls
    └── featureGalleryCls
        └── section2imgCls / sectionImgCls
```

### 三档 gap

| 层级 | 元素 | gap | 含义 |
|---|---|---|---|
| **1 最紧** | featuretitle ↔ description | **8px**(`gap 2` utility) | 同一 header 内,标题与正文紧贴 |
| **2 较紧** | feature-header ↔ feature-gallery | **10px**(`calc(var(--work-section-gap)/2)`) | 同 unit 内,图文段紧接 header |
| **3 较松** | unit ↔ unit | **20px**(`var(--work-section-gap)`) | 不同 unit 独立区分 |

### 响应式行为

- **>1310**:feature-header 横排(`justify-content: space-between`),title 左 / description 右
- **≤1310**:feature-header 与 self-identity 都转纵排(title 上 / description 下 / gallery 再下),纵向 gap 维持三层分级
- **≤900**:section-2img 内双图转纵排(组内 10px),`--work-section-gap` 从 20 降到 10(与堆叠断点对齐)——纯图页横纵等距:**>900px 20:20 / ≤900px 10:10**

### 写新 MDX 时的模板

```jsx
import WorkImgContainer from '../components/WorkImgContainer';
import {
  sectionImgCls,
  sectionImgItemCls,
  section2imgCls,
  section2imgItemCls,
  featureUnitCls,
  featureHeaderCls,
  featureCls,
  featuretitleCls,
  descriptionCls,
  descriptionTextCls,
  featureGalleryCls,
} from '../styles/markup';

export const meta = { title: '…', subtitle: '…', description: '…', tags: ['…'] };

<div className={featureUnitCls}>
  <div className={featureHeaderCls}>
    <div className={featureCls}>
      <b className={featuretitleCls}>小标题</b>
    </div>
    <div className={descriptionCls}>
      <p className={descriptionTextCls}>短描述</p>
    </div>
  </div>
  <div className={featureGalleryCls}>
    <div className={section2imgCls}>
      <div className={section2imgItemCls}>
        <WorkImgContainer src="/img/<project>/img1.png" alt="…" />
      </div>
      <div className={section2imgItemCls}>
        <WorkImgContainer src="/img/<project>/img2.png" alt="…" />
      </div>
    </div>
  </div>
</div>
```

无 title 的纯图段就直接用 `<div className={sectionImgCls}>…</div>` 或 `<div className={section2imgCls}>…</div>` 不包裹 feature-unit,作为独立 unit 出现,与其它 unit 间靠 `workDetailContainerCls` 的 `--work-section-gap`(20px / ≤900 10px)区分。**`section2imgCls` 单个子项 = 单1小图**(左半槽、右留白,如 italian-cookbook Back Cover)。

```powershell
cd app
pnpm install
pnpm dev          # 启 dev server(默认 http://localhost:5173)
pnpm build       # 出 dist/
pnpm preview     # 预览生产构建
pnpm lint        # ESLint 检查
```

---

## 部署

### Workflow 设计:`.github/workflows/deploy.yml`

工作流拆成两个 job,通过**触发条件 + job 依赖**分离"质量门禁"与"上线":

| Job | 跑什么 | 触发条件 |
|---|---|---|
| **ci**(Lint + Test + Build) | `pnpm lint` → `pnpm test` → `pnpm build`,**只验证不部署** | 任何 push 到 `main`、任何 `v*` tag、手动 `workflow_dispatch` |
| **deploy**(Deploy to gh-pages) | 复跑 build → 把 `app/dist` 推到 `gh-pages` 分支 | 只在 `v*` tag 被 push 或手动 `workflow_dispatch` 时跑;且强依赖 `ci` job 通过 |

> 这样**日常 push 只烧 CI 额度,不会动到 `gh-pages` 历史与线上版本**。只有符合"发版"语义的动作才会真正上线。

### 发版流程(两种,任选其一)

**A. 打 Tag 发版**(推荐,有版本记录):

1. 先在本地或 GitHub Desktop 把所有改动 commit 并 push 到 `main`(CI 跑一遍验证)
2. 等绿勾出现后,用 PowerShell / Git Bash 打 tag 并推上去:
   ```powershell
   git tag v1.0.0          # 改成你要的版本号
   git push --tags         # 推 tag → CI 再跑一遍 → 自动 deploy
   ```
3. **GitHub Desktop 用户**:
   - 命令行里 `git tag v1.0.0` 打一下 tag(GitHub Desktop 本身不支持直接打 tag,需要这步一次性命令)
   - 之后再在 GitHub Desktop 里 `Repository` → `Push` 一次,tag 就跟着上去了
   - 或者直接在 GitHub Web 界面 `Actions` → 选 workflow → 右上角有 `Run workflow` 按钮 → 选 `main` 分支 → Run
4. `gh-pages` 上最新 commit 消息会是 `deploy: v1.0.0`,以后线上版本一目了然

**B. 手动触发发版**(适合临时上线,不想要版本号):

1. 浏览器打开 `https://github.com/PeterwzrLK18/peterwzrlk18.github.io/actions/workflows/deploy.yml`
2. 右上角 `Run workflow` 按钮,弹窗里选 `main` 分支(不是 `gh-pages`)
3. 点 `Run workflow` → CI 再跑一遍 → 通过后自动 deploy

> 选 `main` 分支就是用 `main` 最新代码 build 然后部署;选 `gh-pages` 没意义(那分支已经是上次 build 的产物,不是源代码)。

### 首次启用 Pages(只需做一次)

仓库 Settings → Pages → `Deploy from a branch` → branch=`gh-pages` / `/ (root)` → Save。

### 部署后注意事项

- GitHub Pages CDN 对 HTML 缓存 10 分钟(`Cache-Control: max-age=600`),新代码上线可能延迟几分钟反映出来
- **用户首次更新到新版本需要 Ctrl+Shift+R 强刷**,刷掉浏览器缓存的旧 JS bundle(CI/部署日志会在 1–2 分钟内显示绿勾)
- 部署日志在 `https://github.com/PeterwzrLK18/peterwzrlk18.github.io/actions` 看;失败时会在 Actions 标签页显示红 ✗,点进去能看到具体哪一步崩了
- `gh-pages` 分支**不要手动改**,它只由 peaceiris/action-gh-pages 在 deploy 时覆写;本地开发都在 `main`
- **手动缓存刷新**(通常不必):根目录 `scripts/deploy_refresh.sh` 会 `git rm -r --cached .` + 强推当前分支,用来强制 GitHub Pages 重建资源,慎用

---

## 后续 Roadmap

| Phase | 目标 | 状态 |
|---|---|---|
| 1 | react-router 引入、Navbar 组件化、数据 schema 修正、CSS 性能/流体化改造 | ✅ |
| 2 | `404.html` SPA fallback + ScrollToTop + NotFoundPage + 路由级 SEO | ✅ |
| 3 | MDX v3 接入 → 9 个作品内容按 `src/works/<slug>.mdx` 全部迁完 | ✅ |
| 4 | Tailwind v4 CSS-first 启用 + `@font-face font-display: swap` + App.css/globals.css 删除 + rootClass 三分 + 三层亲密性梯度架构 + 死代码清理 | ✅ |
| 5 | 图片优化(webp -89% 体积、picture 多源、CLS 防护)+ 灯箱重建(ModalProvider + WorkImgContainer + LightboxGallery + dots + 长图识别 + 键盘 ← → ESC + 切图无闪烁)+ a11y(focus-visible / ARIA / reduced-motion) | ✅ |
| 4b | 把 `works.css` / `about.css` / `index.css` / `shared.css` / `styleguide.css` / `NYBS.css` 全部删除;所有 className 迁成 Tailwind utility 或集中到 `src/styles/markup.js`;token + 断点 + `@font-face` 全部搬到 `tailwind.css` 的 `@theme` / `@layer base` | ✅ |
| 5b | 灯箱长图交互:hover 跟随 Y 轴扫描 + click 切换 1.8× 缩放 + 拖拽 pan + 键盘 ↑↓←→(单图模式下) + ESC 二段退出(zoom→close)+ reduced-motion 禁用过渡 | ✅ |
| 6 | CI 升级:`pnpm/action-setup@v4`(version 10)+ `actions/setup-node@v4`(node 24 + pnpm cache)+ `pnpm lint && pnpm test && pnpm build` 三段门禁 + vitest 3 个冒烟测试(App renders / 9 work cards / 404 page) | ✅ |
| 清理 A+B | 删 Vite 脚手架残留 `app/src/assets/{hero.png,react.svg,vite.svg}` / 根目录 `.nojekyll` / 根目录 `docs/`(与 `app/public/docs/` 重复)/ 根目录 `css-analysis.md` / `app/public/docs/Likai Wang Resume.docx.pdf`(Navbar 不链)/ `app/public/img/home/home-cover img.psd`(35MB PSD 不该进 prod) | ✅ |
| C | 注释/文档 stale 引用同步:`tailwind.css` / `markup.js` / `README.md` 中残留"styleguide.css / works.css / .home .sector-item / .section-2img"等旧名同步为新 `markup.js` 常量名 `section2imgCls` / `featureUnitCls` 等 | ✅ |
| D1 | 简历 PDF 改 ASCII 文件名:`王立凯 中文简历.docx.pdf` → `Likai-Wang-Resume-CN.pdf`,Navbar href 同步更新 | ✅ |
| D2 | OG / Twitter 分享卡:`src/lib/url.js` 的 `absoluteUrl()` 统一全站 OG/Twitter image 改 absolute URL;补 `og:image:width / height / alt` + `og:site_name`;`index.html` 静态 head 与 `Seo.jsx` 动态 head 都升级;`encodeURI` 处理含空格图片路径 | ✅ |
| D3 | `app/public/sitemap.xml`(11 个 URL,/ + /about + 9 个 work,priority 1.0/0.8/0.7)+ `app/public/robots.txt`(Allow all + sitemap 指针上线) | ✅ |
| D3c | `NotFoundPage.jsx` Tailwind 整体化:Roboto Mono 巨 "404" + body-code 说明 + 描边 pill "Back to Home" 链接 + hover-fill + focus ring;移除 `.not-found` className 与为主样式 | ✅ |
| D4 | Lighthouse / Web Vitals 实测(CI 已落地质量基线:webp + CLS 防护 + 缓存 + a11y,等部署稳定后跑一次留下分数) | ⚪ 待 run |
| 5b-fix | Modal 拖拽 bug:拖拽放大图松手会因浏览器隐性 click 误退出 zoom;加 5px 阈值区分 click vs drag,moved=true 时吞掉这次 click | ✅ |
| CI 拆分 | `deploy.yml` 拆 `ci`(每次 push 跑 lint/test/build)+ `deploy`(只在 v\* tag 或手动 workflow_dispatch 时跑)+ `deploy` 强依赖 `ci` 通过 | ✅ |
| 7 | 图片管线脚本落地:`app/scripts/optimize-images.mjs`(webp/png 重编码 max-1920 q72/q85,体积 -45%/-78%)+ `app/scripts/convert-gifs.mjs`(SONDER 23MB GIF → WebM+MP4,净省约 90%,WorkImgContainer 增加 isVideoSrc `<video>` 分支);清理 `.webp.tmp` 残留 | ✅ |
| 8 | 架构审计:`VideoContainer.jsx` 死代码移除(并入 `WorkImgContainer` 的 `isVideoSrc`);`tailwind.css` 死 token 清理(-76 行,仅保留 `--color-/--font-/--breakpoint-` 等真 token);`site.webmanifest` 改名 + `icons.svg` 删除 | ✅ |

---

## 设计原则备忘(给未来的我)

1. **单变量对齐**:横向 padding 永远走 `--side-padding`,别让任何容器另叠 padding,对齐会错位。
2. **流体优先**:能用 `clamp()` 平滑过渡的属性(字号、纵向 padding、高度)优先流体化;只有与"离散节奏"强耦合的属性(列数切换、uppercase 开关)才用断点。
3. **作用域前缀(历史架构,Phase 4b 后已取消)**:4b 前曾经靠根容器 `.home / .about / .work` className 作为 CSS 作用域前缀,套配 `index.css / about.css / works.css` 内 `.xxx .yyy` 规则。4b 全部 CSS 文件已删除、所有的 className 改为 Tailwind utility,根 `div` 改用固定 utility 字符串 + `data-page` 诊断 attr —— 此机制不再适用,新增 page 直接用 JSX 内联 utility 即可,无 CSS 污染风险。
4. **CSS 顺序敏感(历史)**:4b 前曾经多个全局 CSS 文件同特异性时后 import 赢。4b 后所有样式集中在 `src/styles/tailwind.css`(`@theme` + `@layer base/utilities` + `:root` 媒体查询)与 `src/styles/markup.js`(组件 class 常量),新增 token 入 `@theme`,新增组件 class 入 `markup.js`,别再在文件根写散 CSS。
5. **slug 一致**:`src/data/works-index.js` 的 `slug` 必须与路由 `:slug` 一一对应,WorkCard 有 `if (!work.slug) return null` 防御但别依赖它。
6. **(历史踩坑记录)`.home .sector-item aspect-ratio` bug**:曾经把 `/work/*` 也设成 `.home`,导致 `index.css` 里的 `.home .sector-item { aspect-ratio: 390/250 }` 误命中 work detail 的图片容器,造成 sector-item 高度被裁成宽 ÷ (250/390) = 1038px,而内部 work-img-container 按图片原生 16:9 自撑 ~911px,差 127px 全是空白。Phase 4b 全局 CSS 删完后 `aspect-[var(--card-ratio)]` 已 inline 到 `WorkCard.jsx`,只在 Home 卡片用,不会跨页污染;此处保留作历史教训。
7. **`object-fit` + `width:100%` + `height:auto` 不要混用**:`object-fit: contain` 在 width 已撑满、height 已 auto 的情况下无意义,反而误导渲染。只有"容器尺寸固定,图片需裁剪填满"时才用 `object-fit`,否则让图自然按比例撑更稳。
8. **同组高度一致**:flex 容器 `align-items` 默认 stretch 时,并列子项会被拉到等高——这正是我们要的。`section2imgCls` 用 `items-stretch`:`2 张图`(同为 16:9)天然等高。**单图分两种,别混用**:`单1大图`(全宽,如 NYBS Home Page / Plagiarism poster / italian-cookbook Cover)用 `sectionImgCls`;`单1小图`(在 2 列容器里只填左半槽,右侧留白,如 italian-cookbook Back Cover)复用 `section2imgCls` 只放一个 `section2imgItemCls` 子项即可,不必塞空 div。**图+文字**:右半槽也用 `section2imgItemCls` 包 text(div 用 layout 槽位、内层 `<p>` 用 `descriptionTextCls` 管 typography),左右槽几何完全对称(如 plagiarism 01_All + 描述段)。
9. **单变量 padding 必须笼罩全站所有页面**(踩过的坑):早期 `about.css` hardcode 了 `padding: 0 50/40/30/20` + 4 个 media query override,与全局 `--side-padding` 系统并存且漏 ≤390 段对齐。Phase 4b 后所有页面横向 padding 走 `px-[var(--side-padding)]` utility,新增任何页或容器,**不复制 hardcode 副本**,直接走 `--side-padding`,否则不同页对齐会跨断点漂移。
10. **`feature-unit` 是视觉单元的最小包裹**(架构原则):每个有标题的图文段必须包进 `featureUnitCls`,header 与 gallery 之间用 unit gap `calc(--work-section-gap/2)`(10px 桌面 / 5px ≤900)表达"同 unit 归属感",unit 与 unit 之间用 container gap `--work-section-gap`(20px / 10px)表达"独立分界"。无 title 的纯图段直接作独立 unit,不包 unit 包父。纯图页横纵等距(组内 gap 与组间 section-gap 同值):**>900px 20:20 / ≤900px 10:10**。同一 `featureGalleryCls` 内有多个图组时(如 SONDER 的 2img + 全宽图),组间也用完整 `--work-section-gap`,与组内图片间隔一致。详见上文「三层亲密性梯度」。
11. **CSS 不要保留"迟早要用"的占位代码**:Phase 4 保留 `.enlarge-btn` 占位 18 行,Phase 4 收尾审计直接删掉。Phase 5 真做灯箱时按当时语义新建 markup + CSS,不期待"占位"还合用——避免 stale placeholder 误导后续维护。

---

## 作品详情页 Typography 设计语言

参考 IBM 2x Design System 的比例思路,用项目**自己的字族与色板**实现了一套五级 typography 层级体系。核心原则:**字号分层做骨骼,字重分层做骨骼,颜色分层做态度**——三重信号互不替代。

> 下列"类名"均为 `src/styles/markup.js` 的常量(历史 CSS 类 `.title` / `.worksubtitle` / `.work-description` / `.featuretitle` / `.description` 已在 Phase 4b 删除,但设计语义原样保留)。

### 五级层级体系

| Level | 类名常量 | 字族 | 字重 | 字号(clamp) | 颜色 | 视觉角色 |
|---|---|---|---|---|---|---|
| **L1** | `titleBlockCls` | Roboto Mono | 700 | clamp(28–48) | brand-900 `#1e1e1e` | 作品"标牌",display 级,负荷最重 |
| **L2** | `worksubtitleCls` | Roboto Mono | 400 | clamp(16–20) | brand-500 `#757575` | 作品副标题,退后一档,与 L1 形成 Mono 内的大小对比 |
| **L3** | `workDescriptionTextCls`(顶部) | Inter | 600 | clamp(14–24) | brand-800 `#2c2c2c` | 顶部框架的"短描述",立住,与下方 feature 视觉同档 |
| **L3** | `featuretitleCls` | Inter | 400 | clamp(14–24) | brand-800 `#2c2c2c` | feature 段小标题,**与 L3 work-description 同档**:同字号区间、同颜色,字重轻一档做退后 |
| **L4** | `descriptionTextCls` (feature 段) | Inter | 600 | clamp(14–24) | brand-500 `#757575` | feature 段正文,"阅读性优先"——弱色 + 600 semi-bold 的组合 |

> 表内 L3 顶部 / L4 均为内层 `<p>` 的 typography 常量;其外层 `<div>` 用 `workDescriptionWrapCls` / `descriptionCls`(仅 layout,承载 `ml-auto` / `max-w-*`)。

### 核心设计决策

#### 决策 1:字族切换是分级信号

- **顶部框架**(`titleBlockCls` / `worksubtitleCls`)用 **Roboto Mono** — 给作品"标牌"感,与正文不同字族即视觉分层
- **正文层级**(`featuretitleCls` / `descriptionTextCls`)用 **Inter** — 更易读

> 不靠颜色就能让读者**第一眼**分辨"这是作品标题区"还是"这是段内正文":字族本就不是同一种语言。

#### 决策 2:`featuretitleCls` 与 `workDescriptionTextCls` 近似同档

- 两者同字族(Inter)、同字号区间(clamp 14–24)、同颜色(brand-800)
- **差异在字重**:`workDescriptionTextCls` 600(立住), `featuretitleCls` 400(退后)
- 不让 `featuretitleCls` 比顶部 `workDescriptionTextCls` 大(它不是"更大的子标题",它是"段内标题")
- 不让 `featuretitleCls` 比顶部 `workDescriptionTextCls` 小(它不是 caption,它要承起一段图组)

#### 决策 3:feature 段内 title 与 description 的平衡术(reverse 字重-颜色配对)

这是本设计语言的核心特征。常规做法是"标题深+加粗,正文浅+常规",这里**反向**:

| 元素 | 字重 | 颜色 | 解释 |
|---|---|---|---|
| `featuretitleCls`(标题) | 400(轻) | brand-800 深 | 标题不必抢眼,深色已够"标牌"分量 |
| `descriptionTextCls`(正文) | 600(semi-bold) | brand-500 浅 | 正文要**阅读性**:弱色易"看进眼",但弱色易飘,所以用 semi-bold 压住,色与字重互补平衡 |

**为何这样反向配对**:
- 标题靠字号已分层,字重轻 + 深色正好"立住但不夺眼",让 `featuretitleCls` 不与顶部 `titleBlockCls` 争夺视觉焦点
- 正文需要被读,轻灰可以让人沉浸入内容,但轻灰在常规字重下会"飘";用 600 把每个字母"立"起来,既不抢色也不夺字重
- 段视觉的两端(标题深沉 vs 正文浅重)在视觉重量上闭合

色板严格控制在黑/灰系内,不引入第三色,与"设计师作品集"的沉稳调性相称。

#### 决策 4:clamp 让所有层级在视口宽度内连续变化

- 不用断点式(如 24px → 20px)的跳变,改 `clamp(min, preferred, max)`(集中在 `markup.js` 各常量)让每个 Level 在大屏(1200px+)从 max 起、在小屏与 768 及以下以 min 钳住
- 768 以下已存在的 `--fs-h1/h2/body` 等 token 仍是断点式,维持移动端设计节奏感
- 不要让五级在 768 以下重新洗牌,各自 clamp 在 min 就位即可,继续维持相对关系

#### 决策 5:类型语义类名 `descriptionTextCls` vs `workDescriptionTextCls`

- 早期 `.description` 被两处共用,改 feature 描述样式就牵动顶部框架
- 拆分后 `workDescriptionTextCls`(配 wrapper `workDescriptionWrapCls`)单独承载顶部框架第三级,`descriptionTextCls`(配 wrapper `descriptionCls`)单独承载 feature 段正文
- 写新作品 MDX 时,**`descriptionCls`(wrapper)+ `descriptionTextCls`(文本)只用在 feature-unit 内**,self-identity 内的描述已在 `WorkDetailPage.jsx` 用 `workDescriptionWrapCls` / `workDescriptionTextCls`,无需在 MDX 里再写