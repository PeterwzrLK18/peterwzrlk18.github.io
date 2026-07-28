// React 19 原生支持在组件中渲染 <title> / <meta> / <link>,
// 会自动 hoist 到 <head>,无需第三方库。
// 每个 Page 顶部放一个 <Seo ... /> 即可设置该路由的元信息。
//
// Phase D2 修正:
// - og:image / twitter:image 强制 absolute URL(社交平台拒绝相对路径,会导致分享卡无图)
// - 补 og:image:width / height / alt 帮助平台预渲染卡尺寸,避免下载图片探测
import { absoluteUrl } from '../lib/url';

const OG_FALLBACK_IMG = '/img/home/comfypad-img.png';
const OG_FALLBACK_ALT = 'Likai Wang — Portfolio';
const OG_IMG_W = '780';
const OG_IMG_H = '500';

function Seo({ title, description, image, type = 'website' }) {
  const imgUrl = absoluteUrl(image || OG_FALLBACK_IMG);
  const url = absoluteUrl(typeof window !== 'undefined' ? window.location.pathname : '/');

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imgUrl} />
      <meta property="og:image:alt" content={OG_FALLBACK_ALT} />
      <meta property="og:image:width" content={OG_IMG_W} />
      <meta property="og:image:height" content={OG_IMG_H} />
      <meta property="og:site_name" content="Likai Wang — Portfolio" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={imgUrl} />
      <meta name="twitter:image:alt" content={OG_FALLBACK_ALT} />
    </>
  );
}

export default Seo;