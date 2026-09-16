import { render, screen } from '@testing-library/react';
import ProductDetailPage from './index'; // Ajusta la ruta a tu archivo
import { cookies } from 'next/headers';
import React from 'react';

// 1. Mock de next/headers para controlar las cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// 2. Mock del componente de cliente para aislar la prueba
jest.mock('./add-to-cart-button', () => {
  return function MockAddToCartButton({ product, isAuthenticated }: any) {
    return (
      <button data-testid="add-to-cart-mock">
        {`Button - Auth: ${isAuthenticated} - Product: ${product.name}`}
      </button>
    );
  };
});

// 1. RECOGE EL MOCK DE NEXT/IMAGE DE ESTA MANERA
jest.mock('next/image', () => {
  return function MockImage(props: any) {
    // Inyectamos todo el objeto de props para no perder ninguna propiedad
    return <img data-testid="product-image" src={props.src} alt={props.alt} />;
  };
});

// Mock de las variables de entorno
const MOCK_API_URL = 'https://test.com';
process.env.BACKEND_API_URL = MOCK_API_URL;

// Datos de prueba (Mock Data)
const mockProduct = {
  id: '123',
  name: 'Zapatillas Running',
  price: 89.99,
  description: 'Zapatillas de alta calidad para correr.',
  imgUrl: 'https://res.cloudinary.com/dd1jietna/image/upload/v1779078505/xlykw53xaifgujn4x6gc.webp',
};

describe('ProductDetailPage (Server Component)', () => {
  let mockHasCookie: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuración por defecto para el mock de cookies
    mockHasCookie = jest.fn().mockReturnValue(false);
    (cookies as jest.Mock).mockResolvedValue({
      has: mockHasCookie,
    });

    // Mock global del fetch de la API
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockProduct),
    });
  });

  // Helper para renderizar un Async Server Component en React Testing Library
  const renderAsyncComponent = async (componentPromise: Promise<React.JSX.Element>) => {
    const resolvedComponent = await componentPromise;
    return render(resolvedComponent);
  };

  it('should correctly render the product information', async () => {
    const params = Promise.resolve({ slug: 'zapatillas-running' });

    await renderAsyncComponent(ProductDetailPage({ params }));

    // Verificar llamadas a la API externa
    expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/products/zapatillas-running`);

    // Verificar textos en pantalla
    expect(screen.getByRole('heading', { name: 'Zapatillas Running', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument();
    expect(screen.getByText('Zapatillas de alta calidad para correr.')).toBeInTheDocument();
    expect(screen.getByText('Envío gratis en compras mayores a $50')).toBeInTheDocument();
  });

  it('should apply the background transformations to the Cloudinary image URL', async () => {
    const params = Promise.resolve({ slug: 'zapatillas-running' });

    await renderAsyncComponent(ProductDetailPage({ params }));

    // Buscamos el elemento directamente por su test id
    const image = screen.getByTestId('product-image');
    const srcAttribute = image.getAttribute('src');
    
    expect(srcAttribute).toContain('/upload/e_background_removal,b_rgb:a3a3a3/');
  });

  it('should pass isAuthenticated as false to the button if the access_token cookie does not exist', async () => {
    mockHasCookie.mockReturnValue(false); // No autenticado
    const params = Promise.resolve({ slug: 'zapatillas-running' });

    await renderAsyncComponent(ProductDetailPage({ params }));

    const button = screen.getByTestId('add-to-cart-mock');
    expect(button).toHaveTextContent('Auth: false');
  });

  it('should pass isAuthenticated as true to the button if the access_token cookie exists', async () => {
    mockHasCookie.mockReturnValue(true); // Autenticado
    const params = Promise.resolve({ slug: 'zapatillas-running' });

    await renderAsyncComponent(ProductDetailPage({ params }));

    const button = screen.getByTestId('add-to-cart-mock');
    expect(button).toHaveTextContent('Auth: true');
    expect(button).toHaveTextContent('Product: Zapatillas Running');
  });

  it('should display the error message if the API does not return a product', async () => {
    // Forzamos a la API a devolver un null simulando producto no encontrado
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(null),
    });

    const params = Promise.resolve({ slug: 'producto-fantasma' });

    await renderAsyncComponent(ProductDetailPage({ params }));

    expect(screen.getByText('No se encontraron productos para "producto-fantasma"')).toBeInTheDocument();
    
    // Asegurarse de que no se renderizó la estructura principal del producto
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });
});
