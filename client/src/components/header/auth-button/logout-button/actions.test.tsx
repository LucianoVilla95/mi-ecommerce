/// <reference types="jest" />
import { logoutAction } from './actions'; // Ajustá la ruta exacta si tu archivo se llama diferente
import { redirect } from 'next/navigation';

// CORRECCIÓN: Definimos el espía directamente inyectado en el entorno global para burlar el hoisting de Jest
jest.mock('next/headers', () => {
  return {
    cookies: jest.fn().mockResolvedValue({
      delete: jest.fn((...args) => {
        (global as any).lastCookieDeleteCall = args;
      }),
    }),
  };
});

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('logoutAction Server Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).lastCookieDeleteCall = undefined; // Reseteamos la captura antes de cada test
  });

  it('should delete the access token cookie and trigger a redirect to home', async () => {
    await logoutAction();

    // Verificamos de forma dinámica el argumento que capturó el método delete
    expect((global as any).lastCookieDeleteCall).toEqual(['access_token']);

    // Verificamos la redirección nativa
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
