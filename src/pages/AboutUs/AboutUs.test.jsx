import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AboutUs from './AboutUs';

// Mock scroll-to-reveal hooks or InView checks
vi.mock('framer-motion', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useInView: () => true,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
    }
  };
});

describe('AboutUs Page', () => {
  it('renders about us headers and timelines', () => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );
    expect(screen.getByText('Who We Are & Why We Protect')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
  });
});
