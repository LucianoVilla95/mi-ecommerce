/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItem from './CartItem';
import { CartItem as CartItemType } from '../../stores/types';

// 1. Espías globales para Zustand y React Query
const mockIncreaseQuantity = jest.fn();
const mockDecreaseQuantity = jest.fn();
const mockRemoveItem = jest.fn();

const mockAddToCartMutate = jest.fn();
const mockDecreaseCartMutate = jest.fn();
const mockRemoveCartMutate = jest.fn();

// 2. Mocks de las dependencias externas vinculadas a los espías
jest.mock('@/stores/cart.store', () => ({
  useCartStore: (selector: any) =>
    selector({
      increaseQuantity: mockIncreaseQuantity,
      decreaseQuantity: mockDecreaseQuantity,
      removeItem: mockRemoveItem,
    }),
}));

jest.mock('@/hooks/use-add-to-cart', () => ({
  useAddToCart: () => ({ mutate: mockAddToCartMutate }),
}));

jest.mock('@/hooks/use-reomve-to-cart', () => ({
  useDecreaseCart: () => ({ mutate: mockDecreaseCartMutate }),
}));

jest.mock('@/hooks/use-delete-to-cart', () => ({
  useRemoveCart: () => ({ mutate: mockRemoveCartMutate }),
}));

// Mock de Next Image para evitar problemas con la optimización en tests
jest.mock('next/image', () => {
  return function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="cart-item-image" />;
  };
});

describe('CartItem Component (Client Component)', () => {
  const defaultProps: CartItemType = {
    productId: 'prod-abc',
    orderDetailId: 'detail-789',
    name: 'Auriculares Bluetooth',
    price: 4500,
    image: 'https://cloudinary.com',
    quantity: 2,
    description: 'Sonido High Definition',
    stock: 5,
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product details correctly and apply background removal to the image', () => {
    render(<CartItem {...defaultProps} />);

    expect(screen.getByText('Auriculares Bluetooth')).toBeInTheDocument();
    expect(screen.getByText('Sonido High Definition')).toBeInTheDocument();
    expect(screen.getByText('Stock: 5')).toBeInTheDocument();
    expect(screen.getByText('4500')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Cantidad actual

    const img = screen.getByTestId('cart-item-image');
    expect(img).toHaveAttribute(
      'src',
      'https://cloudinary.com'
    );
  });

  it('should call local store actions when modifying quantities and user is NOT authenticated', async () => {
    render(<CartItem {...defaultProps} isAuthenticated={false} />);

    // Click en incrementar (+)
    const plusButton = screen.getByRole('button', { name: '+' });
    await userEvent.click(plusButton);
    expect(mockIncreaseQuantity).toHaveBeenCalledWith('prod-abc');

    // Click en decrementar (-)
    const minusButton = screen.getByRole('button', { name: '-' });
    await userEvent.click(minusButton);
    expect(mockDecreaseQuantity).toHaveBeenCalledWith('prod-abc');

    // Click en remover (Tacho de basura)
    const removeButton = screen.getAllByRole('button')[2]; // El tercer botón del bloque es el tacho
    await userEvent.click(removeButton);
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-abc');
  });

  it('should call server mutators when modifying quantities and user IS authenticated', async () => {
    render(<CartItem {...defaultProps} isAuthenticated={true} />);

    // Click en incrementar (+) -> Debería disparar la mutación con cantidad 1
    const plusButton = screen.getByRole('button', { name: '+' });
    await userEvent.click(plusButton);
    expect(mockAddToCartMutate).toHaveBeenCalledWith(
      { productId: 'prod-abc', quantity: 1 },
      expect.any(Object)
    );

    // Click en decrementar (-) -> Debería disparar la mutación de remover enviando el ID y la nueva cantidad (2 - 1 = 1)
    const minusButton = screen.getByRole('button', { name: '-' });
    await userEvent.click(minusButton);
    expect(mockDecreaseCartMutate).toHaveBeenCalledWith({
      productId: 'prod-abc',
      quantity: 1,
    });

    // Click en remover -> Debería llamar a useRemoveCart pasando el orderDetailId
    const removeButton = screen.getAllByRole('button')[2];
    await userEvent.click(removeButton);
    expect(mockRemoveCartMutate).toHaveBeenCalledWith('detail-789');
  });

  it('should disable the plus button and show limit message when quantity reaches stock limit', () => {
    render(<CartItem {...defaultProps} quantity={5} stock={5} />);

    const plusButton = screen.getByRole('button', { name: '+' });
    expect(plusButton).toBeDisabled();
    expect(
      screen.getByText('Has alcanzado el máximo disponible (5)')
    ).toBeInTheDocument();
  });

  it('should display error message when handleAddToCart triggers an onError callback due to low stock', async () => {
    // Interceptamos la llamada para disparar el callback de error que definiste en tu componente
    mockAddToCartMutate.mockImplementationOnce((variables, options) => {
      if (options && options.onError) {
        options.onError({ message: 'No hay más stock en el servidor' });
      }
    });

    render(<CartItem {...defaultProps} isAuthenticated={true} />);

    const plusButton = screen.getByRole('button', { name: '+' });
    await userEvent.click(plusButton);

    // Verificamos que tu componente atrape el mensaje y lo pinte en la tarjeta
    expect(screen.getByText('No hay más stock en el servidor')).toBeInTheDocument();
  });
});
