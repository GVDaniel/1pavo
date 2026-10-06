import { Nutrition, Product, ProductTag } from '@/types';
import { hash } from '@/utils/hash';

type Opts = { old?: number; tags?: ProductTag[] };
type Row = [sub: string, name: string, format: string, price: number, emoji: string, opts?: Opts];

const FOOD = new Set(['bebidas', 'snacks', 'chuches', 'panaderia', 'desayuno', 'lacteos', 'helados', 'congelados', 'listo']);
const COLD = new Set(['bebidas', 'alcohol', 'helados', 'lacteos']);

const ALLERGENS: Record<string, string[]> = {
  snacks: ['Puede contener frutos de cáscara'],
  chuches: ['Puede contener leche', 'Puede contener soja'],
  panaderia: ['Gluten', 'Huevo', 'Leche'],
  desayuno: ['Gluten', 'Leche'],
  lacteos: ['Leche'],
  helados: ['Leche', 'Puede contener frutos de cáscara'],
  congelados: ['Gluten', 'Leche'],
  listo: ['Gluten', 'Huevo', 'Mostaza'],
  alcohol: ['Gluten (cebada)'],
};

const catalog: Record<string, Row[]> = {
  bebidas: [
    ['refrescos', 'Coca-Cola Original', 'Lata 33 cl', 1.2, '🥤'],
    ['refrescos', 'Coca-Cola Zero', 'Lata 33 cl', 1.2, '🥤'],
    ['refrescos', 'Fanta Naranja', 'Lata 33 cl', 1.1, '🍊'],
    ['refrescos', 'Pack Coca-Cola', 'Pack 6 x 33 cl', 5.99, '🥤', { old: 6.6 }],
    ['refrescos', 'Aquarius Limón', 'Botella 50 cl', 1.6, '🍋'],
    ['agua', 'Agua mineral', 'Botella 1,5 L', 0.9, '💧'],
    ['agua', 'Agua mineral', 'Pack 6 x 1,5 L', 3.99, '💧'],
    ['agua', 'Agua con gas', 'Botella 50 cl', 1.1, '🫧'],
    ['energeticas', 'Red Bull', 'Lata 25 cl', 1.95, '⚡'],
    ['energeticas', 'Monster Energy', 'Lata 50 cl', 1.99, '⚡', { old: 2.4 }],
    ['zumos', 'Zumo de naranja exprimido', 'Botella 1 L', 3.49, '🍊', { tags: ['recien_hecho', 'vegano'] }],
  ],
  alcohol: [
    ['cervezas', 'Mahou Cinco Estrellas', 'Lata 33 cl', 1.1, '🍺'],
    ['cervezas', 'Estrella Damm', 'Pack 6 x 33 cl', 5.49, '🍺', { old: 6.2 }],
    ['cervezas', 'Estrella Galicia', 'Botellín 25 cl', 0.95, '🍺'],
    ['cervezas', 'Cerveza tostada', 'Botella 33 cl', 1.35, '🍺', { tags: ['nuevo'] }],
    ['vinos', 'Rioja Crianza', 'Botella 75 cl', 6.99, '🍷'],
    ['vinos', 'Rueda Verdejo', 'Botella 75 cl', 5.99, '🥂'],
    ['vinos', 'Cava Brut', 'Botella 75 cl', 6.49, '🍾'],
    ['vinos', 'Tinto de verano', 'Botella 1,5 L', 2.99, '🍷'],
    ['sidra', 'Sidra natural', 'Botella 70 cl', 2.99, '🍏'],
  ],
  snacks: [
    ['patatas', 'Patatas fritas clásicas', 'Bolsa 160 g', 1.99, '🥔', { tags: ['sin_gluten'] }],
    ['patatas', 'Patatas onduladas sabor jamón', 'Bolsa 150 g', 2.1, '🥔'],
    ['patatas', 'Doritos Tex-Mex', 'Bolsa 140 g', 2.29, '🌮', { old: 2.6 }],
    ['patatas', 'Nachos con sal', 'Bolsa 200 g', 1.79, '🌮', { tags: ['vegano'] }],
    ['frutos', 'Pipas tostadas', 'Bolsa 150 g', 1.2, '🌻', { tags: ['vegano'] }],
    ['frutos', 'Cacahuetes fritos', 'Bolsa 200 g', 1.6, '🥜'],
    ['frutos', 'Mix de frutos secos', 'Bolsa 150 g', 2.99, '🥜', { tags: ['vegano'] }],
    ['saladas', 'Palomitas para microondas', 'Pack 3 x 100 g', 2.49, '🍿'],
    ['saladas', 'Gusanitos', 'Bolsa 90 g', 1.1, '🌽'],
  ],
  chuches: [
    ['gominolas', 'Ositos de goma', 'Bolsa 100 g', 1.49, '🐻'],
    ['gominolas', 'Regaliz rojo', 'Bolsa 200 g', 1.79, '🍬'],
    ['gominolas', 'Nubes', 'Bolsa 150 g', 1.59, '☁️'],
    ['gominolas', 'Chuches surtidas a granel', 'Bolsa 250 g', 2.5, '🍭', { tags: ['nuevo'] }],
    ['chocolatinas', 'Kit Kat', 'Barrita 41,5 g', 1.1, '🍫'],
    ['chocolatinas', 'Chocolate con leche', 'Tableta 100 g', 1.6, '🍫'],
    ['chocolatinas', 'Kinder Bueno', 'Pack 2 uds', 1.39, '🍫', { old: 1.6 }],
    ['chicles', 'Chicles de menta', 'Paquete 10 uds', 1.2, '🌿'],
    ['chicles', 'Chicles de fresa', 'Bote 60 g', 2.99, '🍓'],
  ],
  panaderia: [
    ['pan', 'Barra de pan', 'Unidad 250 g', 0.8, '🥖', { tags: ['recien_hecho', 'vegano'] }],
    ['pan', 'Pan de molde integral', 'Paquete 450 g', 1.99, '🍞'],
    ['pan', 'Pan de hamburguesa', 'Pack 4 uds', 1.49, '🍔'],
    ['bolleria', 'Croissant de mantequilla', 'Unidad', 1.1, '🥐', { tags: ['recien_hecho'] }],
    ['bolleria', 'Napolitana de chocolate', 'Unidad', 1.3, '🥐', { tags: ['recien_hecho'] }],
    ['bolleria', 'Donut glaseado', 'Unidad', 0.99, '🍩'],
    ['bolleria', 'Magdalenas', 'Paquete 12 uds', 2.29, '🧁', { old: 2.69 }],
    ['dulces', 'Palmera de chocolate', 'Unidad', 1.5, '🍪'],
    ['dulces', 'Ensaimada', 'Unidad', 1.4, '🥮'],
  ],
  desayuno: [
    ['cafe', 'Café en cápsulas', 'Caja 10 uds', 3.49, '☕'],
    ['cafe', 'Café con leche frío', 'Vaso 250 ml', 1.6, '🧋', { tags: ['frio'] }],
    ['cafe', 'Cacao soluble', 'Bote 390 g', 3.29, '🥄', { old: 3.79 }],
    ['cereales', 'Cereales de chocolate', 'Caja 375 g', 2.99, '🥣'],
    ['cereales', 'Copos de avena', 'Paquete 500 g', 1.49, '🌾', { tags: ['vegano'] }],
    ['untables', 'Crema de cacao y avellanas', 'Tarro 400 g', 3.99, '🍫'],
    ['untables', 'Mermelada de fresa', 'Tarro 340 g', 2.19, '🍓', { tags: ['vegano', 'sin_gluten'] }],
    ['untables', 'Mantequilla', 'Tarrina 250 g', 2.49, '🧈'],
  ],
  lacteos: [
    ['leche', 'Leche entera', 'Brik 1 L', 1.15, '🥛'],
    ['leche', 'Leche semidesnatada sin lactosa', 'Brik 1 L', 1.35, '🥛'],
    ['leche', 'Bebida de avena', 'Brik 1 L', 1.89, '🌾', { tags: ['vegano'] }],
    ['yogures', 'Yogur natural', 'Pack 4 uds', 1.49, '🥄'],
    ['yogures', 'Yogur griego', 'Pack 4 uds', 2.29, '🥄'],
    ['yogures', 'Batido de chocolate', 'Botella 200 ml', 0.99, '🍫'],
    ['quesos', 'Queso en lonchas', 'Paquete 150 g', 1.99, '🧀', { tags: ['sin_gluten'] }],
    ['quesos', 'Huevos camperos', 'Docena', 3.29, '🥚'],
  ],
  helados: [
    ['tarrinas', 'Helado de vainilla', 'Tarrina 500 ml', 3.99, '🍨'],
    ['tarrinas', 'Helado de chocolate belga', 'Tarrina 460 ml', 5.49, '🍨', { old: 5.99 }],
    ['polos', 'Polo de limón', 'Unidad', 0.99, '🍋', { tags: ['vegano'] }],
    ['polos', 'Bombón helado almendrado', 'Unidad', 2.29, '🍫'],
    ['conos', 'Cono de nata y fresa', 'Unidad', 1.79, '🍦'],
    ['conos', 'Conos de chocolate', 'Pack 4 uds', 4.49, '🍦'],
    ['conos', 'Sándwich de nata', 'Pack 6 uds', 2.99, '🍦'],
  ],
  congelados: [
    ['pizzas', 'Pizza barbacoa', 'Unidad 400 g', 3.99, '🍕'],
    ['pizzas', 'Pizza cuatro quesos', 'Unidad 390 g', 3.79, '🍕', { old: 4.29 }],
    ['hielo', 'Hielo en cubitos', 'Bolsa 2 kg', 1.5, '🧊'],
    ['hielo', 'Hielo picado', 'Bolsa 2 kg', 1.6, '🧊'],
    ['platos', 'Lasaña boloñesa', 'Bandeja 400 g', 3.49, '🍝'],
    ['platos', 'Croquetas de jamón', 'Bolsa 500 g', 2.99, '🥟'],
    ['platos', 'Patatas fritas congeladas', 'Bolsa 1 kg', 1.99, '🍟', { tags: ['vegano'] }],
    ['platos', 'Gyozas de verduras', 'Bolsa 300 g', 3.29, '🥟', { tags: ['nuevo', 'vegano'] }],
  ],
  listo: [
    ['sandwiches', 'Sándwich mixto', 'Unidad', 2.49, '🥪'],
    ['sandwiches', 'Bocadillo de tortilla', 'Unidad', 3.29, '🥖', { tags: ['recien_hecho'] }],
    ['sandwiches', 'Wrap de pollo', 'Unidad', 3.49, '🌯'],
    ['ensaladas', 'Ensalada César', 'Bol 250 g', 3.99, '🥗'],
    ['ensaladas', 'Poke de salmón', 'Bol 320 g', 5.99, '🐟', { tags: ['nuevo'] }],
    ['calientes', 'Pizza al corte', 'Porción', 2.5, '🍕', { tags: ['recien_hecho'] }],
    ['calientes', 'Empanadilla de atún', 'Unidad', 1.6, '🥟'],
    ['calientes', 'Perrito caliente', 'Unidad', 2.99, '🌭', { old: 3.5 }],
  ],
  drogueria: [
    ['papel', 'Papel higiénico', 'Pack 6 rollos', 2.99, '🧻'],
    ['papel', 'Papel de cocina', 'Pack 2 rollos', 1.99, '🧻'],
    ['papel', 'Pañuelos de papel', 'Pack 10 paquetes', 1.49, '🤧'],
    ['limpieza', 'Lavavajillas a mano', 'Botella 750 ml', 1.89, '🧽'],
    ['limpieza', 'Bolsas de basura', 'Rollo 15 uds', 1.59, '🗑️'],
    ['limpieza', 'Detergente líquido', 'Botella 1,5 L', 4.99, '🫧', { old: 5.79 }],
  ],
  higiene: [
    ['bucal', 'Pasta de dientes', 'Tubo 75 ml', 2.29, '🪥'],
    ['bucal', 'Cepillo de dientes', 'Unidad', 1.99, '🪥'],
    ['bucal', 'Enjuague bucal', 'Botella 500 ml', 3.49, '🫧'],
    ['cuidado', 'Desodorante roll-on', 'Unidad 50 ml', 2.79, '🧴'],
    ['cuidado', 'Gel de ducha', 'Botella 750 ml', 2.99, '🚿'],
    ['cuidado', 'Compresas', 'Paquete 16 uds', 2.49, '🌸'],
    ['cuidado', 'Maquinillas de afeitar', 'Pack 3 uds', 3.99, '🪒'],
  ],
  parafarmacia: [
    ['botiquin', 'Tiritas surtidas', 'Caja 20 uds', 2.49, '🩹'],
    ['botiquin', 'Suero fisiológico', 'Pack 30 monodosis', 3.29, '💧'],
    ['botiquin', 'Gel hidroalcohólico', 'Bote 100 ml', 1.99, '🧴'],
    ['botiquin', 'Termómetro digital', 'Unidad', 6.99, '🌡️'],
    ['bienestar', 'Preservativos', 'Caja 12 uds', 8.99, '💗', { old: 9.99 }],
    ['bienestar', 'Protector solar SPF 50', 'Bote 200 ml', 9.99, '☀️'],
    ['bienestar', 'Caramelos para la garganta', 'Caja 50 g', 2.49, '🍯'],
  ],
  mascotas: [
    ['perros', 'Pienso para perro adulto', 'Saco 3 kg', 8.99, '🐶'],
    ['perros', 'Snacks dentales para perro', 'Pack 7 uds', 3.49, '🦴'],
    ['perros', 'Bolsas para excrementos', 'Pack 4 rollos', 1.99, '🐕'],
    ['gatos', 'Comida húmeda para gato', 'Pack 4 x 85 g', 2.99, '🐱'],
    ['gatos', 'Arena para gatos', 'Saco 5 L', 3.99, '🐈'],
    ['gatos', 'Snacks para gato', 'Bolsa 60 g', 1.79, '🐟'],
  ],
  emergencias: [
    ['pilas', 'Pilas AA', 'Pack 4 uds', 3.99, '🔋'],
    ['pilas', 'Pilas AAA', 'Pack 4 uds', 3.99, '🔋'],
    ['cargadores', 'Cable USB-C', 'Unidad 1 m', 7.99, '🔌'],
    ['cargadores', 'Cargador de pared USB-C', 'Unidad 20 W', 12.99, '🔌'],
    ['cargadores', 'Batería externa', 'Unidad 10.000 mAh', 19.99, '🔋', { tags: ['nuevo'] }],
    ['varios', 'Mechero', 'Unidad', 1.0, '🔥'],
    ['varios', 'Paraguas plegable', 'Unidad', 6.99, '☂️'],
    ['varios', 'Linterna LED', 'Unidad', 4.99, '🔦'],
    ['varios', 'Cinta adhesiva', 'Rollo', 1.49, '📦'],
  ],
};

