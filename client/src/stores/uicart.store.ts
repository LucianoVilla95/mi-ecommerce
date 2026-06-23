import { create } from 'zustand';
import { UICartState } from './types';

export const useUICartStore = create<UICartState>((set) => ({
  isOpen: false,

  openCart: () => set({ isOpen: true }),

  closeCart: () => set({ isOpen: false }),

  setIsOpen: (open) => set({ isOpen: open })
}))