/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from './index'; // Ajustá la ruta si tu archivo se llama diferente (ej: ./logo)

// CORRECCIÓN PARA EL ACT(): Mockeamos Next Link para que sea un tag <a> estático común
// Esto frena los procesos de pre-fetch en segundo plano de Next.js que ensucian la consola
jest.mock('next/link', () => {
  return function MockNextLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('Logo Component', () => {
  it('should render the logo brand name correctly', () => {
    render(<Logo />);

    // 1. Verificamos que el nombre de la marca aparezca montado en la pantalla
    const brandHeading = screen.getByRole('heading', { name: 'AVORA', level: 1 });
    expect(brandHeading).toBeInTheDocument();
  });

  it('should be wrapped in a link pointing to the home page', () => {
    render(<Logo />);

    // 2. Verificamos que el rol semántico del link apunte de forma exacta a tu ruta raíz "/"
    const link = screen.getByRole('link', { name: 'AVORA' });
    expect(link).toHaveAttribute('href', '/');
  });
});
