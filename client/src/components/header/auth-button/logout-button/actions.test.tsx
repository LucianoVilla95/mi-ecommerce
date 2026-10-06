/// <reference types="jest" />
import { logoutAction } from './actions'; // Ajustá la ruta exacta si tu archivo se llama diferente
import { redirect } from 'next/navigation';

// CORRECCIÓN: Extendemos el objeto global de NodeJS de forma limpia para este archivo de pruebas
declare global {
  // eslint-disable-next-line no-var
  var lastCookieDeleteCall: unknown[] | undefined;
}

// CORRECCIÓN: Definimos el espía directamente inyectado en el entorno global para burlar el hoisting de Jest
jest.mock('next/headers', () => {
  return {
    cookies: jest.fn().mockResolvedValue({
      delete: jest.fn((...args: unknown[]) => {
        global.lastCookieDeleteCall = args;
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
    global.lastCookieDeleteCall = undefined; // Reseteamos la captura de forma tipada
  });

  it('should delete the access token cookie and trigger a redirect to home', async () => {
    await logoutAction();

    // Verificamos de forma dinámica el argumento que capturó el método delete sin usar 'any'
    expect(global.lastCookieDeleteCall).toEqual(['access_token']);

    // Verificamos la redirección nativa
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
