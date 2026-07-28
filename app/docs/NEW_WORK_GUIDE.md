# 加新 Work 操作手册

下面 8 步即可新增一个作品。预计耗时:文件准备 5 分钟 + 写 MDX 10–30 分钟(取决于图段数量)+ 验证 5 分钟。

---

## 0. 预备:slug 与图源

- **slug**:`kebab-case`,全小写 + 连字符,如 `my-new-project`。这个 slug 会同时出现在:
  - 文件名 `src/works/my-new-project.mdx`
  - `src/data/works-index.js` 的 `slug` 字段
  - 浏览器 URL `/work/my-new-project`
  - `app/public/sitemap.xml` 的一个 `<loc>` 节点
- 把所有详情图素材放进 `app/public/img/<Project Title>/`(目录名允许大小写与空格,如 `My Project/`),PNG 即可,后续 build 时不需要手动转 webp —— 代码里 `WorkImgContainer` 会自动从 `.png` 推断同名 `.webp`。
- 但 `.webp` 文件本身需要存在,否则 `<source srcSet="...">` 加载会 404。简化做法:跑一遍批量转换:
  ```powershell
  # 在 app/public/img/<Project>/ 目录里,把所有 PNG 批量转 webp
  Get-ChildItem "*.png" | ForEach-Object {
    $out = $_.BaseName + ".webp"
   magick convert "$($_.Name)" -resize "1920x1920>" -quality 82 -define webp:method=6 "$out"
  }
  ```
  > 命令需要 ImageMagick `magick` 已装。其他替代:`cwebp`(Google 官方 webp 编码器)、XnConvert(GUI)。
- GIF 动图可以保留 `.gif` 扩展直接放进目录(无需转 webp,代码对非 PNG 不处理)。

---

## 1. 把图素材拷到 public 目录

```powershell
# 假设项目名叫 "New Project"
mkdir "app/public/img/New Project"
# 把所有详情图(PNG / 已转好的 webp / GIF)拷进去
Copy-Item ".\*.png" "app/public/img/New Project\"
Copy-Item ".\*.webp" "app/public/img/New Project\"
Copy-Item ".\*.gif" "app/public/img/New Project\"   # 如果有
```

首页卡片封面放:`app/public/img/home/<slug>-img.png`(命名规则与 `works-index` 的 `img` 字段一致),并生成对应 `<slug>-img.webp`。

---

## 2. 创建 MDX 文件

新建 `app/src/works/<slug>.mdx`。最小骨架:

```jsx
import WorkImgContainer from '../components/WorkImgContainer';
import {
  sectionImgCls,
  section2imgCls,
  section2imgItemCls,
  featureUnitCls,
  featureHeaderCls,
  featureCls,
  featuretitleCls,
  descriptionCls,
  featureGalleryCls,
} from '../styles/markup';

export const meta = {
  title: 'My New Project',              // 必填:L1 主标题
  subtitle: '海报设计,品牌',           // 选填:L2 副标
  description: '一句话描述本作品。',     // 选填:L3 顶部框架短描述
  tags: ['Poster', 'Brand'],            // 选填:标签数组(目前不显示,留作 schema)
};

<!-- 顶部首图:全宽占满 -->
<div className={sectionImgCls}>
  <WorkImgContainer src="/img/New Project/Cover.png" alt="Cover image" />
</div>

<!-- 一个 feature 段:带标题 + 描述 + 双图 -->
<div className={featureUnitCls}>
  <div className={featureHeaderCls}>
    <div className={featureCls}>
      <b className={featuretitleCls}>背景研究:<br />问题的边界在哪里</b>
    </div>
    <div className={descriptionCls}>
      <p className={descriptionCls}>简述这一段的内容,2-3 句话即可。</p>
    </div>
  </div>
  <div className={featureGalleryCls}>
    <div className={section2imgCls}>
      <div className={section2imgItemCls}>
        <WorkImgContainer src="/img/New Project/Research 1.png" alt="Research phase 1" />
      </div>
      <div className={section2imgItemCls}>
        <WorkImgContainer src="/img/New Project/Research 2.png" alt="Research phase 2" />
      </div>
    </div>
  </div>
</div>

<!-- 一个纯图段:无标题,直接作独立 unit -->
<div className={sectionImgCls}>
  <WorkImgContainer src="/img/New Project/Final.png" alt="Final outcome" />
</div>
```

### 如果有 YouTube 视频

参考 `comfypad.mdx` / `form-of-vertebra.mdx` 底部用 `<iframe className={iframePosterCls}>`:

