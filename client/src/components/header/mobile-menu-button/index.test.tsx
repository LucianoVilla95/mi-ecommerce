/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuButton from './index'; // Ajustá la ruta exacta si tu componente se llama diferente

// Mockeamos el componente hijo MobileMenu para aislar el comportamiento de MenuButton
jest.mock('./mobile-menu', () => {
  return function MockMobileMenu({ isOpen, onClose, isLoggedIn }: any) {
    return (
      <div data-testid="mock-mobile-menu">
        <span>Status: {isOpen ? 'Open' : 'Closed'}</span>
        <span>Auth: {String(isLoggedIn)}</span>
        <button data-testid="mock-close-btn" onClick={onClose}>Close Me</button>
      </div>
    );
  };
});

describe('MenuButton Component (Client Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the hamburger menu button and initialize MobileMenu as closed', () => {
    render(<MenuButton isLoggedIn={false} />);

    // CORRECCIÓN: Buscamos todos los botones y agarramos el primero [0] que es el de tu hamburguesa real
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeInTheDocument();

    // Verificamos que el MobileMenu empiece cerrado por defecto
    expect(screen.getByTestId('mock-mobile-menu')).toHaveTextContent('Status: Closed');
    expect(screen.getByTestId('mock-mobile-menu')).toHaveTextContent('Auth: false');
  });

  it('should open the MobileMenu when the hamburger button is clicked', async () => {
    render(<MenuButton isLoggedIn={true} />);

    // CORRECCIÓN: Volvemos a agarrar el primer botón del array de forma segura
    const buttons = screen.getAllByRole('button');
    const hamburgerButton = buttons[0];
    
    // Simulamos el click realista de apertura
    await userEvent.click(hamburgerButton);

    // Verificamos que el estado cambie a abierto
    expect(screen.getByTestId('mock-mobile-menu')).toHaveTextContent('Status: Open');
    expect(screen.getByTestId('mock-mobile-menu')).toHaveTextContent('Auth: true');
  });

  it('should close the MobileMenu when its onClose callback is triggered', async () => {
    render(<MenuButton isLoggedIn={false} />);

    const buttons = screen.getAllByRole('button');
    const hamburgerButton = buttons[0];
    
    // Abrimos el menú primero
    await userEvent.click(hamburgerButton);
    expect(screen.getByTestId('mock-mobile-menu')).toHaveTextContent('Status: Open');

    // Buscamos el botón de cierre exacto usando su data-testid para que no haya confusiones
    const closeButton = screen.getByTestId('mock-close-btn');
    await userEvent.click(closeButton);

    // Verificamos que el estado vuelva a cerrarse
    expect(screen.getByTestId('mock-mobile-menu')).toHaveTextContent('Status: Closed');
  });
});
