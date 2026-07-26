# Likai Wang — Portfolio

设计师个人作品集站点，基于 **React 19 + Vite 8 + react-router-dom 7**。部署在 GitHub Pages (`peterwzrlk18.github.io`)。

本仓库根目录是从旧静态 HTML 站点迁移至 React SPA 的工作区。代码主体在 `app/`；`archive_old/` 是迁移来源(只读参考,不再迭代)。

> **本次(Phase 4 收尾)重要演进**:9 个作品 MDX 全部迁完 → 三层亲密性梯度架构形成 → typography 五级体系落地 → 死代码清理(61 行冗余)。整套设计语言融合编辑/书籍排版底色 + 响应式 web + 视觉层级意识。详见下文各个段落。

---

## 技术栈

| 层 | 选择 |
|---|---|
| 框架 | React 19 |
| 构建 | Vite 8 (`@vitejs/plugin-react`) |
| 路由 | react-router-dom 7 (`BrowserRouter`) |
| 样式 | 纯 CSS + CSS 变量(token system)。Tailwind v4 已 CSS-first 启用(`@theme` 镜像主 token + preflight reset),但全文档 utility 迁移仍待 Phase 4b |
| 内容 | `@mdx-js/rollup` v3,作品内容按 `src/works/<slug>.mdx` 模块化 |
| 包管理 | pnpm |
| 部署 | GitHub Actions → `gh-pages` 分支 |

---

## 目录结构

```
app/
├── index.html                 # 入口 HTML,含 SEO/OG/Schema.org 元数据
├── vite.config.js             # plugin-react + @mdx-js/rollup
├── postcss.config.js          # @tailwindcss/postcss(v4 自带 autoprefixer)
├── tailwind.config.js         # 已删除(v4 CSS-first 配置改在 tailwind.css 里)
├── public/
│   ├── 404.html               # GitHub Pages SPA fallback(SP WIP) → sessionStorage redirect
│   ├── docs/                  # 中英文简历 PDF(Navbar Resume 链接目标)
│   ├── fonts/                 # Roboto Mono VariableFont(随 Phase 4 补 font-display:swap 时迁入)
│   ├── img/
│   │   ├── home/              # Home 卡片封面图
│   │   └── <project>/         # 各项目详情图(NYBS / Starseeker / ComfyPad / ...)
│   └── works-data.json        # 已删除(Phase 3 改用 src/data/works-index.js 静态 import)
└── src/
    ├── main.jsx               # BrowserRouter + StrictMode + SPA redirect restore + render
    ├── App.jsx                # 路由 + 根容器 className(home / about / work 三分)
    ├── components/
    │   ├── Navbar.jsx         # 导航:active 态用 useLocation 推断
    │   ├── WorkCard.jsx       # 单张作品卡(slug 缺失返回 null 防御)
    │   ├── ScrollToTop.jsx    # 路由切换自动滚回顶部
    │   └── Seo.jsx            # 路由级 <title>/<meta> 封装(React 19 原生 hoist)
    ├── data/
    │   └── works-index.js     # 作品索引(slug/title/img/alt),静态 import
    ├── works/
    │   ├── nybs.mdx           # 9 个作品内容 + `export const meta = {...}`
    │   ├── wilderness-rescue.mdx
    │   ├── orb-starseeker.mdx
    │   ├── form-of-vertebra.mdx
    │   ├── comfypad.mdx
    │   ├── cellphone-info.mdx
    │   ├── italian-cookbook.mdx
    │   ├── sonder.mdx
    │   └── plagiarism.mdx
    ├── pages/
    │   ├── HomePage.jsx       # import worksIndex → 渲染卡片网格
    │   ├── AboutPage.jsx      # 静态 About 内容(待 Phase 5 数据化)
    │   ├── WorkDetailPage.jsx # import.meta.glob 找 MDX → 渲染 meta + body
    │   └── NotFoundPage.jsx   # 404 页
    ├── styles/
    │   └── tailwind.css       # Tailwind v4 CSS-first 入口:@import "tailwindcss" + @theme token + base/utilities
    └── *.css                  # 按职责拆分的全局样式表(见下)
```

CSS 按职责拆分,全部通过 `main.jsx`(tailwind.css) 与 `App.jsx`(其余) import:

