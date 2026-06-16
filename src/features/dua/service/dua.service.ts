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
  }
};
