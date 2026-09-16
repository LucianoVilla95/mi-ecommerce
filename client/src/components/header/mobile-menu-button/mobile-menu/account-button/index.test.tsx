/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import AcountButton from './index'; // Ajustá la ruta si tu archivo se llama diferente

// 1. Mockeamos los dos componentes hijos para aislar el contenedor de sus dependencias
jest.mock('../../../auth-button/signin-button/index', () => {
  return function MockSigninButton() {
    return <div data-testid="mock-signin-button">Mock Signin Button</div>;
  };
});

jest.mock('../../../auth-button/signup-button/index', () => {
  return function MockSignupButton() {
    return <div data-testid="mock-signup-button">Mock Signup Button</div>;
  };
});

describe('AcountButton Component (Container)', () => {
  it('should render both SigninButton and SignupButton subcomponents correctly', () => {
    render(<AcountButton />);

    // Verificamos que se monte de forma exitosa el subcomponente de inicio de sesión
    expect(screen.getByTestId('mock-signin-button')).toBeInTheDocument();

    // Verificamos que se monte de forma exitosa el subcomponente de registro de cuenta
    expect(screen.getByTestId('mock-signup-button')).toBeInTheDocument();
  });
});