| 文件 | 职责 |
|---|---|
| `styles/tailwind.css` | **Tailwind v4 入口**:`@import "tailwindcss"` + `@theme` token 镜像 + `@layer base`(box-sizing、a{text-decoration:none}) + `@layer utilities`(button:focus-visible、.sr-only) |
| `styleguide.css` | **设计 token**:颜色/字体/字号/side-padding/card-ratio/gap-after-nav/work-section-gap |
| `shared.css` | `.home / .about / .work` 根容器 + `.navigation` navbar 样式(含响应式对齐) |
| `index.css` | Home `.works` 网格 + `.sector-item` 卡片样式 |
| `about.css` | About 页样式(以 `.about` 为作用域前缀) |
| `works.css` | Work detail 页通用容器/标题/图文样式 + 三层亲密性梯度(unit/header/gallery) |
| `modal.css` | 图片灯箱(待 Phase 5 启用) |
| `NYBS.css` | NYBS 项目专用 overrides(已迁完) |

---

## 设计系统

### 颜色 token(`styleguide.css`)

| 变量 | 值 | 用途 |
|---|---|---|
| `--color-primitives-brand-900` | `rgba(30,30,30,1)` | 强调(导航 active、标题) |
| `--color-primitives-brand-800` | `rgba(44,44,44,1)` | 正文标题 |
| `--color-primitives-brand-500` | `rgba(117,117,117,1)` | 导航非 active |
| `--color-primitives-brand-400` | `rgba(179,179,179,1)` | 暗色模式次级文本 |
| `--color-primitives-brand-100` | `rgba(245,245,245,1)` | 暗色模式正文 |
| `--color-primitives-white-1000` | `#fff` | 亮色模式背景 |

主题切换:在任意 DOM 节点加 `data-color-mode="SDS-light"` 或 `"SDS-dark"` 即可,token 会自动重映射(已内置两套)。

### 字体

- **Inter** — 标题与正文(`--heading-font-family` / `--single-line-body-base-font-family`)
- **Roboto Mono** — 代码风、subtitle、title-page(`--body-code-font-family` / `--Subheading-font-family` / `--title-page-font-family`)
- 可变字重 `100–700`,通过 `@font-face` 加载,均已加 `font-display: swap`(避免 FOIT)
- 字体文件位于 `app/public/fonts/`,build 时 Vite 直接拷贝到 dist 根

### 字号流体化(`clamp()`)

为避免断点处 cliff 跳变,几个核心字号用 `clamp(min, preferred, max)` 在视口区间内连续变化:

| 变量 | 表达式 | 大屏(≥1200px) | 768px | 320px |
|---|---|---|---|---|
| `--heading-font-size` | `clamp(14px, 0.6rem + 0.9vw, 24px)` | 24px | ~16.5px | 14px |
| `--title-page-font-size` | `clamp(28px, 1.5rem + 2vw, 48px)` | 48px | ~32.8px | 28px |
| `--Subheading-font-size` | `clamp(16px, 0.8rem + 0.6vw, 20px)` | 20px | ~17.4px | 16px |

移动端专用字号 token(`--fs-h1/h2/sub/body/nav`)用于 Work detail 页等强结构化排版,仍是断点式(768/490/390 三档),保留设计节奏。

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

**单变量原则**:`.navigation`(navbar) 与 `.home .works`(卡片网格) 都用 `var(--side-padding)`,谁都不另叠 padding,所以无论视口宽到哪一档,首卡左缘永远与 `likai.wang` logo 左缘对齐,末卡右缘永远与 `RESUME` 右缘对齐。

### 2. 华夫饼网格(Home 卡片)

`.home .works` 用 CSS Grid 布死列数,`aspect-ratio` 锁卡片比例:

```css
.home .works {
  display: grid;
  grid-template-columns: repeat(4, 1fr);   /* 默认 4 列 */
  gap: 10px 20px;                           /* 行 10 / 列 20 */
  padding: 0 var(--side-padding);
  max-width: 1720px;
  margin: 0 auto;
}
@media (max-width:1310px){ .home .works{ grid-template-columns:repeat(3,1fr); } }
@media (max-width:900px) { .home .works{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:490px) { .home .works{ grid-template-columns:repeat(1,1fr); } }
```

| 视口 | 列数 |
|---|---|
| >1310px | 4 |
| ≤1310 | 3 |
| ≤900 | 2 |
| ≤490 | 1 |

卡片比例抽出为 `--card-ratio: 390 / 250`,便于未来 Work detail 页换 16/9 等不同比例。

### 3. Navbar active 态

`Navbar.jsx` 用 `useLocation` 推断 active tab,加 `active` class:
- 路径 `/` 或 `/work/*` → `WORK` active
- 路径 `/about` → `ABOUT` active
- `RESUME` 是外链 PDF,没有 active 态

CSS 上 `.nav-item.active a` 与 `:hover a` 共用同一组强调样式(变深 + 加粗)。

