// src/components/__tests__/GrandmasterList.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GrandmasterList from '../GrandmasterList';
import * as useGrandmastersHook from '../../hooks/useGrandmasters';
import * as React from 'react';

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: (fn: () => Promise<{ default: React.ComponentType }>) => fn(),
  };
});

const mockGrandmasters = [
  {
    username: 'magnuscarlsen',
    name: 'Magnus Carlsen',
    title: 'GM',
    followers: 123456,
    league: 'Champions',
  },
];

describe('GrandmasterList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading initially', async () => {
    vi.spyOn(useGrandmastersHook, 'useGrandmasters').mockReturnValue({
      data: [],
      loading: true,
      error: null,
      loadMore: vi.fn(),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <GrandmasterList />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/loading list/i)).toBeInTheDocument();
  });

  it('renders a grandmaster row after loading', async () => {
    const mockLoadMore = vi.fn().mockResolvedValue(1);
    vi.spyOn(useGrandmastersHook, 'useGrandmasters').mockReturnValue({
      data: mockGrandmasters,
      loading: false,
      error: null,
      loadMore: mockLoadMore,
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <GrandmasterList />
        </MemoryRouter>
      );
    });

    const element = await screen.findByText(/Magnus Carlsen/i);
    expect(element).toBeInTheDocument();
  });

  it('shows error message', async () => {
    vi.spyOn(useGrandmastersHook, 'useGrandmasters').mockReturnValue({
      data: [],
      loading: false,
      error: new Error('API error'),
      loadMore: vi.fn(),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <GrandmasterList />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('alert')).toHaveTextContent('API error');
  });

  it('shows empty state', async () => {
    vi.spyOn(useGrandmastersHook, 'useGrandmasters').mockReturnValue({
      data: [],
      loading: false,
      error: null,
      loadMore: vi.fn(),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <GrandmasterList />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      /no grandmasters found/i
    );
  });
});
