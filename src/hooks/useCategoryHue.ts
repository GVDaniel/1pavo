import { useCategories } from './queries';

const FALLBACK = '#98A0B4';

export function useCategoryHue(categoryId?: string) {
  const { data } = useCategories();
  return data?.find((c) => c.id === categoryId)?.hue ?? FALLBACK;
}
