import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 路由切换时滚回顶部。
// 使用 useEffect 在路由变化后触发,避免在渲染过程中操作 DOM。
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;