import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ContactUs from './ContactUs';

// Mock scroll-to-reveal hooks or InView checks
vi.mock('framer-motion', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useInView: () => true,
    motion: {
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
    }
  };
});

describe('ContactUs Page', () => {
  it('renders contact details and contact form correctly', () => {
    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>
    );
    expect(screen.getByText('Get in Touch with Us')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Email')).toBeInTheDocument();
  });
});
