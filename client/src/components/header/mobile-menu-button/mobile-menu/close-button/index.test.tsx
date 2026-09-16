/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CloseButton from './index'; // Ajustá la ruta exacta si tu archivo se llama diferente

describe('CloseButton Component', () => {
  it('should render the button element correctly', () => {
    // Pasamos una función vacía de mentira como prop obligatoria
    render(<CloseButton onClose={jest.fn()} />);

    // Verificamos que el botón esté montado en el DOM de forma exitosa
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should trigger the onClose function prop when clicked', async () => {
    // Creamos una función espía de Jest para rastrear la ejecución del callback
    const mockOnClose = jest.fn();
    
    render(<CloseButton onClose={mockOnClose} />);

    const button = screen.getByRole('button');
    
    // Simulamos el clic realista del usuario usando userEvent de forma asíncrona
    await userEvent.click(button);

    // Verificamos que la función prop haya sido invocada exactamente una vez
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
