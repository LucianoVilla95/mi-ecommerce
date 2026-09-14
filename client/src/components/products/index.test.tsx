import { render, screen } from '@testing-library/react';
import Products from './index';
import { PaginationResult, Product } from './types';
import { Category } from "../categories/category-list/types";

// 1. Mocks de los subcomponentes para aislar el test de Products
jest.mock('./product-item', () => {
  return function MockProductItem({ name }: { name: string }) {
    return <div data-testid="product-item">{name}</div>;
  };
});

jest.mock('../pagination', () => {
  return function MockPagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
    return <div data-testid="pagination">Página {currentPage} de {totalPages}</div>;
  };
});

// 2. Mock del fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 3. Configuración de variables de entorno para el test
const ORIGINAL_ENV = process.env;

describe('Products Component (Server Component)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...ORIGINAL_ENV, BACKEND_API_URL: 'http://api.test' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  const mockProductsData: PaginationResult<Product> = {
    data: [
      { id: '0efe70df-2711-434c-b8bf-a74cd69db045', name: 'Producto 1', imgUrl: '/p1.jpg', imgPublicId: '/p1.jpg', price: '100', description: 'Desc 1', stock: 100, slug: 'product-1', isActive: true, category: {} as Category, orderDetails: [], createdAt: '2026-09-13T19:43:21.123Z', updatedAt: '2026-09-13T19:43:21.123Z' },
      { id: '4c2d3a91-fa8d-4e92-911e-b8d6f51cb7e5', name: 'Producto 2', imgUrl: '/p2.jpg', imgPublicId: '/p2.jpg', price: '200', description: 'Desc 2', stock: 100, slug: 'product-2', isActive: true, category: {} as Category, orderDetails: [], createdAt: '2026-09-13T19:43:21.123Z', updatedAt: '2026-09-13T19:43:21.123Z' },
    ],
    meta: { total: 15, currentPage: 1, lastPage: 2 }
  };

  it('should render the product list and pagination when search query is empty', async () => {
    // Simulamos la respuesta exitosa de la API de productos generales
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockProductsData),
    });

    // Al ser un Server Component asíncrono, resolvemos la promesa al renderizar
    const ResolvedProducts = await Products({
      isAuthenticated: true,
      searchQuery: '',
      currentPage: 1
    });
    render(ResolvedProducts);

    // Verificaciones de llamadas a la API
    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/products?page=1&limit=10',
      expect.objectContaining({ next: { revalidate: 60 } })
    );

    // Verificaciones del renderizado
    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('product-item')).toHaveLength(2);
    expect(screen.getByTestId('pagination')).toHaveTextContent('Página 1 de 2');
  });

  it('should call the search API when searchQuery contains text', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockProductsData),
    });

    const ResolvedProducts = await Products({
      isAuthenticated: false,
      searchQuery: 'remera',
      currentPage: 2
    });
    render(ResolvedProducts);

    // Verifica que use el endpoint de búsqueda codificando los caracteres
    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/products/search?name=remera&page=2&limit=10',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('should display a friendly error message when the product list is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ data: [], meta: { total: 15, currentPage: 1, lastPage: 1 } }),
    });

    const ResolvedProducts = await Products({
      isAuthenticated: false,
      searchQuery: 'zapato inexistente',
      currentPage: 1
    });
    render(ResolvedProducts);

    expect(screen.getByText('No se encontraron productos para "zapato inexistente"')).toBeInTheDocument();
    expect(screen.queryByTestId('product-item')).not.toBeInTheDocument();
  });
});