### 4. 路由根容器

`App.jsx` 根据 `useLocation().pathname` 切换根容器 class:
- `/` → **`home`**(HomePage) — 命中 `index.css` 的 `.home .xxx` 作用域
- `/about` → **`about`**(AboutPage) — 命中 `about.css` 的 `.about .xxx` 作用域
- `/work/*` → **`work`**(WorkDetailPage) — 不命中以上两者,避免 `.home .sector-item { aspect-ratio }` 误裁等污染
- 其它 → `home`(NotFoundPage 共用 home 容器无副作用)

三个 class 在 `shared.css` 里共用同一 flex column layout(首页 hero / about 内容 / work 详情都用根容器 + `--gap-after-nav`)。

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
- 在文件顶部 `import '../works.css'` 与该作品专用 CSS(如 `'../NYBS.css'`)
- feature 段用 `.feature-unit` 包父(见下文「三层亲密性梯度」)
- self-identity 的描述在 `WorkDetailPage.jsx` 里用 `.work-description` 类,MDX 里用的 `.description` 仅承载 feature 段正文,两者**不要混用**
- 灯箱按钮(`+ Enlarge`)**已删除占位代码**,Phase 5 实现灯箱时再统一加 mdx 内的按钮 markup 与对应 CSS

---

## 三层亲密性梯度(Proximity Principle)

作品详情页的 visual unit 用三层嵌套 + 三档 gap 表达"亲密性"。核心思想来自格式塔 Proximity Principle —— 物理间距越近,读者越倾向于把它们读作同一组。

### 结构

```
.container (gap 24px)                     ← 第 3 层:unit ↔ unit,独立分界
├── self-identity                         (顶部框架,无 unit 包裹)
├── section-img / section-2img            (纯图段,无 title,作为独立 unit)
└── .feature-unit (gap 16px)              ← 第 2 层:header ↔ gallery,同 unit
    ├── .feature-header (gap 8px)         ← 第 1 层:title ↔ description,最亲密
    │   ├── .feature > .featuretitle
    │   └── .description
    └── .feature-gallery
        └── .section-2img / .section-img
```

### 三档 gap

| 层级 | 元素 | gap | 含义 |
|---|---|---|---|
| **1 最紧** | featuretitle ↔ description | **8px** | 同一 header 内,标题与正文紧贴 |
| **2 较紧** | feature-header ↔ feature-gallery | **16px** | 同 unit 内,图文段紧接 header |
| **3 较松** | unit ↔ unit | **24px**(`--work-section-gap`) | 不同 unit 独立区分 |

### 响应式行为

- **>1310**:feature-header 横排(`justify-content: space-between`),title 左 / description 右
- **≤1310**:feature-header 与 self-identity 都转纵排(title 上 / description 下 / gallery 再下),纵向 gap 维持三层分级
- **≤900**:section-2img 内双图转纵排
- **≤768**:`--work-section-gap` 从 24 降到 16,小屏更紧凑

### 写新 MDX 时的模板

```jsx
<div className="feature-unit">
  <div className="feature-header">
    <div className="feature">
      <b className="featuretitle">小标题</b>
    </div>
    <div className="description">
      <p className="description">短描述</p>
    </div>
  </div>
  <div className="feature-gallery">
    <div className="section-2img">
      <div className="sector-item">…图1</div>
      <div className="sector-item">…图2</div>
    </div>
  </div>
</div>
```

无 title 的纯图段就直接用 `<div className="section-img">…</div>` 或 `<div className="section-2img">…</div>` 不包裹 feature-unit,作为独立 unit 出现,与其它 unit 间靠 `.container` 的 24px gap 区分。

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

`.github/workflows/deploy.yml`:推送到 `main` 分支触发:
1. `pnpm install` + `pnpm build`(工作目录 `./app`)
2. `peaceiris/actions-gh-pages@v4` 把 `app/dist` 推到 `gh-pages` 分支

⚠️ 待办(Phase 6):CI 升 pnpm 版本(去掉固定 v8)、加 pnpm store 缓存、`pnpm lint && pnpm build` 双重门禁。

---

## 后续 Roadmap

