/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './index'; // Ajustá la ruta si tu archivo se llama diferente

// CORRECCIÓN DEFINITIVA: Soportamos la exportación nombrada de Shadcn UI
jest.mock('@/components/ui/skeleton', () => {
  return {
    Skeleton: function MockSkeleton({ className }: { className: string }) {
      return <div data-testid="mock-skeleton" className={className} />;
    }
  };
});

describe('Loading Component (Static Skeleton Template)', () => {
  it('should render the layout structural container and all 3 skeleton blocks', () => {
    render(<Loading />);

    const skeletons = screen.getAllByTestId('mock-skeleton');
    
    // Validamos que se renderice la cantidad exacta esperada.
    expect(skeletons).toHaveLength(3);

    // Validamos que el primer bloque conserve las dimensiones
    expect(skeletons[0]).toHaveClass('h-31.25', 'w-62.5', 'rounded-xl');
  });
});
