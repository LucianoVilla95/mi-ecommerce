/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import CartDrawer from './index'; // Ajustá la ruta si es necesario

// 1. Espía global para controlar la visibilidad del Drawer mediante Zustand
const mockUseUICartStore = jest.fn();

jest.mock('@/stores/uicart.store', () => ({
  useUICartStore: () => mockUseUICartStore(),
}));

// 2. Mock simplificado de la librería Sheet de Radix/Shadcn para no lidiar con animaciones complejas en Jest
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: any) => open ? <div data-testid="sheet-root">{children}</div> : null,
  SheetContent: ({ children, className }: any) => <div className={className} data-testid="sheet-content">{children}</div>,
  SheetTitle: ({ children }: any) => <div data-testid="sheet-title">{children}</div>,
}));

// 3. Mockeo de los tres componentes hijos para aislar el contenedor
jest.mock('./CartHeader', () => {
  return function MockCartHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
    return <div data-testid="mock-cart-header">Header - Auth: {String(isAuthenticated)}</div>;
  };
});

jest.mock('./CartList', () => {
  return function MockCartList({ isAuthenticated }: { isAuthenticated: boolean }) {
    return <div data-testid="mock-cart-list">List - Auth: {String(isAuthenticated)}</div>;
  };
});

jest.mock('./CartSummary', () => {
  return function MockCartSummary({ isAuthenticated }: { isAuthenticated: boolean }) {
    return <div data-testid="mock-cart-summary">Summary - Auth: {String(isAuthenticated)}</div>;
  };
});

describe('CartDrawer Component (Main Container)', () => {
  const mockSetIsOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuración base: por defecto el drawer viene abierto
    mockUseUICartStore.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
    });
  });

  it('should render all subcomponents inside the sheet when isOpen is true', () => {
    render(<CartDrawer isAuthenticated={false} />);

    // Verificamos que el contenedor raíz de Shadcn se renderice
    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();

    // Verificamos que monte de forma correcta a sus 3 hijos pasándoles el isAuthenticated (false)
    expect(screen.getByTestId('mock-cart-header')).toHaveTextContent('Header - Auth: false');
    expect(screen.getByTestId('mock-cart-list')).toHaveTextContent('List - Auth: false');
    expect(screen.getByTestId('mock-cart-summary')).toHaveTextContent('Summary - Auth: false');
  });

  it('should render nothing when isOpen is false', () => {
    // Forzamos el estado de Zustand en cerrado (isOpen: false)
    mockUseUICartStore.mockReturnValue({
      isOpen: false,
      setIsOpen: mockSetIsOpen,
    });

    render(<CartDrawer isAuthenticated={true} />);

    // Verificamos que al estar cerrado el mock de Sheet no renderice nada en el DOM
    expect(screen.queryByTestId('sheet-root')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-cart-header')).not.toBeInTheDocument();
  });

  it('should propagate the isAuthenticated prop correctly to all children as true', () => {
    render(<CartDrawer isAuthenticated={true} />);

    // Validamos que el prop isAuthenticated viaje de forma transparente a cada subcomponente hijo
    expect(screen.getByTestId('mock-cart-header')).toHaveTextContent('Header - Auth: true');
    expect(screen.getByTestId('mock-cart-list')).toHaveTextContent('List - Auth: true');
    expect(screen.getByTestId('mock-cart-summary')).toHaveTextContent('Summary - Auth: true');
  });
});