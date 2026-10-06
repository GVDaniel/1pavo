import { Category } from '@/types';

export const categories: Category[] = [
  { id: 'bebidas', name: 'Bebidas frías', emoji: '🥤', hue: '#3BA7FF', subcategories: [{ id: 'refrescos', name: 'Refrescos' }, { id: 'agua', name: 'Agua' }, { id: 'energeticas', name: 'Energéticas' }, { id: 'zumos', name: 'Zumos' }] },
  { id: 'alcohol', name: 'Cervezas y vinos', emoji: '🍺', hue: '#F2A900', ageRestricted: true, subcategories: [{ id: 'cervezas', name: 'Cervezas' }, { id: 'vinos', name: 'Vinos y cavas' }, { id: 'sidra', name: 'Sidra' }] },
  { id: 'snacks', name: 'Snacks y patatas', emoji: '🥨', hue: '#FF8A3D', subcategories: [{ id: 'patatas', name: 'Patatas' }, { id: 'frutos', name: 'Frutos secos' }, { id: 'saladas', name: 'Para picar' }] },
  { id: 'chuches', name: 'Chuches', emoji: '🍬', hue: '#FF3D71', subcategories: [{ id: 'gominolas', name: 'Gominolas' }, { id: 'chocolatinas', name: 'Chocolatinas' }, { id: 'chicles', name: 'Chicles' }] },
  { id: 'panaderia', name: 'Panadería y bollería', emoji: '🥐', hue: '#D9892B', subcategories: [{ id: 'pan', name: 'Pan' }, { id: 'bolleria', name: 'Bollería' }, { id: 'dulces', name: 'Dulces' }] },
  { id: 'desayuno', name: 'Desayuno', emoji: '☕', hue: '#A86B3C', subcategories: [{ id: 'cafe', name: 'Café y cacao' }, { id: 'cereales', name: 'Cereales' }, { id: 'untables', name: 'Para untar' }] },
  { id: 'lacteos', name: 'Lácteos y huevos', emoji: '🥛', hue: '#6FA8DC', subcategories: [{ id: 'leche', name: 'Leche y bebidas' }, { id: 'yogures', name: 'Yogures' }, { id: 'quesos', name: 'Quesos y huevos' }] },
  { id: 'helados', name: 'Helados', emoji: '🍦', hue: '#C77DFF', subcategories: [{ id: 'tarrinas', name: 'Tarrinas' }, { id: 'polos', name: 'Polos' }, { id: 'conos', name: 'Conos y sándwich' }] },
  { id: 'congelados', name: 'Congelados', emoji: '🧊', hue: '#38BDF8', subcategories: [{ id: 'pizzas', name: 'Pizzas' }, { id: 'hielo', name: 'Hielo' }, { id: 'platos', name: 'Platos' }] },
  { id: 'listo', name: 'Listo para comer', emoji: '🥪', hue: '#22C55E', subcategories: [{ id: 'sandwiches', name: 'Sándwiches' }, { id: 'ensaladas', name: 'Ensaladas y bowls' }, { id: 'calientes', name: 'Calientes' }] },
  { id: 'drogueria', name: 'Droguería', emoji: '🧻', hue: '#64748B', subcategories: [{ id: 'papel', name: 'Papel' }, { id: 'limpieza', name: 'Limpieza' }] },
  { id: 'higiene', name: 'Higiene', emoji: '🪥', hue: '#14B8A6', subcategories: [{ id: 'bucal', name: 'Higiene bucal' }, { id: 'cuidado', name: 'Cuidado personal' }] },
  { id: 'parafarmacia', name: 'Parafarmacia', emoji: '🩹', hue: '#EF4444', subcategories: [{ id: 'botiquin', name: 'Botiquín' }, { id: 'bienestar', name: 'Bienestar' }] },
  { id: 'mascotas', name: 'Mascotas', emoji: '🐾', hue: '#8B5CF6', subcategories: [{ id: 'perros', name: 'Perros' }, { id: 'gatos', name: 'Gatos' }] },
  { id: 'emergencias', name: 'Emergencias y electrónica', emoji: '🔋', hue: '#EAB308', subcategories: [{ id: 'pilas', name: 'Pilas' }, { id: 'cargadores', name: 'Cargadores' }, { id: 'varios', name: 'Para salir del paso' }] },
];

export const categoryById = (id: string) => categories.find((c) => c.id === id);
