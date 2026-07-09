import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CampaignsAdvocacy from './CampaignsAdvocacy';

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

describe('CampaignsAdvocacy Page', () => {
  it('renders filter tabs and campaign items correctly', () => {
    render(
      <MemoryRouter>
        <CampaignsAdvocacy />
      </MemoryRouter>
    );
    expect(screen.getByText('Standing Up for Stray Rights')).toBeInTheDocument();
    expect(screen.getByText('Animal Writes 2025: Supreme Court Petition')).toBeInTheDocument();
  });
});
