/**
 * 集合当前页所有 <WorkImgContainer> 的图片,
 * 点击某张时调用 ModalContext.open(allImages, clickedIndex)。
 */
import { useCallback, useRef, useState } from 'react';
import { LightboxGalleryContext } from './lightbox-gallery-context';
import { useModal } from './modal-context';

export function LightboxGallery({ children }) {
  const { open } = useModal();
  const registryRef = useRef([]);
  const [, forceRender] = useState(0);

  const register = useCallback((entry) => {
    const idx = registryRef.current.length;
    registryRef.current.push(entry);
    forceRender((n) => n + 1);
    return idx;
  }, []);

  const unregister = useCallback((idx, entry) => {
    const existing = registryRef.current[idx];
    if (existing && existing.src === entry.src) {
      registryRef.current[idx] = null;
    }
  }, []);

  const openAt = useCallback((idx) => {
    const entry = registryRef.current[idx];
    const valid = registryRef.current.filter(Boolean);
    const validIdx = entry ? valid.indexOf(entry) : 0;
    open(valid, validIdx >= 0 ? validIdx : 0);
  }, [open]);

  return (
    <LightboxGalleryContext.Provider value={{ register, unregister, openAt }}>
      {children}
    </LightboxGalleryContext.Provider>
  );
}

export default LightboxGallery;