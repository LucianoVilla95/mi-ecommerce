/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthButton from './index'; // Ajustá la ruta si tu archivo se llama diferente

// 1. Mockeamos los dos componentes hijos para aislar el contenedor
jest.mock('./signin-button', () => {
  return function MockSigninButton() {
    return <div data-testid="mock-signin-button">Mock Signin Button</div>;
  };
});

jest.mock('./signup-button', () => {
  return function MockSignupButton() {
    return <div data-testid="mock-signup-button">Mock Signup Button</div>;
  };
});

describe('AuthButton Component (Container)', () => {
  it('should render both SigninButton and SignupButton correctly', () => {
    render(<AuthButton />);

    // Verificamos que monte el subcomponente de inicio de sesión
    expect(screen.getByTestId('mock-signin-button')).toBeInTheDocument();

    // Verificamos que monte el subcomponente de registro de cuenta
    expect(screen.getByTestId('mock-signup-button')).toBeInTheDocument();
  });
});
