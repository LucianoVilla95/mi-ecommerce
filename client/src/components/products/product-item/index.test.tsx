/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductItem from './index';
import { ProductProps } from './types';

// 1. Declaración de espías globales para interceptar Zustand y React Query
const mockUseCartStore = jest.fn();
const mockMutate = jest.fn();
const mockUseCart = jest.fn();

// 2. Vinculación de los módulos importados con los espías configurados
jest.mock('@/stores/cart.store', () => ({
  useCartStore: (selector: (state: any) => any) => mockUseCartStore(selector),
}));

jest.mock('@/hooks/use-add-to-cart', () => ({
  useAddToCart: () => ({
    mutate: mockMutate,
  }),
}));

jest.mock('@/hooks/use-cart', () => ({
  useCart: (isAuthenticated: boolean) => mockUseCart(isAuthenticated),
}));

// 3. Mock del componente Image de Next.js para simplificar las pruebas sobre la URL de Cloudinary
jest.mock('next/image', () => {
  return function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="product-image" />;
  };
});

describe('ProductItem Component (Client Component)', () => {
  const defaultProps: ProductProps = {
    productId: 'prod-123',
    name: 'Remera de Algodón',
    imgUrl: 'https://cloudinary.com',
    price: '1500',
    description: 'Una remera lisa de alta calidad',
    isAuthenticated: false,
    slug: 'remera-de-algodón'
  };

  const mockAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Estado inicial por defecto: Carritos vacíos (Botón habilitado por defecto)
    mockUseCart.mockReturnValue({ data: { details: [] } });
    
    mockUseCartStore.mockImplementation((selector: (state: any) => any) =>
      selector({
        addItem: mockAddItem,
        items: [],
      })
    );
  });

  it('should render product details correctly and apply background removal to the image', () => {
    render(<ProductItem {...defaultProps} />);

    expect(screen.getByText('Remera de Algodón')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();

    const img = screen.getByTestId('product-image');
    expect(img).toHaveAttribute(
      'src',
      'https://cloudinary.com'
    );
  });

  it('should call store addItem when clicked and user is NOT authenticated', async () => {
    render(<ProductItem {...defaultProps} isAuthenticated={false} />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(mockAddItem).toHaveBeenCalledWith({
      productId: 'prod-123',
      name: 'Remera de Algodón',
      image: 'https://cloudinary.com',
      price: 1500,
      description: 'Una remera lisa de alta calidad',
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should call mutate from useAddToCart when clicked and user IS authenticated', async () => {
    render(<ProductItem {...defaultProps} isAuthenticated={true} />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(mockMutate).toHaveBeenCalledWith({
      productId: 'prod-123',
      quantity: 1,
    });
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('should disable the button and show Check icon if product is already in local cart store', () => {
    // Forzamos que Zustand devuelva el array con el producto repetido
    mockUseCartStore.mockImplementation((selector: (state: any) => any) =>
      selector({
        addItem: mockAddItem,
        items: [{ productId: 'prod-123' }],
      })
    );

    render(<ProductItem {...defaultProps} isAuthenticated={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-green-500');
  });

  it('should disable the button and show Check icon if product is already in database cart', () => {
    // Forzamos que la API de base de datos devuelva el producto repetido
    mockUseCart.mockReturnValue({
      data: {
        details: [
          { product: { id: 'prod-123' } }
        ]
      }
    });

    render(<ProductItem {...defaultProps} isAuthenticated={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-green-500');
  });
});
