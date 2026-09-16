/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileMenu from './index'; // Ajustá la ruta si tu archivo se llama diferente

// 1. Mockeamos los tres componentes hijos para aislar el contenedor
jest.mock('./close-button', () => {
  return function MockCloseButton({ onClose }: { onClose: () => void }) {
    return <button data-testid="mock-close-button" onClick={onClose}>X</button>;
  };
});

jest.mock('../../auth-button/logout-button', () => {
  return function MockLogoutButton() {
    return <div data-testid="mock-logout-button">Mock Logout Button</div>;
  };
});

jest.mock('./acount-button', () => {
  return function MockAcountButton() {
    return <div data-testid="mock-acount-button">Mock Acount Button</div>;
  };
});

describe('MobileMenu Component (Client Component UI)', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply opening classes to aside and backdrop when isOpen is true', () => {
    const { container } = render(
      <MobileMenu isOpen={true} onClose={mockOnClose} isLoggedIn={false} />
    );

    // Buscamos el fondo (backdrop) por su clase base fija
    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toHaveClass('opacity-100', 'pointer-events-auto');

    // Buscamos el contenedor lateral (aside)
    const aside = screen.getByRole('complementary'); // aside mapea al rol semántico 'complementary'
    expect(aside).toHaveClass('translate-x-0');
    expect(screen.getByText('Menú')).toBeInTheDocument();
  });

  it('should apply closing classes to aside and backdrop when isOpen is false', () => {
    const { container } = render(
      <MobileMenu isOpen={false} onClose={mockOnClose} isLoggedIn={false} />
    );

    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toHaveClass('opacity-0', 'pointer-events-none');

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('-translate-x-full');
  });

  it('should render LogoutButton and hide AcountButton when user IS logged in', () => {
    render(<MobileMenu isOpen={true} onClose={mockOnClose} isLoggedIn={true} />);

    // Verificamos que monte el botón de cerrar sesión
    expect(screen.getByTestId('mock-logout-button')).toBeInTheDocument();
    // Verificamos que NO dibuje las opciones de login/registro
    expect(screen.queryByTestId('mock-acount-button')).not.toBeInTheDocument();
  });

  it('should render AcountButton and hide LogoutButton when user is NOT logged in', () => {
    render(<MobileMenu isOpen={true} onClose={mockOnClose} isLoggedIn={false} />);

    // Verificamos que monte las opciones de login/registro
    expect(screen.getByTestId('mock-acount-button')).toBeInTheDocument();
    // Verificamos que NO dibuje el botón de cerrar sesión
    expect(screen.queryByTestId('mock-logout-button')).not.toBeInTheDocument();
  });

  it('should trigger onClose callback when clicking the backdrop overlay or the CloseButton', async () => {
    const { container } = render(
      <MobileMenu isOpen={true} onClose={mockOnClose} isLoggedIn={false} />
    );

    // 1. Probamos el click en el CloseButton mockeado
    const closeBtn = screen.getByTestId('mock-close-button');
    await userEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // 2. Probamos el click en el fondo negro (backdrop)
    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    }
  });
});