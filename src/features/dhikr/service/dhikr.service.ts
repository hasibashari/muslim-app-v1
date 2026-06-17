import { dhikrRepository } from '../repository/dhikr.repository';
import { Dhikr } from '../types';

let cachedDhikrs: Dhikr[] | null = null;
let cachedCategories: string[] | null = null;

export const dhikrService = {
  getAllDhikrs: (): Dhikr[] => {
    if (!cachedDhikrs) {
      cachedDhikrs = dhikrRepository.getAllDhikrs();
    }
    return cachedDhikrs;
  },
  getCategories: (): string[] => {
    if (!cachedCategories) {
      cachedCategories = dhikrRepository.getCategories();
    }
    return cachedCategories;
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
