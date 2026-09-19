/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './index'; // Ajustá la ruta si tu componente se llama distinto (ej: ./signup)

// Mock de la Server Action de registro para evitar llamadas reales a la API
const mockSignUpUser = jest.fn();
jest.mock('./actions', () => ({
  signUpUser: (...args: any[]) => mockSignUpUser(...args),
}));

// Mock de Next Link para silenciar las advertencias automáticas de act() de Next.js
jest.mock('next/link', () => {
  return function MockNextLink({ children, href, className }: any) {
    return <a href={href} className={className}>{children}</a>;
  };
});

describe('SignUp Component (Client Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form inputs and the submit button correctly', () => {
    render(<SignUp />);

    // CORRECCIÓN: Le avisamos a Jest que busque específicamente el encabezado (h1)
    expect(screen.getByRole('heading', { name: 'Crear cuenta', level: 1 })).toBeInTheDocument();
    
    // Verificamos los 7 campos semánticos gracias a tus id y htmlFor
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefono')).toBeInTheDocument();
    expect(screen.getByLabelText('Pais')).toBeInTheDocument();
    expect(screen.getByLabelText('Direccion')).toBeInTheDocument();
    expect(screen.getByLabelText('Ciudad')).toBeInTheDocument();
    
    // ¡Esta línea ya la tenías bien! Busca el botón exacto con ese nombre
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('should toggle password visibility status when clicking the eye icon button', async () => {
    render(<SignUp />);

    const passwordInput = screen.getByLabelText('Contraseña');
    
    // Buscamos el botón usando el aria-label que le pusimos al corregir el código
    const toggleButton = screen.getByRole('button', { name: 'Mostrar contraseña' });

    // Estado inicial por defecto es tipo password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Primer click: muestra el texto plano de la contraseña
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Segundo click: lo vuelve a ocultar (el aria-label cambia de forma dinámica en tu componente)
    const toggleButtonActive = screen.getByRole('button', { name: 'Ocultar contraseña' });
    await userEvent.click(toggleButtonActive);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render form error messages when received from useActionState state', () => {
    const mockStateWithErrors = {
      success: false,
      errors: {
        name: ['El nombre es obligatorio'],
        email: ['El correo electrónico no es válido'],
      },
    };

    // Forzamos el estado de useActionState simulando los errores devueltos por Zod
    jest.spyOn(React, 'useActionState').mockReturnValueOnce([
      mockStateWithErrors,
      jest.fn(),
      false,
    ]);

    render(<SignUp />);

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El correo electrónico no es válido')).toBeInTheDocument();
  });

  it('should show general backend error message when submission returns failure state', () => {
    const mockFailedState = {
      success: false,
      error: 'El correo electrónico ya está registrado',
    };

    jest.spyOn(React, 'useActionState').mockReturnValueOnce([
      mockFailedState,
      jest.fn(),
      false,
    ]);

    render(<SignUp />);

    expect(screen.getByText('El correo electrónico ya está registrado')).toBeInTheDocument();
  });
});
