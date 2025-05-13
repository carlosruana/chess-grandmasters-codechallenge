import { createContext } from 'react';

export interface GrandmasterContextType {
  grandmasters: string[];
  loading: boolean;
  error: string | null;
  fetchGrandmasters: () => void;
}

export const GrandmasterContext = createContext<GrandmasterContextType | undefined>(
  undefined
);
