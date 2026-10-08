/**
 * 集合当前页所有 <WorkImgContainer> 的图片,
 * 点击某张时调用 ModalContext.open(allImages, clickedIndex)。
 */
import { useCallback, useMemo, useRef } from 'react';
import { LightboxGalleryContext } from './lightbox-gallery-context';
import { useModal } from './modal-context';

export function LightboxGallery({ children }) {
  const { open } = useModal();
  const registryRef = useRef([]);

  const register = useCallback((entry) => {
    const idx = registryRef.current.length;
    registryRef.current.push(entry);
    return idx;
  }, []);

  const unregister = useCallback((idx, entry) => {
    const existing = registryRef.current[idx];
    if (existing === entry) {
      registryRef.current[idx] = null;
    }
  }, []);

  const openAt = useCallback((idx) => {
    const entry = registryRef.current[idx];
    const valid = registryRef.current.filter(Boolean);
    const validIdx = entry ? valid.indexOf(entry) : 0;
    open(valid, validIdx >= 0 ? validIdx : 0);
  }, [open]);

  // Registration only updates the registry; it does not affect rendered UI.
  // Keep the context stable so consumers do not re-register on parent renders.
  const gallery = useMemo(() => ({ register, unregister, openAt }), [register, unregister, openAt]);

  return (
    <LightboxGalleryContext.Provider value={gallery}>
      {children}
    </LightboxGalleryContext.Provider>
  );
}

export default LightboxGallery;
