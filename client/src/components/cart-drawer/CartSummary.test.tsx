/// <reference types="jest" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartSummary from './CartSummary'; // Ajustá la ruta exacta si es necesario

// 1. Espías globales para controlar la navegación y estados de red
const mockPush = jest.fn();
const mockUseCartStore = jest.fn();
const mockUseCart = jest.fn();
const mockFetch = jest.fn() as jest.Mock;
const mockRedirectToExternalUrl = jest.fn(); // Espía limpio para la URL externa

// 2. Vinculación de dependencias con los espías de Jest
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/stores/cart.store', () => ({
  useCartStore: (selector: any) => mockUseCartStore(selector),
}));

jest.mock('@/hooks/use-cart', () => ({
  useCart: (isAuthenticated: boolean) => mockUseCart(isAuthenticated),
}));

// Mockeamos el nuevo servicio utilitario de navegación de forma aislada
jest.mock('@/services/navigation', () => ({
  redirectToExternalUrl: (...args: any[]) => mockRedirectToExternalUrl(...args),
}));

global.fetch = mockFetch;

describe('CartSummary Component (Client Component with Clean Architecture)', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_API_URL = 'http://api.test';

    // Espiamos los logs y alertas para que no ensucien la consola de Jest
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Configuración inicial base para Zustand y useCart
    mockUseCartStore.mockImplementation((selector: any) => selector({ subtotal: () => 1500.00 }));
    mockUseCart.mockReturnValue({ data: { total: 3500.00 } });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('should display the subtotal and total calculated from local Zustand when user is NOT authenticated', () => {
    render(<CartSummary isAuthenticated={false} />);
    
    // CORRECCIÓN: Usamos getAllByText y verificamos que aparezca 2 veces (Subtotal y Total)
    const priceElements = screen.getAllByText('1500.00');
    expect(priceElements).toHaveLength(2);
  });

  it('should display the subtotal and total calculated from database hook when user IS authenticated', () => {
    render(<CartSummary isAuthenticated={true} />);

    // CORRECCIÓN: Usamos getAllByText y verificamos que aparezca 2 veces (Subtotal y Total)
    const priceElements = screen.getAllByText('3500.00');
    expect(priceElements).toHaveLength(2);
  });

  it('should redirect the user to login page when clicking buy button and user is NOT authenticated', async () => {
    render(<CartSummary isAuthenticated={false} />);

    const buyButton = screen.getByRole('button', { name: 'Finalizar Compra' });
    await userEvent.click(buyButton);

    expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should call the redirect service with the exact payment gateway url when checkout succeeds', async () => {
    // Simulamos que la llamada responde un 200 OK con la URL de pago externa
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ url: 'https://gateway.com' }),
    });

    render(<CartSummary isAuthenticated={true} />);

    const buyButton = screen.getByRole('button', { name: 'Finalizar Compra' });
    await userEvent.click(buyButton);

    // Esperamos de forma asíncrona a que se resuelva la llamada a la API y el servicio
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.test/orders/checkout', // <-- Agregale el /orders/checkout acá
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      );
    });

    // Validamos la redirección llamando a tu servicio mockeado sin errores de jsdom
    expect(mockRedirectToExternalUrl).toHaveBeenCalledWith('https://gateway.com');
  });

  it('should trigger a browser alert when the checkout API returns a rejection status', async () => {
    // Simulamos un error controlado del servidor (ej: 400 Bad Request)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ message: 'Stock agotado en un producto' }),
    });

    render(<CartSummary isAuthenticated={true} />);

    const buyButton = screen.getByRole('button', { name: 'Finalizar Compra' });
    await userEvent.click(buyButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Stock agotado en un producto');
    });
    
    expect(screen.getByRole('button', { name: 'Finalizar Compra' })).toBeInTheDocument();
  });
});
