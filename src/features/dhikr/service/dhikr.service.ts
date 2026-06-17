import { dhikrRepository } from '../repository/dhikr.repository';
import { Dhikr } from '../types';

export const dhikrService = {
  getAllDhikrs: (): Dhikr[] => {
    return dhikrRepository.getAllDhikrs();
  },
  getCategories: (): string[] => {
    return dhikrRepository.getCategories();
  },
  getDhikrsByCategory: (category: string): Dhikr[] => {
    const trimmed = category.trim();
    if (!trimmed) return [];
    return dhikrRepository.getDhikrsByCategory(trimmed);
  },
  getCategoryCounts: (): Record<string, number> => {
    return dhikrRepository.getCategoryCounts();
  }
};