| Phase | 目标 | 状态 |
|---|---|---|
| 1 | react-router 引入、Navbar 组件化、数据 schema 修正、CSS 性能/流体化改造 | ✅ |
| 2 | `404.html` SPA fallback + ScrollToTop + NotFoundPage + 路由级 SEO | ✅ |
| 3 | MDX v3 接入 → 9 个作品内容按 `src/works/<slug>.mdx` 全部迁完 | ✅ |
| 4 | Tailwind v4 CSS-first 启用 + `@font-face font-display: swap` + App.css/globals.css 删除 + rootClass 三分 + 三层亲密性梯度架构 + 死代码清理 | ✅ |
| 5 | 图片优化(webp -89% 体积、picture 多源、CLS 防护)+ 灯箱重建(ModalProvider + WorkImgContainer + LightboxGallery + dots + 长图识别 + 键盘 ← → ESC + 切图无闪烁)+ a11y(focus-visible / ARIA / reduced-motion) | ✅ |
| 4b | 把 `works.css` / `about.css` / `index.css` / `shared.css` 等全局 className 逐步迁成 Tailwind utility,最终下沉到组件内联 className 或删除文件 | ⚪ 细节 |
| 5b | 灯箱长图交互:鼠标 hover 跟随 + pan/zoom 数学交互(目前 modal 已识别长图但只加 cursor-zoom-in + 浮动提示) | ⚪ 后续 |
| 6 | CI 升级(pnpm 版本 + 缓存 + lint 门禁)、最小冒烟测试 | ⚪ |

---

## 设计原则备忘(给未来的我)

1. **单变量对齐**:横向 padding 永远走 `--side-padding`,别让任何容器另叠 padding,对齐会错位。
2. **流体优先**:能用 `clamp()` 平滑过渡的属性(字号、纵向 padding、高度)优先流体化;只有与"离散节奏"强耦合的属性(列数切换、uppercase 开关)才用断点。
3. **作用域前缀**:`.home .xxx` / `.about .xxx` / **`.work .xxx`** 这种前缀写法靠根容器 className 切换生效,新页加新前缀,别互相污染.
4. **CSS 顺序敏感**:多个全局 CSS 同特异性时后 import 赢。新增 token 改 `styleguide.css`,新增组件改对应文件,别在 `App.css` 加东西(那剩 Vite 模板残留)。
5. **slug 一致**:`works-data.json` 的 `slug` 必须与路由 `:slug` 一一对应,WorkCard 有 `if (!work.slug) return null` 防御但别依赖它。
6. **页面根 class 必须与页面语义对应**(踩过的坑):  
   `App.jsx` 的 `rootClass` 按 `location.pathname` 分发 —— `/about` → `.about`、`/work/*` → **`.work`**、其它 → `.home`。  
   ⚠️ **曾经 bug**:一度把 `/work/*` 也设成 `.home`,导致 `index.css` 里的 `.home .sector-item { aspect-ratio: 390/250 }` 误命中 work detail 的图片容器,造成 sector-item 高度被裁成宽 ÷ (250/390) = 1038px,而内部 work-img-container 按图片原生 16:9 自撑 ~911px,差 127px 全是空白。新增任何 page 时,务必在 App.jsx 给它**独立的 rootClass**,否则 index.css / about.css 等可能意外污染。
7. **`object-fit` + `width:100%` + `height:auto` 不要混用**:`object-fit: contain` 在 width 已撑满、height 已 auto 的情况下无意义,反而误导渲染。只有"容器尺寸固定,图片需裁剪填满"时才用 `object-fit`,否则让图自然按比例撑更稳。
8. **flex 容器 `align-items` 默认 stretch**:并列子项高度不一致时,矮项会被拉到与高项等高,周围出现空白。两图并列(`.section-2img`)必须显式 `align-items: flex-start`,图片容器别同高才不空白。
9. **单变量 padding 必须笼罩全站所有页面**(踩过的坑):about.css 早期 hardcode 了 `padding: 0 50/40/30/20` + 4 个 media query override,与全局 `--side-padding` 系统并存且漏 ≤390 段对齐。新增任何页或容器,横向 padding 一律走 `var(--side-padding)`,**不复制 hardcode 副本**,否则不同页对齐会跨断点漂移。
10. **`.feature-unit` 是视觉单元的最小包裹**(架构原则):每个有标题的图文段必须包进 `.feature-unit`,header 与 gallery 之间用 unit gap 16px 表达"同 unit 归属感",unit 与 unit 之间用 container gap 24px 表达"独立分界"。无 title 的纯图段直接作独立 unit,不包 unit 包父。详见上文「三层亲密性梯度」。
11. **CSS 不要保留"迟早要用"的占位代码**:Phase 4 保留 `.enlarge-btn` 占位 18 行,Phase 4 收尾审计直接删掉。Phase 5 真做灯箱时按当时语义新建 markup + CSS,不期待"占位"还合用——避免 stale placeholder 误导后续维护。

