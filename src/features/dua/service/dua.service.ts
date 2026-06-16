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
  }
};
