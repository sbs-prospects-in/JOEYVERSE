import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';
import { ModalProvider } from '../../context/ModalContext';

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

// Mock GSAP and ScrollTrigger to prevent requestAnimationFrame leaks in jsdom environment
vi.mock('gsap', () => {
  const gsapMock = {
    registerPlugin: vi.fn(),
    fromTo: vi.fn((el, from, to) => {
      if (to && to.onComplete) to.onComplete();
      return { kill: vi.fn() };
    }),
    to: vi.fn((el, to) => {
      if (to && to.onComplete) to.onComplete();
      return { kill: vi.fn() };
    }),
    set: vi.fn(),
    quickTo: vi.fn(() => vi.fn()),
    timeline: vi.fn(() => ({
      to: function() { return this; },
      fromTo: function() { return this; },
      set: function() { return this; },
    })),
  };
  return {
    gsap: gsapMock,
    default: gsapMock,
  };
});

vi.mock('gsap/ScrollTrigger', () => {
  const ScrollTriggerMock = {
    registerPlugin: vi.fn(),
    create: vi.fn(),
    getAll: vi.fn(() => []),
  };
  return {
    ScrollTrigger: ScrollTriggerMock,
    default: ScrollTriggerMock,
  };
});

describe('Home Page', () => {
  it('renders home hero and title correctly', () => {
    render(
      <MemoryRouter>
        <ModalProvider>
          <Home />
        </ModalProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Your reliable partner/)).toBeInTheDocument();
    expect(screen.getByText(/pet wellness/)).toBeInTheDocument();
    expect(screen.getByText(/Professional Consultations/)).toBeInTheDocument();
  });
});
