export interface UICartState {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setIsOpen: (open: boolean) => void;
}

export interface CartItem {
  productId: string;
  orderDetailId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description: string;
  isAuthenticated?: boolean;
  stock?: number;
}

export interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}