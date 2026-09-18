/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import CartList from './CartList'; // Ajustá la ruta si cambia la mayúscula/minúscula

// 1. Espías globales para controlar Zustand y React Query
const mockUseCartStore = jest.fn();
const mockUseCart = jest.fn();

// 2. Mock de las dependencias externas vinculadas a los espías
jest.mock('@/stores/cart.store', () => ({
  useCartStore: (selector: any) => mockUseCartStore(selector),
}));

jest.mock('@/hooks/use-cart', () => ({
  useCart: (isAuthenticated: boolean) => mockUseCart(isAuthenticated),
}));

// Mock del componente de carga para identificarlo fácil en el DOM
jest.mock('../loading', () => {
  return function MockLoading() {
    return <div data-testid="cart-loading">Cargando carrito...</div>;
  };
});

// Mock de CartItem para aislar el contenedor de su hijo
jest.mock('./CartItem', () => {
  return function MockCartItem({ name, quantity }: { name: string; quantity: number }) {
    return (
      <div data-testid="mock-cart-item">
        <span>{name}</span> - <span>Cantidad: {quantity}</span>
      </div>
    );
  };
});

describe('CartList Component', () => {
  // Datos locales mockeados para Zustand
  const mockLocalItems = [
    { productId: '1', name: 'Zapatillas', price: 5000, image: '/zapas.png', quantity: 1, description: 'Talle 41', stock: 3 },
    { productId: '2', name: 'Remera', price: 2000, image: '/remera.png', quantity: 2, description: 'Color Negro', stock: 5 },
  ];

  // Datos mockeados simulando la estructura que devuelve tu backend
  const mockDatabaseCartData = {
    details: [
      {
        id: 'detail-101',
        quantity: 3,
        product: { id: 'prod-99', name: 'Auriculares DB', price: '4500', imgUrl: '/auri.png', description: 'Wireless', stock: 10 }
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Configuración base por defecto
    mockUseCart.mockReturnValue({ data: undefined, isLoading: false });
    mockUseCartStore.mockImplementation((selector: any) =>
      selector({ items: [] })
    );
  });

  it('should render Loading component when user is authenticated and cart is loading', () => {
    // Forzamos el estado isLoading en True
    mockUseCart.mockReturnValue({ data: undefined, isLoading: true });

    render(<CartList isAuthenticated={true} />);

    expect(screen.getByTestId('cart-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-cart-item')).not.toBeInTheDocument();
  });

  it('should render items from local Zustand store when user is NOT authenticated', () => {
    // Inyectamos productos locales en Zustand
    mockUseCartStore.mockImplementation((selector: any) =>
      selector({ items: mockLocalItems })
    );

    render(<CartList isAuthenticated={false} />);

    // Verificamos que no cargue el componente Loading
    expect(screen.queryByTestId('cart-loading')).not.toBeInTheDocument();

    // Comprobamos que renderice los 2 ítems locales y pasen sus textos correctos al componente mockeado
    const renderedItems = screen.getAllByTestId('mock-cart-item');
    expect(renderedItems).toHaveLength(2);
    expect(screen.getByText('Zapatillas')).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 2')).toBeInTheDocument(); // De la remera
  });

  it('should render items transformed from database response when user IS authenticated', () => {
    // Inyectamos la respuesta exitosa simulada de la base de datos
    mockUseCart.mockReturnValue({ data: mockDatabaseCartData, isLoading: false });

    render(<CartList isAuthenticated={true} />);

    expect(screen.queryByTestId('cart-loading')).not.toBeInTheDocument();

    // Verificamos que haya mapeado correctamente la estructura de backend a la interfaz CartProduct
    const renderedItems = screen.getAllByTestId('mock-cart-item');
    expect(renderedItems).toHaveLength(1);
    expect(screen.getByText('Auriculares DB')).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 3')).toBeInTheDocument();
  });

  it('should render an empty list container when there are no items in local store or database', () => {
    // Ambos carritos vacíos de base gracias al beforeEach
    render(<CartList isAuthenticated={false} />);

    expect(screen.queryByTestId('mock-cart-item')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-loading')).not.toBeInTheDocument();
  });
});
