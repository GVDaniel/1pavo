# 1pavo · App de delivery 24 h (mockup React Native)

Mockup navegable de la app de 1pavo, la cadena de tiendas 24 horas. Construida con **Expo + TypeScript + Expo Router**, multitenancy por ciudad y tienda, y una capa de datos que alterna entre datos simulados y tu backend real.

## Arrancar

```bash
npm install
npx expo install --fix   # alinea las versiones con el SDK de Expo instalado
npx expo start
```

Abre la app en Expo Go (iOS/Android) o en un simulador. En simulador, usa el botón **"Probar con una ubicación de demo (Madrid)"** de la pantalla de ubicación.

Datos de prueba:

- **Código SMS:** cualquier número de 6 cifras, excepto `000000`, que simula un código incorrecto.
- **Tarjeta:** `4242 4242 4242 4242`. Las tarjetas que terminan en `0000` se rechazan.
- **Cupones:** `BIENVENIDA`, `1PAVO` y `NOCHE` (este último solo vale de 00:00 a 6:00).

> Si quieres actualizar a un SDK de Expo más reciente: `npx expo install expo@latest --fix`.

## Estructura

```
src/
  app/            Pantallas (Expo Router, rutas por archivo)
  components/     Componentes reutilizables (PriceTag, ProductCard, BottomSheet…)
  theme/          tokens.ts (marca) + ThemeProvider
  api/            client.ts, repositories.ts (contratos), mock/ y http/
  hooks/          queries.ts (TanStack Query), useCategoryHue
  store/          Zustand persistido: auth, tenant, cart, prefs, toast
  features/       Lógica de negocio: precios, cambio de ubicación, repetir pedido
  mocks/          Ciudades, tiendas, catálogo, usuario, promos
  i18n/           es.ts (todas las cadenas)
  utils/          Formato, geo, horarios, háptica
```

## Cambiar la marca

Todo está en **`src/theme/tokens.ts`**:

- `palette`: los colores base.
- `lightColors` / `darkColors`: los tokens semánticos que usan los componentes.
- `fonts` / `typeScale`: las tipografías. Si cambias de familia, cárgala también en `src/app/_layout.tsx`.
- `nightMode`: el horario del modo noche automático.

La pantalla **Perfil → Design system** (`/dev/design-system`) muestra todos los tokens y componentes, para validar un cambio de paleta de un vistazo.

El logo es provisional (`src/components/Logo.tsx`). Sustitúyelo por el SVG definitivo, por ejemplo con `react-native-svg`.

## Multitenancy

- **Tenant = ciudad.** Cada ciudad tiene varias tiendas, y cada tienda su propio precio y stock.
- **Resolución de tienda.** Ubicación → ciudad (radio de 35 km) → tienda más cercana con cobertura. Está en `api/mock/tenant.ts` y la aplica `features/tenant/useSwitchLocation.ts`.
- **Cambio de dirección.** Al cambiar de tienda, la cesta se revalida: se marcan los productos no disponibles y se actualizan los precios.
- **Configuración por ciudad** (`TenantConfig`): envío, mínimo, umbral de envío gratis, tiempo estimado, franja de venta de alcohol, métodos de pago y *feature flags* (propinas, pedidos programados, chat).
- **Cabeceras.** Todas las peticiones HTTP envían `X-Tenant-Id` y `X-Store-Id` (`api/client.ts`).

Para **añadir una ciudad o tienda** en el mock, edita `src/mocks/tenants.ts`.

## Conectar el backend real

1. En `.env`, pon `EXPO_PUBLIC_USE_MOCKS=false` y `EXPO_PUBLIC_API_URL=https://tu-api`.
2. Ajusta las rutas y los payloads en **`src/api/http/index.ts`** (tiene comentarios `TODO(backend)`).
3. Los contratos están en `src/api/repositories.ts` y los tipos en `src/types/index.ts`. Las pantallas no cambian.

Pendientes de producción:

- **Tarjetas:** tokenizarlas con tu pasarela (Stripe, Redsys…) en lugar de enviar el número.
- **Seguimiento:** hoy hace *polling* cada 2 s (`useOrder(id, true)`). Se puede sustituir por WebSocket o SSE.
- **Direcciones nuevas:** falta geocodificarlas (`account/addresses.tsx`).
- **Login con Apple y Google:** integrar `expo-apple-authentication` y `expo-auth-session`.
- **Mapas en Android:** para la build de producción hace falta una API key de Google Maps en `app.json`.

Para probar los estados de error, sube `EXPO_PUBLIC_MOCK_ERROR_RATE` (por ejemplo, `0.2`).

## Decisiones técnicas

- **Bottom sheet propio** (Modal + Reanimated) en vez de `@gorhom/bottom-sheet`, para no añadir dependencias nativas en el mockup. La API está aislada en `components/BottomSheet.tsx`.
- **`FlatList`** en vez de `FlashList`. Con catálogos grandes conviene cambiar a FlashList en `ProductGrid` y `ProductRail`.
- **Validación de formularios simple**, sin zod ni react-hook-form. Añádelos si los formularios crecen.
- **Imágenes de producto:** si el producto trae `image` se usa esa imagen (con `expo-image`); si no, se muestra un tile tintado con emoji.

## Legal y alcohol

- En España no se puede vender **tabaco** a distancia, así que no aparece en el catálogo.
- Las **franjas de venta de alcohol** de los mocks son de ejemplo. Varían según comunidad y municipio, y deben venir del backend.
- La app comprueba la franja horaria y pide confirmar la mayoría de edad; el DNI se verifica en la entrega.
- Los textos legales de `account/legal.tsx` son provisionales.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm run format
```
