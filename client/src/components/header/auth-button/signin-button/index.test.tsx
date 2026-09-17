/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import SigninButton from './index'; // Ajustá la ruta si tu archivo se llama diferente

// CORRECCIÓN PARA EL ACT(): Mockeamos Next Link para que sea un tag <a> estático común
// Esto frena los procesos pesados de pre-fetch en segundo plano de Next.js que ensucian la consola
jest.mock('next/link', () => {
  return function MockNextLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('SigninButton Component', () => {
  it('should render the button with correct text and be wrapped in a link to signin page', () => {
    render(<SigninButton />);

    // 1. Verificamos que el botón con el texto correspondiente aparezca montado en la pantalla
    const button = screen.getByRole('button', { name: 'Iniciar sesión' });
    expect(button).toBeInTheDocument();

    // 2. Verificamos que el rol semántico del link apunte de forma exacta a tu ruta de /auth/signin
    const link = screen.getByRole('link', { name: 'Iniciar sesión' });
    expect(link).toHaveAttribute('href', '/auth/signin');
  });
});
