import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const searchService = {
  globalSearch: async (q) => {
    if (!q || q.length < 2) return { data: [] };
    const response = await api.get(`/search`, { params: { q } });
    return response.data;
  }
};

export const useGlobalSearch = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.globalSearch(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
};
