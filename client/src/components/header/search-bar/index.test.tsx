/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './index'; // Ajustá la ruta exacta si tu archivo se llama diferente

// 1. Espías globales para controlar el enrutamiento de Next.js
const mockReplace = jest.fn();
let currentSearchParamsStr = '';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      const params = new URLSearchParams(currentSearchParamsStr);
      return params.get(key);
    },
    toString: () => currentSearchParamsStr,
  }),
  usePathname: () => '/shop',
}));

// 2. CORRECCIÓN DEFINITIVA: Forzamos que el debounce sea síncrono e instantáneo en el entorno de tests
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (callback: (...args: any[]) => void) => {
    // Al retornar el callback directo de forma síncrona, eliminamos los problemas de temporizadores
    return jest.fn((...args: any[]) => callback(...args));
  },
}));

describe('SearchBar Component (Client Component with Debounce)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentSearchParamsStr = ''; // Reseteamos la URL inicial por defecto
  });

  it('should initialize input value from current search params', () => {
    currentSearchParamsStr = 'search=remera&page=2';

    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Buscar productos...') as HTMLInputElement;
    expect(input.value).toBe('remera');
    
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument();
  });

  it('should update the input state and update the URL when the user types', async () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Buscar productos...') as HTMLInputElement;
    
    // Simula la escritura nativa del usuario
    await userEvent.type(input, 'gorra');

    // El valor del input cambia al instante
    expect(input.value).toBe('gorra');
    
    // Gracias al mock síncrono, el replace se ejecuta de forma directa
    expect(mockReplace).toHaveBeenCalledWith('/shop?page=1&search=gorra');
  });

  it('should clean and remove the search parameter from URL if the user deletes all text', async () => {
    currentSearchParamsStr = 'search=short';
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Buscar productos...') as HTMLInputElement;
    
    await userEvent.clear(input);
    expect(input.value).toBe('');

    // Comprueba que remueva el parámetro 'search' y mantenga la página 1
    expect(mockReplace).toHaveBeenCalledWith('/shop?page=1');
  });

  it('should clear input and URL immediately when clicking the clear button', async () => {
    currentSearchParamsStr = 'search=buzo';
    render(<SearchBar />);

    const clearButton = screen.getByRole('button', { name: 'Limpiar búsqueda' });
    await userEvent.click(clearButton);

    const input = screen.getByPlaceholderText('Buscar productos...') as HTMLInputElement;
    expect(input.value).toBe('');

    expect(mockReplace).toHaveBeenCalledWith('/shop?page=1');
  });
});