---

## 作品详情页 Typography 设计语言

参考 IBM 2x Design System 的比例思路,用项目**自己的字族与色板**实现了一套五级 typography 层级体系。核心原则:**字号分层做骨骼,字重分层做骨骼,颜色分层做态度**——三重信号互不替代。

### 五级层级体系

| Level | 类名 | 字族 | 字重 | 字号(clamp) | 颜色 | 视觉角色 |
|---|---|---|---|---|---|---|
| **L1** | `.title`(worktitle) | Roboto Mono | 700 | clamp(28–48) | brand-900 `#1e1e1e` | 作品"标牌",display 级,负荷最重 |
| **L2** | `.worksubtitle` | Roboto Mono | 400 | clamp(16–20) | brand-500 `#757575` | 作品副标题,退后一档,与 L1 形成 Mono 内的大小对比 |
| **L3** | `.work-description`(顶部) | Inter | 600 | clamp(14–24) | brand-800 `#2c2c2c` | 顶部框架的"短描述",立住,与下方 feature 视觉同档 |
| **L3** | `.featuretitle` | Inter | 400 | clamp(14–24) | brand-800 `#2c2c2c` | feature 段小标题,**与 L3 work-description 同档**:同字号区间、同颜色,字重轻一档做退后 |
| **L4** | `.description` (feature 段) | Inter | 600 | clamp(14–24) | brand-500 `#757575` | feature 段正文,"阅读性优先"——弱色 + 600 semi-bold 的组合 |

### 核心设计决策

#### 决策 1:字族切换是分级信号

- **顶部框架**(worktitle / worksubtitle)用 **Roboto Mono** — 给作品"标牌"感,与正文不同字族即视觉分层
- **正文层级**(featuretitle / description)用 **Inter** — 更易读

> 不靠颜色就能让读者**第一眼**分辨"这是作品标题区"还是"这是段内正文":字族本就不是同一种语言。

#### 决策 2:featuretitle 与 work-description 近似同档

- 两者同字族(Inter)、同字号区间(clamp 14–24)、同颜色(brand-800)
- **差异在字重**:work-description 600(立住), featuretitle 400(退后)
- 不让 featuretitle 比顶部 workdescription 大(它不是"更大的子标题",它是"段内标题")
- 不让 featuretitle 比顶部 workdescription 小(它不是 caption,它要承起一段图组)

#### 决策 3:feature 段内 title 与 description 的平衡术(reverse 字重-颜色配对)

这是本设计语言的核心特征。常规做法是"标题深+加粗,正文浅+常规",这里**反向**:

| 元素 | 字重 | 颜色 | 解释 |
|---|---|---|---|
| `.featuretitle`(标题) | 400(轻) | brand-800 深 | 标题不必抢眼,深色已够"标牌"分量 |
| `.description`(正文) | 600(semi-bold) | brand-500 浅 | 正文要**阅读性**:弱色易"看进眼",但弱色易飘,所以用 semi-bold 压住,色与字重互补平衡 |

**为何这样反向配对**:
- 标题靠字号已分层,字重轻 + 深色正好"立住但不夺眼",让 featuretitle 不与顶部 worktitle 争夺视觉焦点
- 正文需要被读,轻灰可以让人沉浸入内容,但轻灰在常规字重下会"飘";用 600 把每个字母"立"起来,既不抢色也不夺字重
- 段视觉的两端(标题深沉 vs 正文浅重)在视觉重量上闭合

色板严格控制在黑/灰系内,不引入第三色,与"设计师作品集"的沉稳调性相称。

#### 决策 4:clamp 让所有层级在视口宽度内连续变化

- 不用断点 `--heading-font-size: 24px` → `--fs-h2: 20px` 的跳变,改 `clamp(min, preferred, max)` 让每个 Level 在大屏(1200px+)从 max 起、在小屏与 768 及以下以 min 钳住
- 768 以下已存在的 `--fs-h1/h2/body` 等 token 仍是断点式,维持移动端设计节奏感
- 不要让五级在 768 以下重新洗牌,各自 clamp 在 min 就位即可,继续维持相对关系

#### 决策 5:类型语义类名 `.description` vs `.work-description`

- 早期 `.description` 被两处共用,改 feature 描述样式就牵动顶部框架
- 拆分后 `.work-description` 单独承载顶部框架第三级,`.description` 单独承载 feature 段正文
- 写新作品 MDX 时,**`<div className="description">` 只用在 feature-container 内**,self-identity 内的描述已在 `WorkDetailPage.jsx` 用 `.work-description`,无需在 MDX 里再写