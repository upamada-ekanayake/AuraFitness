import { useMemo } from 'react';
import { useAppData } from './useAppData';
import { generateAISuggestions } from '../services/aiSuggestionService';
import type { AISuggestion } from '../types/aiSuggestions';

export function useAISuggestions() {
  const { data, isReady } = useAppData();

  const suggestions = useMemo<AISuggestion[]>(() => {
    if (!isReady || !data) return [];
    
    const raw = generateAISuggestions(data);
    
    // Sort logic: high (2) > medium (1) > low (0)
    const priorityWeight = {
      high: 2,
      medium: 1,
      low: 0,
    };

    return [...raw].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }, [data, isReady]);

  const topSuggestions = useMemo<AISuggestion[]>(() => {
    return suggestions.slice(0, 4);
  }, [suggestions]);

  const highPrioritySuggestions = useMemo<AISuggestion[]>(() => {
    return suggestions.filter((sug) => sug.priority === 'high');
  }, [suggestions]);

  return {
    suggestions,
    topSuggestions,
    highPrioritySuggestions,
    isReady,
  };
}
