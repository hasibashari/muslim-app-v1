import { duaRepository } from '../repository/dua.repository';
import { Dua } from '../types';

export const duaService = {
  getAllDuas: (): Dua[] => {
    return duaRepository.getAllDuas();
  },
  getCategories: (): string[] => {
    return duaRepository.getCategories();
  },
  getDuasByCategory: (category: string): Dua[] => {
    const trimmed = category.trim();
    if (!trimmed) return [];
    return duaRepository.getDuasByCategory(trimmed);
  },
  getDuaById: (id: number): Dua | undefined => {
    if (isNaN(id) || id <= 0) return undefined;
    return duaRepository.getDuaById(id);
  },
  getDuasPaginated: (page: number, limit: number, query?: string, category?: string): { duas: Dua[]; total: number } => {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.max(1, limit);
    const duas = duaRepository.getDuasPaginated(sanitizedPage, sanitizedLimit, query, category);
    const total = duaRepository.getDuasCount(query, category);
    return { duas, total };
  },
  getAdjacentDuas: (id: number): { prev?: { id: number; title: string }; next?: { id: number; title: string } } => {
    if (isNaN(id) || id <= 0) return {};
    return duaRepository.getAdjacentDuas(id);
  }
};
