/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import AnnouncementBar from './index'; // Ajustá la ruta si es necesario

describe('AnnouncementBar Component (Static Component)', () => {
  it('should render the announcement text correctly', () => {
    render(<AnnouncementBar />);

    // Buscamos el texto exacto que definiste en el componente
    const announcementText = screen.getByText(/Envíos gratis en compras mayores a \$25\.000/i);
    
    // Verificamos que esté montado en el DOM con React Testing Library (jest-dom)
    expect(announcementText).toBeInTheDocument();
  });
});
