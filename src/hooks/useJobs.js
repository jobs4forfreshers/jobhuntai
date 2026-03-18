// ── src/hooks/useJobs.js ──
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { jobsAPI, analyticsAPI } from '../api';

// ── Main search hook (infinite scroll) ──
export function useJobSearch(filters) {
  return useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ pageParam = 1 }) =>
      jobsAPI.search({ ...filters, page: pageParam }).then(r => r.data),
    getNextPageParam: (last) => last.has_more ? last.page + 1 : undefined,
    staleTime: 60_000,   // 1 min — jobs refresh often
    enabled: true,
  });
}

// ── Single job detail ──
export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getById(id).then(r => r.data),
    staleTime: 120_000,
    enabled: !!id,
  });
}

// ── Personalized matches ──
export function usePersonalizedMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => jobsAPI.personalizedMatches().then(r => r.data),
    staleTime: 300_000,
  });
}

// ── Crawl status ──
export function useCrawlStatus() {
  return useQuery({
    queryKey: ['crawl-status'],
    queryFn: () => analyticsAPI.crawlStatus().then(r => r.data),
    refetchInterval: 30_000,   // poll every 30s
  });
}

// ── Top skills ──
export function useTopSkills() {
  return useQuery({
    queryKey: ['top-skills'],
    queryFn: () => analyticsAPI.topSkills().then(r => r.data),
    staleTime: 600_000,
  });
}
