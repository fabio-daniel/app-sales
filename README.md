# App de Ventas – Angular

Front en Angular 16 para gestionar productos y ventas. Consume la API de Laravel del repositorio
[grupokimtek/api-sales](https://github.com/grupokimtek/api-sales).

## Demo en línea

| | URL |
|---|---|
| **Aplicación** | https://demo.ackee-company.com |
| **API que consume** | https://api-demo.ackee-company.com/api |

## Qué incluye

- **Resumen (inicio):** indicadores (total vendido, ventas, unidades, descuentos), ventas de los últimos 14 días,
  participación por producto, productos más vendidos y últimas ventas. Los gráficos son SVG/CSS propios, sin
  librerías.
- **Productos:** lista con miniatura (al hacer clic se abre la imagen en grande), filtros por texto, precio y stock, y
  paginación.
- **Nueva venta (tipo carrito):** catálogo con búsqueda y carrito con cantidades, descuento por producto (0 a 10 %),
  validación de stock en pantalla y un **modal de confirmación** con todos los datos antes de registrar.
- **Ventas:** lista con cliente, fecha y total; filtros (texto, fechas y rango de total); paginación; modal con el
  detalle completo de cada venta (productos, descuentos y totales); y eliminación con confirmación.
- **Tema claro y oscuro** con selector (sol / luna) en el menú. Se recuerda la elección.

## Requisitos

- Node.js **16.14 o superior** (se probó con 20) y npm
- La API en ejecución (local o la de la demo)

## Instalación y ejecución

```bash
git clone https://github.com/grupokimtek/app-sales.git
cd app-sales
npm ci
npm start
```

La aplicación queda en `http://localhost:4200`.

Por defecto apunta a la API local `http://127.0.0.1:8000/api` (ver `php artisan serve` en el repositorio de la
API). Para usar la API de la demo, cambia `apiUrl` en `src/environments/environment.ts` por
`https://api-demo.ackee-company.com/api`.

## Configuración

Los valores están en `src/environments/`:

| Archivo | Cuándo se usa |
|---|---|
| `environment.ts` | Desarrollo (`npm start`). |
| `environment.prod.ts` | Compilado de producción (`npm run build`). |

| Variable | Descripción |
|---|---|
| `apiUrl` | URL base de la API. Debe terminar en `/api`. |
| `userId` | Usuario estático con el que se registran las ventas (`1`, como pide la prueba). |
| `currency` | Símbolo que se antepone a los montos (`'Bs.'`, `'S/'`…). Vacío = sin símbolo. |

## Compilar para producción

```bash
npm run build
```

El resultado queda en `dist/budget-buddy-app/`. Todo su contenido se sube a la carpeta pública del servidor.

El archivo `src/.htaccess` se copia al compilado y hace que las rutas de Angular (`/sales`, `/products`…) funcionen
al recargar la página en servidores Apache.

## Estructura

```text
src/app/
├── components/
│   ├── home/           # Resumen con indicadores y gráficos
│   ├── products/       # Lista de productos (filtros y paginación)
│   ├── sale-form/      # Nueva venta: catálogo, carrito y confirmación
│   ├── sales/          # Lista de ventas, filtros y modal de detalle
│   ├── paginator/      # Paginación reutilizable
│   ├── thumb/          # Miniatura de producto con vista ampliada
│   ├── image-viewer/   # Visor de imágenes
│   └── navbar/         # Menú y selector de tema
├── services/           # Acceso a la API, avisos, tema, visor de imágenes
├── models/             # Interfaces de producto y venta
├── pipes/              # money: formato de montos
└── utils/              # Utilidades de texto y fechas
src/assets/scss/        # Estilos globales: tema, tablas, filtros
```

## Notas

- La validación de stock y de descuento del front es una ayuda al usuario. La validación definitiva la hace la API.
- Los filtros y la paginación se aplican en el navegador sobre el listado que devuelve la API.
- Se necesita conexión a internet para ver las imágenes de los productos (están alojadas en Unsplash).
