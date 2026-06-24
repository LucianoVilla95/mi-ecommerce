import { CartItem, GetCart, Details } from './types';

export const mergeCart = async (items: CartItem[]): Promise<{message: string}> => {
  const response = await fetch('http://localhost:3001/orders/merge/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ items }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al sincronizar el carrito');
  }

  return data;
};

export const getCart = async (): Promise<GetCart<Details>> => {
  const response = await fetch('http://localhost:3001/orders', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener el carrito');
  }

  return data;
};

export const postCart = async (item: CartItem): Promise<{message: string}> => {
  const response = await fetch('http://localhost:3001/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ ...item }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al agregar el producto');
  }

  return data;
};

export const removeCart = async (item: CartItem): Promise<{message: string}> => {
  const response = await fetch(`http://localhost:3001/orders/${item.productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ quantity: item.quantity }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al disminuir la cantidad');
  }

  return data;
};

export const deleteCart = async (id: string): Promise<{message: string}> => {
  const response = await fetch(`http://localhost:3001/orders/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al borrar el producto');
  }

  return data;
};