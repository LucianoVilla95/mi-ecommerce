/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from './index'; // Ajustá la ruta exacta si tu componente se llama diferente

// 1. Creamos la función espía para simular la Server Action
const mockLogoutAction = jest.fn();

// 2. Le decimos a Jest que intercepte el archivo de acciones y use nuestro espía
jest.mock('./actions', () => ({
  logoutAction: () => mockLogoutAction(),
}));

describe('LogoutButton Component (Client Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the logout button with the correct text', () => {
    render(<LogoutButton />);

    // Verificamos que el botón aparezca en pantalla con el contenido esperado
    const button = screen.getByRole('button', { name: 'Cerrar Sesión' });
    expect(button).toBeInTheDocument();
  });

  it('should trigger the logoutAction server action when clicked', async () => {
    render(<LogoutButton />);

    const button = screen.getByRole('button', { name: 'Cerrar Sesión' });
    
    // Simulamos de forma realista el clic del usuario utilizando userEvent
    await userEvent.click(button);

    // Comprobamos que la Server Action haya sido llamada exactamente una vez
    expect(mockLogoutAction).toHaveBeenCalledTimes(1);
  });
});