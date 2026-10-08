# 设计与布局规则

此文档说明当前实现。修改样式时，以 `src/styles/tailwind.css`、`src/styles/markup.js` 和组件代码为准。

## 样式职责

- 全局颜色、字体、间距、断点：`tailwind.css` 的 `@theme` 与响应覆盖。
- 作品布局和文字常量：`markup.js`，供详情页与 MDX 共用。
- 页面局部样式：组件内 Tailwind class。
- 灯箱：`modal.css`，所有选择器使用 modal 前缀。

页面根节点的 `data-page` 仅供诊断，不是 CSS 作用域。不要重新引入旧的 `.home .sector-item` 等跨页规则。

## 字体与文字层级

`font-heading` 指定 Inter、Helvetica、sans-serif；仓库未提供 Inter 字体文件或加载声明，因此不能保证每台设备显示 Inter。`font-mono` 使用仓库内的 Roboto Mono 可变字体，普通与斜体均设置 `font-display: swap`。

| 内容 | 常量 | 字族 / 字重 | 桌面字号范围 | 颜色 |
|---|---|---|---|---|
| 作品标题 | `titleBlockCls` | heading / 700，移动端 800 | 28–48px | brand-900 |
| 作品副标题 | `worksubtitleCls` | mono / 400 | 16–20px | brand-500 |
| 顶部说明 | `workDescriptionTextCls` | heading / 600 | 14–24px | text-brand-default |
| 段内标题 | `featuretitleCls` | heading / 400 | 14–24px | brand-800 |
| 段内说明 | `descriptionTextCls` | heading / 600 | 14–24px | brand-500 |

桌面字号由 clamp 计算，移动端还有断点覆盖。作品标题在 ≤768 / ≤490 / ≤390px 使用 28 / 25 / 23px；正文层级对应 20 / 18 / 17px；副标题在 ≤768px 为 12px。About 正文使用 `--fs-body`。

`descriptionCls` 与 `workDescriptionWrapCls` 仅负责外层布局；对应的 Text 常量负责内层段落。不要把同一套文字样式重复加到外层 div 和内层 p。

## 对齐与断点

所有页面与导航横向内边距统一使用 `--side-padding`。

| 视口宽度 | 横向内边距 | 首页列数 |
|---|---|---|
| >1310px | 50px | 4 |
| ≤1310px | 40px | 3 |
| ≤900px | 30px | 2 |
| ≤768px | 20px | 2 |
| ≤490px | 20px | 1 |
| ≤390px | 16px | 1 |

导航在 ≤500px 改为上下排列。Tailwind 的自定义断点值是 1311、901、769、501、491、391px；`max-*` 实际匹配“小于对应值”，媒体查询中的整数范围按上表理解。

内容最大宽度通常为 1720px。首页卡片使用 `--card-ratio: 390 / 250`；作品详情图片按自身比例显示，不套首页卡片比例。

## 作品图组与间距

`--work-section-gap` 在桌面为 20px，≤900px 为 10px。`--block-gap` 始终是它的两倍。

| 常量 | 用法 |
|---|---|
| `sectionImgCls` | 全宽单图，直接放 WorkImgContainer |
| `section2imgCls` + `section2imgItemCls` | 双图左右各占半槽，≤900px 改纵排；只放一个子项可保留桌面右侧空白 |
| `section3imgCls` + 左右槽 | NYBS 左侧单图、右侧上下两图 |
| `featureUnitCls` | 一个“小标题、说明、图组”，内部间距为 1 倍 |
| `featureHeaderCls` | 段内标题与说明的布局 |
| `featureGalleryCls` | 同一段内的多个图组，间距为 1 倍 |
| `featureBlockGroupCls` | 封面与连续 feature 段的共同容器，内部块间距为 2 倍 |
| `workDetailContainerCls` | 页面外层，标题到封面、独立纯图段之间为 1 倍 |
| `iframeContainerCls` + `iframePosterCls` | 16:9 视频嵌入 |

需要两倍间距时，用共同的 featureBlockGroup 容器表达，不叠加任意 margin 或空 div。双图槽位也可放文字，保留相同宽度规则。

## 视觉检查

检查首页、About、纯图作品、feature 作品和 NYBS 三图布局；至少覆盖桌面、390px 和320px宽度。关注左右对齐、文字换行、图组间距和横向溢出。

灯箱使用原有遮罩、关闭按钮和圆点。触控命中区域可扩大，但无需放大可见圆点；缩放、拖动和切图的实现说明见 [项目说明](../README.md)。
