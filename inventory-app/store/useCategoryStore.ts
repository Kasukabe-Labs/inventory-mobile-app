import { create } from "zustand";

interface Category {
  id: string;
  name: string;
}

interface CategoryStore {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (cats) => set({ categories: cats }),
}));
