/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import SignupButton from './index'; // Ajustá la ruta si tu archivo se llama diferente

// CORRECCIÓN PARA EL ACT(): Mockeamos Next Link para que sea un tag <a> estático común
// Esto frena los procesos de pre-fetch en segundo plano de Next.js que ensucian la consola
jest.mock('next/link', () => {
  return function MockNextLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('SignupButton Component', () => {
  it('should render the button with correct text and be wrapped in a link to signup page', () => {
    render(<SignupButton />);

    // 1. Verificamos que el botón aparezca montado en la pantalla con tu texto exacto
    const button = screen.getByRole('button', { name: 'Crea tu cuenta' });
    expect(button).toBeInTheDocument();

    // 2. Verificamos que el link que lo envuelve apunte de forma perfecta a tu ruta de registro
    const link = screen.getByRole('link', { name: 'Crea tu cuenta' });
    expect(link).toHaveAttribute('href', '/auth/signup');
  });
});