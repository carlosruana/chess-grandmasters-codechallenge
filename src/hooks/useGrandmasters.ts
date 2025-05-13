import { useContext } from 'react';
import {
  GrandmasterContext,
  type GrandmasterContextType,
} from '../contexts/grandmasterContextDefinition'; // Corrected import path

export const useGrandmasters = (): GrandmasterContextType => {
  const context = useContext<GrandmasterContextType | undefined>(GrandmasterContext);
  if (context === undefined) {
    throw new Error('useGrandmasters must be used within a GrandmasterProvider');
  }
  return context;
};
