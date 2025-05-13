import React, {
  useState,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import type { GrandmasterListResponse } from '../types';
import {
  GrandmasterContext,
} from './grandmasterContextDefinition';

const API_URL = 'https://api.chess.com/pub/titled/GM';

export const GrandmasterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [grandmasters, setGrandmasters] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const _executeGMFetch = async () => {
    if (grandmasters.length > 0 || loading || error) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(
          `Error fetching GMs: ${response.statusText} (status: ${response.status})`
        );
      }
      const data: GrandmasterListResponse = await response.json();
      setGrandmasters(data.players);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching GMs');
      }
      setGrandmasters([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (grandmasters.length === 0 && !loading && !error) {
      _executeGMFetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGrandmasters = () => {
    if (grandmasters.length === 0 && !loading) {
      setError(null);
      _executeGMFetch();
    }
  };

  return (
    <GrandmasterContext.Provider
      value={{ grandmasters, loading, error, fetchGrandmasters }}
    >
      {children}
    </GrandmasterContext.Provider>
  );
};
