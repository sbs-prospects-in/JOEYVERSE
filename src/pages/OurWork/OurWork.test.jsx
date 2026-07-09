import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import OurWork from './OurWork';

// Mock scroll-to-reveal hooks or InView checks
vi.mock('framer-motion', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useInView: () => true,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    }
  };
});

// Mock Recharts responsive container to render correctly under test environment
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) => <div className="responsive-container">{children}</div>,
  };
});

describe('OurWork Page', () => {
  it('renders program areas and impact metrics correctly', () => {
    render(
      <MemoryRouter>
        <OurWork />
      </MemoryRouter>
    );
    expect(screen.getByText('Protecting and Sustaining Street Lives')).toBeInTheDocument();
    expect(screen.getByText('Daily Feeding Operations')).toBeInTheDocument();
    expect(screen.getByText('Emergency Medical Rescue')).toBeInTheDocument();
  });
});
