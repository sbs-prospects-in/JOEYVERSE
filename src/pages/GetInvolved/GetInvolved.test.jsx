import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import GetInvolved from './GetInvolved';

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

describe('GetInvolved Page', () => {
  it('renders ways to help and volunteer signup elements', () => {
    render(
      <MemoryRouter>
        <GetInvolved />
      </MemoryRouter>
    );
    expect(screen.getByText('Join the Movement of Compassion')).toBeInTheDocument();
    expect(screen.getByText('Become a Volunteer')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
