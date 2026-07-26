import { createContext, useContext } from 'react';

export const ModalContext = createContext({
  open: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}