import { signInUser } from './actions'; // Ajustá la ruta si es necesario

// 1. Mock de cookies de Next.js moderno (devuelve una promesa)
jest.mock('next/headers', () => {
  return {
    cookies: jest.fn().mockResolvedValue({
      set: jest.fn((...args) => {
        // Esto intercepta dinámicamente las llamadas y las guarda en el registro global de Jest
        (global as any).lastCookieSetCall = args;
      }),
    }),
  };
});

// 2. Mock del fetch global
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

const ORIGINAL_ENV = { ...process.env };

describe('signInUser Server Action', () => {
  // CORRECCIÓN: Usamos un string que cumple con tu validación estricta de Zod
  const VALID_PASSWORD = 'Password123!';

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).lastCookieSetCall = undefined; // Limpiamos la llamada residual de cookies
    // Forzamos la variable de entorno para que el fetch la use dinámicamente
    process.env.BACKEND_API_URL = 'http://api.test';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // Helper para generar el FormData que recibe la acción
  const createFormData = (email?: string, password?: string): FormData => {
    const formData = new FormData();
    if (email !== undefined) formData.append('email', email);
    if (password !== undefined) formData.append('password', password);
    return formData;
  };

  it('should return errors when validation fails (invalid fields)', async () => {
    // Mandamos campos vacíos para gatillar el error de Zod
    const formData = createFormData('', '');

    const result = await signInUser(undefined, formData);

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Object), // Contiene los mensajes de error de Zod
        fields: { email: '', password: '' },
      })
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return failure state when backend api rejects credentials', async () => {
    // Simulamos respuesta de error 401 del Backend
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ message: 'Credenciales inválidas' }),
    });

    const formData = createFormData('test@user.com', VALID_PASSWORD);
    const result = await signInUser(undefined, formData);

    // CORRECCIÓN: Apunta a la URL de signin final que arma tu componente
    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/users/signin',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@user.com', password: VALID_PASSWORD }),
      })
    );

    expect(result).toEqual({
      success: false,
      error: 'Credenciales inválidas',
      fields: { email: 'test@user.com', password: VALID_PASSWORD },
    });
  });

  it('should save the access_token in secure cookies and return success on correct login', async () => {
    // CORRECCIÓN: Emulamos el método .get de las cabeceras tolerando minúsculas para evadir fallos de entornos Node
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (headerName: string) => headerName.toLowerCase() === 'set-cookie' ? 'access_token=token_secreto_abc123; Path=/' : null,
      },
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    });

    const formData = createFormData('valid@user.com', VALID_PASSWORD);
    const result = await signInUser(undefined, formData);

    // Verificamos que se extrajo el token del string y se guardó en la cookie de Next
    expect((global as any).lastCookieSetCall).toEqual([
      'access_token',
      'token_secreto_abc123',
      expect.objectContaining({
        httpOnly: true,
        secure: false, // Vale false porque en Jest NODE_ENV es 'test'
        sameSite: 'lax',
      })
    ]);

    expect(result).toEqual({ success: true });
  });

  it('should return catch-all failure state when connection with server fails', async () => {
    // Simulamos que el backend está caído de forma drástica (tirando una excepción)
    mockFetch.mockRejectedValueOnce(new Error('Network Failure'));

    const formData = createFormData('test@user.com', VALID_PASSWORD);
    const result = await signInUser(undefined, formData);

    expect(result).toEqual({
      success: false,
      error: 'No se pudo conectar con el servidor',
      fields: { email: 'test@user.com', password: VALID_PASSWORD },
    });
  });
});
