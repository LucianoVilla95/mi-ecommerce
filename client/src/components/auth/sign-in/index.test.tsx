/// <reference types="jest" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignIn from './index';

// 1. Espías globales para interceptar la Server Action y hooks
const mockSignInUser = jest.fn();
const mockPush = jest.fn();
const mockSyncCart = jest.fn();
const mockUseCartStore = jest.fn();

// 2. Mock de las dependencias externas
jest.mock('./actions', () => ({
  signInUser: (...args: any[]) => mockSignInUser(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/hooks/use-sync-cart', () => ({
  useSyncCart: () => ({
    mutate: mockSyncCart,
  }),
}));

jest.mock('@/stores/cart.store', () => ({
  useCartStore: (selector: any) => mockUseCartStore(selector),
}));

// Copiá y pegá esta línea debajo de tus otros jest.mock para limpiar el warning del act()
jest.mock('next/link', () => {
  return function MockNextLink({ children, href, className }: any) {
    return <a href={href} className={className}>{children}</a>;
  };
});


describe('SignIn Component (Client Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Necesario para controlar el setTimeout de 150ms del useEffect

    // Estado inicial por defecto: carrito vacío
    mockUseCartStore.mockImplementation((selector: any) =>
      selector({ items: [] })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the login form inputs and submit button correctly', () => {
    render(<SignIn />);

    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('should toggle password visibility when clicking the eye icon button', async () => {
    // CORRECCIÓN: Apagamos los temporizadores virtuales para que userEvent.click() no se cuelgue
    jest.useRealTimers();

    render(<SignIn />);

    const passwordInput = screen.getByLabelText('Contraseña');
    const toggleButton = screen.getByRole('button', { name: 'Mostrar contraseña' });

    // Estado inicial por defecto es tipo password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Hacemos click para mostrar contraseña
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Hacemos click de nuevo para ocultarla
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Restauramos los fake timers para no romper los siguientes tests que dependan de tiempos
    jest.useFakeTimers();
  });

  it('should display field validation errors when passed from server action state', () => {
    // Simulamos que useActionState recibe errores de validación de Zod
    const mockStateWithErrors = {
      success: false,
      errors: {
        email: ['El correo electrónico no es válido'],
        password: ['La contraseña es muy corta'],
      },
    };

    // React intercepta el valor inicial de useActionState modificando el mock antes del render
    mockSignInUser.mockImplementationOnce(() => mockStateWithErrors);

    // Forzamos el hook de React de forma nativa mockeando el retorno de useActionState indirectamente
    jest.spyOn(React, 'useActionState').mockReturnValueOnce([
      mockStateWithErrors,
      jest.fn(),
      false,
    ]);

    render(<SignIn />);

    expect(screen.getByText('El correo electrónico no es válido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es muy corta')).toBeInTheDocument();
  });

  it('should redirect straight to home page upon successful login if local cart is empty', async () => {
    // Simulamos login exitoso y carrito local vacío
    const mockSuccessState = { success: true };
    jest.spyOn(React, 'useActionState').mockReturnValueOnce([
      mockSuccessState,
      jest.fn(),
      false,
    ]);
    mockUseCartStore.mockImplementation((selector: any) =>
      selector({ items: [] })
    );

    render(<SignIn />);

    // El useEffect evalúa el éxito y gatilla la redirección
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
    expect(mockSyncCart).not.toHaveBeenCalled();
  });

  it('should call syncCart and then redirect to home upon successful login if local cart has items', async () => {
    // Simulamos login exitoso y carrito local con productos
    const mockSuccessState = { success: true };
    jest.spyOn(React, 'useActionState').mockReturnValueOnce([
      mockSuccessState,
      jest.fn(),
      false,
    ]);
    mockUseCartStore.mockImplementation((selector: any) =>
      selector({ items: [{ productId: 'prod-1', name: 'Item', price: 10 }] })
    );

    render(<SignIn />);

    // Adelantamos el reloj los 150ms configurados en tu setTimeout
    jest.advanceTimersByTime(150);

    expect(mockSyncCart).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    // Simulamos la ejecución del callback onSuccess de la mutación de React Query
    const lastCallArgs = mockSyncCart.mock.calls[0][1];
    lastCallArgs.onSuccess();

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should render general error message when server response fails credential verification', () => {
    const mockFailedState = {
      success: false,
      error: 'Credenciales inválidas',
    };
    jest.spyOn(React, 'useActionState').mockReturnValueOnce([
      mockFailedState,
      jest.fn(),
      false,
    ]);

    render(<SignIn />);

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });
});
