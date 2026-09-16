/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './index'; // Asegurá la ruta exacta si tu archivo se llama diferente

// CORRECCIÓN DEFINITIVA: Guardamos el estado de forma dinámica en global para esquivar el hoisting de Jest
jest.mock('next/headers', () => {
  return {
    cookies: jest.fn().mockResolvedValue({
      has: jest.fn((key: string) => {
        return !!(global as any).mockCookieStore?.[key];
      }),
    }),
  };
});

// Mockeo quirúrgico de los 6 componentes hijos para aislar el Server Component
jest.mock('./mobile-menu-button', () => {
  return function MockMenuButton({ isLoggedIn }: { isLoggedIn: boolean }) {
    return <div data-testid="mock-menu-button">MenuButton - LoggedIn: {String(isLoggedIn)}</div>;
  };
});

jest.mock('./logo', () => {
  return function MockLogo() {
    return <div data-testid="mock-logo">Logo</div>;
  };
});

jest.mock('./search-bar', () => {
  return function MockSearchBar() {
    return <div data-testid="mock-search-bar">SearchBar</div>;
  };
});

jest.mock('./auth-button', () => {
  return function MockAuthButton() {
    return <div data-testid="mock-auth-button">AuthButton</div>;
  };
});

jest.mock('./auth-button/logout-button', () => {
  return function MockLogoutButton() {
    return <div data-testid="mock-logout-button">LogoutButton</div>;
  };
});

jest.mock('./cart-button', () => {
  return function MockCartButton() {
    return <div data-testid="mock-cart-button">CartButton</div>;
  };
});

describe('Header Component (Server Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Inicializamos nuestro objeto de cookies simulado vacío antes de cada test
    (global as any).mockCookieStore = {};
  });

  it('should render structural common pieces and AuthButton when user is NOT authenticated', async () => {
    // Simulamos que el token NO existe dejando el almacén vacío
    (global as any).mockCookieStore = { 'access_token': false };

    // Resolvemos el Server Component de forma asíncrona antes del renderizado
    const HeaderComponent = await Header();
    render(HeaderComponent);

    // Verificamos que las piezas fijas se pinten pasando el estado correcto
    expect(screen.getByTestId('mock-menu-button')).toHaveTextContent('MenuButton - LoggedIn: false');
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cart-button')).toBeInTheDocument();

    // LÓGICA CONDICIONAL: Debe mostrar AuthButton y NO LogoutButton
    expect(screen.getByTestId('mock-auth-button')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-logout-button')).not.toBeInTheDocument();
  });

  it('should render structural common pieces and LogoutButton when user IS authenticated', async () => {
    // Simulamos que la cookie 'access_token' SÍ existe dándole un valor real
    (global as any).mockCookieStore = { 'access_token': true };

    const HeaderComponent = await Header();
    render(HeaderComponent);

    // Verificamos que las piezas fijas se pinten heredando la autenticación
    expect(screen.getByTestId('mock-menu-button')).toHaveTextContent('MenuButton - LoggedIn: true');
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cart-button')).toBeInTheDocument();

    // LÓGICA CONDICIONAL: Debe mostrar LogoutButton y NO AuthButton
    expect(screen.getByTestId('mock-logout-button')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-auth-button')).not.toBeInTheDocument();
  });
});
