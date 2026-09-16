/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './index';

// 1. Declaración de espías globales para la navegación de Next.js
const mockReplace = jest.fn();
let currentSearchParamsStr = '';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    toString: () => currentSearchParamsStr,
  }),
  usePathname: () => '/products',
}));

// 2. Mock síncrono para useTransition (evita cuellos de botella asíncronos en Jest)
jest.spyOn(React, 'useTransition').mockImplementation(() => [
  false, // isPending siempre falso por defecto
  (callback: () => void) => callback(), // Ejecuta el callback de startTransition al instante
]);

describe('Pagination Component (Client Component with Suspense)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentSearchParamsStr = ''; // Resetea los parámetros de búsqueda por defecto
  });

  it('should render correct current page and total pages counters', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('de')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should disable previous page button when on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} />);

    const prevButton = screen.getByRole('button', { name: /página anterior/i });
    const nextButton = screen.getByRole('button', { name: /página siguiente/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('should disable next page button when on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} />);

    const prevButton = screen.getByRole('button', { name: /página anterior/i });
    const nextButton = screen.getByRole('button', { name: /página siguiente/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should call router replace with incremented page when next button is clicked', async () => {
    render(<Pagination currentPage={2} totalPages={5} />);

    const nextButton = screen.getByRole('button', { name: /página siguiente/i });
    await userEvent.click(nextButton);

    // Verifica que se incremente la página manteniendo el pathname
    expect(mockReplace).toHaveBeenCalledWith('/products?page=3');
  });

  it('should call router replace with decremented page when previous button is clicked', async () => {
    render(<Pagination currentPage={3} totalPages={5} />);

    const prevButton = screen.getByRole('button', { name: /página anterior/i });
    await userEvent.click(prevButton);

    // Verifica que se reduzca la página manteniendo el pathname
    expect(mockReplace).toHaveBeenCalledWith('/products?page=2');
  });

  it('should preserve existing query parameters when switching pages', async () => {
    // Simulamos que la URL original ya tenía parámetros como la query de búsqueda
    currentSearchParamsStr = 'searchQuery=remera&limit=10';

    render(<Pagination currentPage={1} totalPages={5} />);

    const nextButton = screen.getByRole('button', { name: /página siguiente/i });
    await userEvent.click(nextButton);

    // Verifica que mantenga la búsqueda original agregando o actualizando 'page'
    expect(mockReplace).toHaveBeenCalledWith('/products?searchQuery=remera&limit=10&page=2');
  });
});
