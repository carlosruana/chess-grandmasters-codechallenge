import { useState, useEffect, useCallback } from 'react';
import type { GrandMaster } from '../types/index';
import { ChessApiService } from '../services/api.service';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const useGrandmasters = () => {
  const [grandmasters, setGrandmasters] = useState<GrandMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCachePage = (page: number): GrandMaster[] | null => {
    const item = localStorage.getItem(`grandmasters_page_${page}`);
    if (!item) return null;

    const cached: CacheItem<GrandMaster[]> = JSON.parse(item);
    const now = new Date().getTime();

    if (now - cached.timestamp > 5 * 60 * 1000) {
      localStorage.removeItem(`grandmasters_page_${page}`);
      return null;
    }

    return cached.data;
  };

  const setCachePage = (page: number, data: GrandMaster[]): void => {
    const item: CacheItem<GrandMaster[]> = {
      data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(`grandmasters_page_${page}`, JSON.stringify(item));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedFirstPage = getCachePage(0);
        if (cachedFirstPage) {
          setGrandmasters(cachedFirstPage);
          setLoading(false);
          return;
        }

        const api = ChessApiService.getInstance();
        const response = await api.fetchGrandmasters(0);

        setCachePage(0, response.data);
        setGrandmasters(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadMore = useCallback(async (page: number): Promise<number> => {
    try {
      setLoading(true);

      // Check cache first
      const cachedPage = getCachePage(page);
      if (cachedPage) {
        setGrandmasters((prev) => {
          const newGrandmasters = [...prev];
          cachedPage.forEach((gm, index) => {
            const position = page * 10 + index;
            newGrandmasters[position] = gm;
          });
          return newGrandmasters;
        });
        return cachedPage.length;
      }

      const api = ChessApiService.getInstance();
      const response = await api.fetchGrandmasters(page);

      // Cache the new page
      setCachePage(page, response.data);

      setGrandmasters((prev) => {
        const newGrandmasters = [...prev];
        response.data.forEach((gm, index) => {
          const position = page * 10 + index;
          newGrandmasters[position] = gm;
        });
        return newGrandmasters;
      });

      return response.data.length;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load grandmasters')
      );
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data: grandmasters,
    loading,
    error,
    loadMore,
  };
};