```jsx
import { iframeContainerCls, iframePosterCls } from '../styles/markup';

<div className={sectionImgCls}>
  <div className={iframeContainerCls}>
    <iframe
      className={iframePosterCls}
      loading="lazy"
      src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
      title="Video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
</div>
```

### 如果需要 NYBS 风格的三图布局(1 大图 + 1 右侧两图垂直叠)

参考 `nybs.mdx` 与 `markup.js` 里的 `section3imgCls` / `leftSectorItemCls` / `rightSectorItemCls`。

---

## 3. 在 `src/data/works-index.js` 加索引

```js
export const worksIndex = [
  // ... 其它已有项
  { slug: 'my-new-project', title: 'My New Project', img: '/img/home/my-new-project-img.png', alt: 'My New Project Image' },
];
```

字段语义:
- `slug` — 必须与 MDX 文件名完全一致
- `title` —Home 卡片标题,通常与 MDX `meta.title` 同
- `img` — Home 卡片封面 PNG 路径(对应 `app/public/img/home/<slug>-img.png`,该文件必须存在 + 对应 `.webp` 也存在)
- `alt` — 无障碍说明文字

---

## 4. 在 `app/public/sitemap.xml` 加一行

```xml
<url><loc>https://peterwzrlk18.github.io/work/my-new-project</loc><priority>0.7</priority><changefreq>yearly</changefreq></url>
```

放在 `</urlset>` 之前即可。`priority` 取 `0.7`(work 详情页标准值)。

---

## 5. 本地验证

```powershell
cd app
pnpm dev
```

浏览器开 `http://localhost:5173/`:
- Home 底部应多一张卡片
- 点进去确认 URL 是 `/work/my-new-project`
- 检查:
  - 标题 / 副标题 / 描述显示在顶部框架
  - 所有图正常加载(包括 hover 显示 cursor pointer + 点击弹灯箱)
  - 双图段在 desktop 横排、在 ≤900px 纵排
  - 长图(h / w > 2)点击进灯箱后会显示"hover to inspect"提示,且支持 hover-follow / click-zoom

如果某张图 staging 路径写错,DevTools Console 会有 404。**确认 webp 文件存在**(`.webp` 与 `.png` 同名同目录)。

---

## 6. Lint + Test + Build

```powershell
pnpm lint       # ESLint
pnpm test       # 3 smoke tests 仍要全通过
pnpm build      # 出 dist/
```

确认无新增 lint error、3 test 全通过、`dist/index.html` 与 `dist/assets/index-*.js` 体积持平或仅小幅增长(每张图加几十 KB JS)。

---

## 7. Commit + Push(自动触发部署)

```powershell
git add -A
git commit -m "feat: add New Project work page"
git push
```

GitHub Actions 会跑 lint → test → build → deploy 到 `gh-pages`。1–2 分钟后 Actions 标签页看到绿勾即上线。

**因为 GitHub Pages CDN 对 HTML 缓存 10 分钟(`max-age=600`),首次访问需要 Ctrl+Shift+R 强刷一次拉新 JS bundle。**

---

## 8. 部署后验证清单

- [ ] `https://peterwzrlk18.github.io/` Home 多一张卡
- [ ] `https://peterwzrlk18.github.io/work/my-new-project` 详情页全图全宽对齐左右边
- [ ] 任意图点击进灯箱 + ECS 关 + ← → 翻 + 长图 hover-follow
- [ ] `https://peterwzrlk18.github.io/sitemap.xml` 多一行
- [ ] F12 看 `<title>` 是 "My New Project - Likai Wang"
- [ ] F12 看 `og:image` 是 absolute URL(https://... 开头)
- [ ] (可选)在 `https://opengraph.xyz/` 粘贴详情页 URL 看分享卡预览

---

## 参考文件

- **`src/styles/markup.js`** — 11 个 class 常量,所有 9 个作品都从这取;新增 work 不需要往里面加常量,直接复用现有
- **`src/components/WorkImgContainer.jsx`** — 万能图容器,自动处理 webp source / 注册灯箱 / 焦点环 / key.onKeyDown
- **`src/components/Modal.jsx`** — 灯箱系统:5b 加的 pan-zoom / hover-follow 全在这里,新 work 不需要碰
- **`README.md` § 三层亲密性梯度** — unit / header / gallery 三层嵌套的设计准则,决定 `<div className={featureUnitCls}>` 何时使用
- **`nybs.mdx` / `wilderness-rescue.mdx`** — 两份完整模板,任何新 work 直接参考它们的结构