function nutritionFor(id: string): Nutrition {
  const h = hash(id);
  return {
    kcal: 60 + (h % 480),
    fat: Math.round(((h >> 3) % 300) / 10) / 1,
    carbs: Math.round(((h >> 5) % 700) / 10),
    sugar: Math.round(((h >> 7) % 400) / 10),
    protein: Math.round(((h >> 9) % 150) / 10),
    salt: Math.round(((h >> 11) % 25) / 10 * 10) / 10,
  };
}

export const products: Product[] = Object.entries(catalog).flatMap(([categoryId, rows]) =>
  rows.map(([sub, name, format, price, emoji, opts], i) => {
    const id = `p-${categoryId}-${i + 1}`;
    const tags = new Set<ProductTag>(opts?.tags ?? []);
    if (opts?.old) tags.add('oferta');
    if (COLD.has(categoryId)) tags.add('frio');
    const ageRestricted = categoryId === 'alcohol';
    if (ageRestricted) tags.add('mas18');
    return {
      id,
      name,
      format,
      categoryId,
      subcategoryId: sub,
      emoji,
      description: `${name} en formato ${format.toLowerCase()}. Lo preparamos al momento en tu tienda 1pavo más cercana, a cualquier hora.`,
      tags: [...tags],
      ageRestricted,
      basePrice: price,
      baseOldPrice: opts?.old,
      nutrition: FOOD.has(categoryId) ? nutritionFor(id) : undefined,
      allergens: ALLERGENS[categoryId],
      popularity: hash(id) % 100,
    } satisfies Product;
  }),
);
