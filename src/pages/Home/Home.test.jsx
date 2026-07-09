import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';

// Mock scroll-to-reveal hooks or InView checks if they use intersection observer
vi.mock('framer-motion', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useInView: () => true,
    AnimatePresence: ({ children }) => children,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
    }
  };
});

describe('Home Page', () => {
  it('renders home hero and title correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Kindness on the Streets')).toBeInTheDocument();
    expect(screen.getByText('Our Four Pillars of Kindness')).toBeInTheDocument();
  });
});
