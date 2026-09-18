/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import CartHeader from './CartHeader'; // Ajustá la ruta si es necesario

// 1. Declaración de espías globales para interceptar el Store y el Hook
const mockUseCartStore = jest.fn();
const mockUseCart = jest.fn();

// 2. Mock de las dependencias externas vinculadas a nuestros espías
jest.mock('@/stores/cart.store', () => ({
  useCartStore: (selector: any) => mockUseCartStore(selector),
}));

jest.mock('@/hooks/use-cart', () => ({
  useCart: (isAuthenticated: boolean) => mockUseCart(isAuthenticated),
}));

describe('CartHeader Component', () => {
  // Función mock fija para simular el método totalItems() de Zustand
  const mockTotalItemsFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Configuración base por defecto (Carrito de base de datos vacío)
    mockUseCart.mockReturnValue({ data: { details: [] } });

    // Implementación base para Zustand: resuelve el selector dándole la función espía
    mockUseCartStore.mockImplementation((selector: any) =>
      selector({
        totalItems: mockTotalItemsFn,
      })
    );
  });

  it('should render the static header title correctly', () => {
    mockTotalItemsFn.mockReturnValue(0);
    render(<CartHeader isAuthenticated={false} />);

    expect(screen.getByText('Tu carrito')).toBeInTheDocument();
  });

  it('should display the quantity from Zustand store when user is NOT authenticated', () => {
    // Simulamos que el método totalItems() de Zustand devuelve 5 productos en local
    mockTotalItemsFn.mockReturnValue(5);

    render(<CartHeader isAuthenticated={false} />);

    // Verificamos que el componente use el valor de Zustand e imprima el texto correcto
    expect(screen.getByText('5 productos')).toBeInTheDocument();
    expect(mockTotalItemsFn).toHaveBeenCalled();
  });

  it('should calculate and display the total quantity from database when user IS authenticated', () => {
    // Simulamos que el hook useCart nos devuelve productos en la base de datos con distintas cantidades
    mockUseCart.mockReturnValue({
      data: {
        details: [
          { quantity: 2 },
          { quantity: 3 },
          { quantity: 1 },
        ],
      },
    });

    render(<CartHeader isAuthenticated={true} />);

    // El reduce del componente debería sumar (2 + 3 + 1) = 6 productos
    expect(screen.getByText('6 productos')).toBeInTheDocument();
  });

  it('should default to 0 products if the database cart data is missing or undefined', () => {
    // Simulamos una respuesta vacía o con fallos de la API de la DB
    mockUseCart.mockReturnValue({ data: undefined });

    render(<CartHeader isAuthenticated={true} />);

    expect(screen.getByText('0 productos')).toBeInTheDocument();
  });
});
