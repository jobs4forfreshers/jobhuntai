// ── src/hooks/useFilters.js ──
import { useState, useCallback, useMemo } from 'react';

const DEFAULTS = {
  q:          '',
  category:   'all',     // all | fresher | intern | it | data | nonit | govt | senior
  level:      [],        // ['fresher','mid','senior']
  workType:   [],        // ['remote','hybrid','onsite']
  salaryMin:  null,
  salaryMax:  null,
  locations:  [],
  companySize:[],        // ['startup','mnc','unicorn']
  sources:    [],        // [] = all sources
  sortBy:     'ai_score', // ai_score | date | salary
};

export function useFilters() {
  const [filters, setFilters] = useState(DEFAULTS);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback((key, value) => {
    setFilters(prev => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      };
    });
  }, []);

  const reset = useCallback(() => setFilters(DEFAULTS), []);

  // Build query params for API
  const apiParams = useMemo(() => ({
    q:          filters.q         || undefined,
    category:   filters.category  !== 'all' ? filters.category : undefined,
    level:      filters.level.join(',')     || undefined,
    work_type:  filters.workType.join(',')  || undefined,
    salary_min: filters.salaryMin  || undefined,
    salary_max: filters.salaryMax  || undefined,
    locations:  filters.locations.join(',') || undefined,
    company_size: filters.companySize.join(',') || undefined,
    sources:    filters.sources.join(',')   || undefined,
    sort_by:    filters.sortBy,
  }), [filters]);

  const activeCount = useMemo(() =>
    Object.entries(filters).reduce((n, [k, v]) => {
      if (k === 'q' || k === 'sortBy') return n;
      if (k === 'category') return v !== 'all' ? n + 1 : n;
      if (Array.isArray(v)) return v.length ? n + 1 : n;
      return v != null ? n + 1 : n;
    }, 0),
  [filters]);

  return { filters, setFilter, toggleArrayFilter, reset, apiParams, activeCount };
}
