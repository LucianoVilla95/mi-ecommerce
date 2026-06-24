export interface CartItem {
  productId: string;
  quantity: number;
}

export const queryKeys = {
  cart: ["cart"] as const,
};

export interface GetCart<T> {
  id: string;
  userId: string;
  details: T[];
  total: number;
}

export interface Details {
    id: string;
    product: {
      id: string;
      name: string;
      description: string;
      price: string;
      stock: number;
      imgUrl: string;
      imgPublicId: string;
      slug: string;
      isActive: boolean;
    },
    quantity: number;
    price: string;
}