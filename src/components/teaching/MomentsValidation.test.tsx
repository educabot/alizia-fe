import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MomentsValidation } from './MomentsValidation';

const validMoments = {
  apertura: [1],
  desarrollo: [2, 3],
  cierre: [4],
};

describe('MomentsValidation', () => {
  it('renders nothing when valid and showSuccess is false', () => {
    const { container } = render(<MomentsValidation moments={validMoments} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success banner when valid and showSuccess is true', () => {
    render(<MomentsValidation moments={validMoments} showSuccess />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/cumplen los requisitos/)).toBeInTheDocument();
  });

  it('shows error when apertura has zero activities', () => {
    render(<MomentsValidation moments={{ ...validMoments, apertura: [] }} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Apertura debe tener exactamente 1 actividad')).toBeInTheDocument();
  });

  it('shows error when apertura has more than 1 activity', () => {
    render(<MomentsValidation moments={{ ...validMoments, apertura: [1, 2] }} />);
    expect(screen.getByText('Apertura debe tener exactamente 1 actividad')).toBeInTheDocument();
  });

  it('shows error when desarrollo is empty', () => {
    render(<MomentsValidation moments={{ ...validMoments, desarrollo: [] }} />);
    expect(screen.getByText('Desarrollo debe tener al menos 1 actividad')).toBeInTheDocument();
  });

  it('shows error when desarrollo exceeds the maximum', () => {
    render(<MomentsValidation moments={{ ...validMoments, desarrollo: [1, 2, 3] }} maxDesarrolloActivities={2} />);
    expect(screen.getByText('Desarrollo puede tener maximo 2 actividades')).toBeInTheDocument();
  });

  it('shows error when cierre is missing', () => {
    render(<MomentsValidation moments={{ ...validMoments, cierre: [] }} />);
    expect(screen.getByText('Cierre debe tener exactamente 1 actividad')).toBeInTheDocument();
  });

  it('lists multiple errors at once', () => {
    render(<MomentsValidation moments={{ apertura: [], desarrollo: [], cierre: [] }} />);
    expect(screen.getByText('Apertura debe tener exactamente 1 actividad')).toBeInTheDocument();
    expect(screen.getByText('Desarrollo debe tener al menos 1 actividad')).toBeInTheDocument();
    expect(screen.getByText('Cierre debe tener exactamente 1 actividad')).toBeInTheDocument();
  });
});
