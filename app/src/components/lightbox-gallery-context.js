import { createContext, useContext } from 'react';

export const LightboxGalleryContext = createContext({
  register: () => -1,
  unregister: () => {},
  openAt: () => {},
});

export function useLightboxGallery() {
  return useContext(LightboxGalleryContext);
}