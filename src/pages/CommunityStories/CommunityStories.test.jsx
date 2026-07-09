import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CommunityStories from './CommunityStories';

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

describe('CommunityStories Index Page', () => {
  it('renders filter search and story items correctly', () => {
    render(
      <MemoryRouter>
        <CommunityStories />
      </MemoryRouter>
    );
    expect(screen.getByText('Voices from the Ground')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search stories...')).toBeInTheDocument();
    expect(screen.getByText('The Makarba Fire Alert: How Street Dogs Saved a Neighborhood')).toBeInTheDocument();
  });
});
