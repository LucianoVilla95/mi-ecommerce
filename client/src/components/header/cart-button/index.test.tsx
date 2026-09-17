/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartButton from './index'; // Ajustá la ruta exacta si tu componente se llama diferente

// 1. Espía global para interceptar el Store de la UI del carrito
const mockOpenCart = jest.fn();

// 2. Mock de Zustand que resuelve el selector devolviendo nuestra función espía
jest.mock('@/stores/uicart.store', () => ({
  useUICartStore: (selector: any) =>
    selector({
      openCart: mockOpenCart,
    }),
}));

describe('CartButton Component (Client Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the cart button containing the shopping cart icon correctly', () => {
    render(<CartButton />);

    // Buscamos el botón en el DOM
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should call openCart from useUICartStore when the button is clicked', async () => {
    render(<CartButton />);

    const button = screen.getByRole('button');
    
    // Simulamos de forma realista el clic del usuario utilizando userEvent
    await userEvent.click(button);

    // Comprobamos que la acción del store haya sido llamada exactamente una vez
    expect(mockOpenCart).toHaveBeenCalledTimes(1);
  });
});