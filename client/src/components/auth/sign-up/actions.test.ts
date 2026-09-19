/// <reference types="jest" />
import { signUpUser } from './actions'; // Ajustá la ruta exacta a tu Server Action de registro
import { redirect } from 'next/navigation';

// 1. Mock de la navegación de Next.js para rastrear el redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// 2. Mock del fetch global
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

const ORIGINAL_ENV = { ...process.env };

describe('signUpUser Server Action', () => {
  // Contraseña segura genérica para saltear las validaciones estrictas de tu registerSchema
  const VALID_PASSWORD = 'Password123!';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_API_URL = 'http://api.test';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // Helper para armar el FormData con todos tus campos requeridos
  const createFormData = (fields: Record<string, string>): FormData => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  };

  it('should return errors when validation fails due to empty fields', async () => {
    // Mandamos todo vacío para que Zod lo rebote al instante
    const formData = createFormData({ name: '', email: '' });

    const result = await signUpUser(undefined, formData);

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Object), // Mensajes detallados de Zod
        fields: expect.objectContaining({ name: '', email: '' }),
      })
    );
    expect(mockFetch).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should return failure state when backend api rejects the registration request', async () => {
    // Simulamos que el backend rechaza la petición (por ejemplo, email ya registrado)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ message: 'El correo ya se encuentra registrado' }),
    });

    const validFields = {
      name: 'Luciano Villaroel',
      email: 'test@user.com',
      password: VALID_PASSWORD,
      phone: '123456789',
      country: 'Argentina',
      address: 'Calle Falsa 123',
      city: 'Jujuy'
    };

    const formData = createFormData(validFields);
    const result = await signUpUser(undefined, formData);

    // Verificamos que el fetch use tu endpoint correcto de /users/signup
    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/users/signup',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(validFields),
      })
    );

    expect(result).toEqual({
      success: false,
      error: 'El correo ya se encuentra registrado',
      fields: validFields,
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should trigger next/navigation redirect when backend registration succeeds', async () => {
    // Simulamos respuesta 200 OK del Backend
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    });

    const validFields = {
      name: 'Luciano Villaroel',
      email: 'success@user.com',
      password: VALID_PASSWORD,
      phone: '123456789',
      country: 'Argentina',
      address: 'Calle Falsa 123',
      city: 'Jujuy'
    };

    const formData = createFormData(validFields);
    
    // Ejecutamos la acción
    await signUpUser(undefined, formData);

    // Verificamos que al dar result = true, se ejecute la redirección oficial a login
    expect(redirect).toHaveBeenCalledWith('/auth/signin');
  });

  it('should return catch-all failure state when connection with backend server fails', async () => {
    // Simulamos caída drástica de red
    mockFetch.mockRejectedValueOnce(new Error('Network Failure'));

    const validFields = {
      name: 'Luciano Villaroel',
      email: 'test@user.com',
      password: VALID_PASSWORD,
      phone: '123456789',
      country: 'Argentina',
      address: 'Calle Falsa 123',
      city: 'Jujuy'
    };

    const formData = createFormData(validFields);
    const result = await signUpUser(undefined, formData);

    expect(result).toEqual({
      success: false,
      error: 'No se pudo conectar con el servidor',
      fields: validFields,
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});
