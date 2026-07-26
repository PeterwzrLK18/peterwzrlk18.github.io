// React 19 原生支持在组件中渲染 <title> / <meta> / <link>,
// 会自动 hoist 到 <head>,无需第三方库。
// 每个 Page 顶部放一个 <Seo ... /> 即可设置该路由的元信息。

function Seo({ title, description, image, type = 'website' }) {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
    </>
  );
}

export default Seo;