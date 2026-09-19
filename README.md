# OrderFast

Plataforma de pedidos para cafetería/pastelería: los clientes piden desde la mesa (vía QR) o para llevar, sin necesidad de crear una cuenta, y el staff atiende y despacha los pedidos desde un panel. Login opcional solo para acceder a beneficios (puntos y cupones de fidelización).

Proyecto universitario, adaptado del concepto original **MitrufelyWeb** (una tienda de pastelería en FastAPI + React) hacia un modelo más simple de cafetería con pedidos para mesa/para llevar, backend reconstruido desde cero en **Express + TypeScript**.

## Demo

| Recurso | URL |
|---|---|
| API en producción | https://orderfast-backend.vercel.app |
| Documentación interactiva (Swagger) | https://orderfast-backend.vercel.app/api/docs/ |
| Health check | https://orderfast-backend.vercel.app/health |

## Stack tecnológico

- **Backend:** Express + TypeScript, desplegado en Vercel (Functions, detección zero-config de Express)
- **Base de datos:** MongoDB Atlas (free tier) + Mongoose
- **Autenticación:** Supabase Auth (JWT firmado con ES256, verificado contra el JWKS del proyecto — sin backend propio de login/logout/refresh)
- **Tiempo real:** Supabase Realtime (Broadcast) — ver [`docs/FLUJO_Y_MEJORA.md`](docs/FLUJO_Y_MEJORA.md)
- **Documentación de API:** OpenAPI 3.0 servido con Swagger UI
- **Validación:** Zod, con mensajes de error centralizados y en español
- **QR:** generación de códigos QR por mesa con la librería `qrcode`

## Estructura del repo

```
OrderFast/
├── backend/        # API Express + TypeScript (este documento cubre todo lo que hay aquí)
└── frontend/        # (pendiente — el equipo de frontend lo agrega en esta carpeta)
```

---

## Cómo levantar el proyecto localmente

```bash
cd backend
npm install
cp .env.example .env
# completar .env con tus credenciales (ver tabla de variables más abajo)
npm run dev
```

El servidor queda en `http://localhost:4000`, con Swagger en `http://localhost:4000/api/docs`.

### Variables de entorno (`backend/.env`)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NODE_ENV` | No (default `development`) | `development` / `production` / `test` |
| `PORT` | No (default `4000`) | Puerto del servidor local |
| `ALLOWED_ORIGINS` | No | Orígenes permitidos por CORS, separados por coma |
| `MONGODB_URI` | **Sí** | Connection string de MongoDB Atlas |
| `FRONTEND_URL` | No (default `http://localhost:5173`) | URL pública del frontend; se usa para armar el link que codifica el QR de cada mesa |
| `SUPABASE_URL` | **Sí** | URL del proyecto de Supabase |
| `SUPABASE_ANON_KEY` | **Sí** | Publishable key de Supabase (pública, segura de compartir) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sí** | Secret key de Supabase (solo backend, nunca compartir) |
| `AVERAGE_PREP_MINUTES` | No (default `5`) | Minutos promedio de preparación por pedido, usado en `/orders/wait-estimate` |

### Scripts disponibles

| Script | Uso |
|---|---|
| `npm run dev` | Levanta el servidor local con recarga automática |
| `npm run build` | Compila TypeScript (`tsc`) |
| `npm run typecheck` | Solo valida tipos, sin generar archivos |
| `npm run promote-user -- <email> <ROL>` | Sube el rol de un usuario ya logueado a `CUSTOMER`/`STAFF`/`ADMIN`. Necesario para crear el primer `ADMIN` del sistema |
| `npm run get-token -- <email> <password>` | Genera un `access_token` de Supabase para pegar en el botón "Authorize" de Swagger, sin usar el SDK ni escribir código |

---

## Cómo probar la API sin instalar nada

1. Abre https://orderfast-backend.vercel.app/api/docs/
2. Consigue un token de acceso. Dos formas:
   - **Con el SDK real** (lo que hace la app de verdad): `@supabase/supabase-js` → `signUp` / `signInWithPassword` → `session.access_token`.
   - **Rápido, sin código** (para pruebas manuales): pega esto en la terminal reemplazando el correo/clave por un usuario tuyo de Supabase:
     ```bash
     curl -X POST "https://vmlqsxaovxwnnzfmqsub.supabase.co/auth/v1/token?grant_type=password" \
       -H "apikey: sb_publishable_dyEBP-pnJfDjVhNy6Vqf2g_115RT-yr" \
       -H "Content-Type: application/json" \
       -d '{"email":"tu-correo","password":"tu-clave"}'
     ```
3. Copia el `access_token` de la respuesta y pégalo en el botón **Authorize** de Swagger (sin la palabra `Bearer`, Swagger la agrega sola).
4. Si necesitas probar endpoints de `ADMIN`/`STAFF`, alguien con acceso al backend debe correr `npm run promote-user -- tu-correo ADMIN` una vez (el usuario debe haber iniciado sesión al menos una vez antes, para que exista su perfil).

No hay endpoints de login/logout/refresh en esta API — eso lo maneja Supabase directamente. El backend solo verifica el token ya emitido.

---

## Módulos del backend

### `auth` — Autenticación y autorización
No expone rutas propias. Verifica el JWT de Supabase (firmado ES256) contra el JWKS del proyecto (`{SUPABASE_URL}/auth/v1/.well-known/jwks.json`), sin necesidad de un secreto compartido. En el primer request autenticado de un usuario nuevo, se crea automáticamente su perfil de negocio en Mongo con rol `CUSTOMER`. Tres modos:
- `requireAuth`: bloquea si no hay token válido.
- `optionalAuth`: intenta verificar el token si viene, pero nunca bloquea — permite que invitados y usuarios logueados compartan el mismo endpoint (ej. crear un pedido).
- `requireRole(...roles)`: exige uno de los roles indicados.

### `users` — Perfiles y roles
CRUD mínimo sobre el perfil reflejado en Mongo. Un `ADMIN` puede listar usuarios y cambiar el rol de cualquiera.

### `categories` — Categorías del menú
CRUD con slug automático y soft delete. Lectura **pública** (sin login) para que cualquiera pueda ver la carta escaneando el QR de una mesa. El campo `order` define el orden manual de aparición en el menú.

### `products` — Productos del menú
CRUD con soft delete. Lectura pública. Incluye control de stock **opcional** (`stock: null` = sin límite, ej. una bebida que siempre se puede preparar) y un endpoint dedicado para marcar disponibilidad rápida ("se acabó el producto X") sin tocar el resto de sus datos.

### `tables` — Mesas
CRUD de mesas (solo `ADMIN`). Cada mesa tiene un estado `FREE`/`OCCUPIED` que se actualiza automáticamente según haya o no pedidos activos sobre ella. Lectura por id **pública** (necesaria para que el QR funcione sin login) y un endpoint que genera el **QR en PNG** apuntando a `{FRONTEND_URL}/mesa/{id}`.

### `orders` — Pedidos (el módulo central)
Creación de pedidos con o sin sesión iniciada (exige `guestName` si no hay login), cálculo de subtotal/descuento/total, aplicación opcional de un cupón, control transaccional de stock, y una **máquina de estados finita (FSM)** para el ciclo de vida:

```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED
   ↓           ↓            ↓
CANCELLED ─────┴────────────┘
   ↓
REFUNDED ← (también desde DELIVERED)
```

Todo el avance de estado pasa por **un solo endpoint** (`PATCH /orders/{id}/status`) con la acción en el body, no una ruta por transición. Ver detalle de permisos por acción en la tabla de endpoints más abajo, y el flujo completo en [`docs/FLUJO_Y_MEJORA.md`](docs/FLUJO_Y_MEJORA.md).

### `loyalty` — Fidelización (puntos y cupones)
- Configuración de la tasa de conversión (`pointsPerCurrencyUnit`, cuántos puntos se ganan por unidad monetaria gastada).
- Ledger de puntos append-only (nunca se edita ni borra un movimiento, solo se agregan nuevos) con una validación central: **el saldo nunca puede quedar negativo**.
- Catálogo de recompensas canjeables por puntos (`CouponTemplate`) y los cupones ya canjeados por cada cliente (`Coupon`).
- Los puntos se otorgan automáticamente al `deliver` un pedido (solo si tiene cliente autenticado) y se revierten al `refund` — si el cliente ya gastó esos puntos en otro canje, el reembolso se bloquea en vez de dejar el saldo negativo.

### `notifications` — Notificaciones al cliente
Feed de notificaciones por usuario (no hay notificaciones "para todo el staff" — para eso ya alcanza con filtrar `GET /orders?status=PENDING`). Cada cambio de estado de un pedido genera una notificación automática para el cliente dueño del pedido.

---

## Diccionario de campos

### `User`
| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Id interno de Mongo |
| `supabaseUserId` | string | Id del usuario en Supabase Auth (vínculo entre ambos sistemas) |
| `email` | string | Correo (en minúsculas) |
| `name` | string | Nombre, vacío por defecto |
| `phone` | string | Teléfono, vacío por defecto |
| `role` | `CUSTOMER` \| `STAFF` \| `ADMIN` | Rol de negocio (no viene de Supabase, vive solo en Mongo) |
| `isActive` | boolean | Si es `false`, no puede autenticarse |

### `Category`
| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre, único |
| `slug` | string | Generado automáticamente a partir de `name` |
| `order` | number | Orden manual de aparición en el menú (default `0`, desempata alfabéticamente) |
| `isActive` | boolean | Soft delete |

### `Product`
| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre del producto |
| `description` | string | Descripción, opcional |
| `price` | number | Precio unitario |
| `imageUrl` | string | URL de la imagen, opcional |
| `category` | ObjectId → `Category` | Categoría a la que pertenece |
| `stock` | number \| `null` | `null` = sin control de stock (se prepara siempre); número = unidades disponibles hoy |
| `isAvailable` | boolean | Disponibilidad rápida ("se acabó por hoy") sin tocar el resto de los datos |
| `isActive` | boolean | Soft delete |

### `Table` (mesa)
| Campo | Tipo | Descripción |
|---|---|---|
| `number` | number | Número de mesa, único |
| `capacity` | number | Capacidad de personas (default `4`) |
| `status` | `FREE` \| `OCCUPIED` | Se actualiza solo según haya pedidos activos sobre la mesa |
| `isActive` | boolean | Soft delete |

### `Order` (pedido)
| Campo | Tipo | Descripción |
|---|---|---|
| `customer` | ObjectId → `User` \| `null` | `null` si es un pedido de invitado |
| `guestName` | string | Obligatorio si no hay `customer` |
| `guestPhone` | string | Opcional, solo para invitados |
| `type` | `DINE_IN` \| `TAKEAWAY` | Tipo de pedido |
| `table` | ObjectId → `Table` \| `null` | Obligatorio si `type = DINE_IN` |
| `items` | `OrderItem[]` | Ver tabla siguiente |
| `subtotal` | number | Suma de los `items` antes de descuento |
| `discount` | number | Monto descontado por el cupón aplicado, si hubo |
| `appliedCoupon` | ObjectId → `Coupon` \| `null` | Cupón usado en este pedido |
| `total` | number | `subtotal - discount` |
| `pointsEarned` | number | Puntos otorgados al cliente cuando el pedido llegó a `DELIVERED` |
| `status` | ver FSM arriba | Estado actual |
| `statusHistory` | `OrderHistoryEntry[]` | Auditoría de cada cambio de estado |
| `notes` | string | Notas del cliente al crear el pedido |

**`OrderItem`** (snapshot del producto al momento de la compra, no cambia si el producto cambia después):
| Campo | Tipo | Descripción |
|---|---|---|
| `product` | ObjectId → `Product` | Referencia al producto |
| `productName` | string | Nombre del producto al momento de la compra |
| `unitPrice` | number | Precio unitario al momento de la compra |
| `quantity` | number | Cantidad pedida |
| `subtotal` | number | `unitPrice × quantity` |

**`OrderHistoryEntry`**:
| Campo | Tipo | Descripción |
|---|---|---|
| `status` | string | Estado al que se transicionó |
| `date` | Date | Cuándo ocurrió |
| `comment` | string | Comentario opcional de quien hizo la transición |
| `updatedBy` | ObjectId → `User` \| `null` | Quién la ejecutó (`null` si fue un invitado) |

### `CouponTemplate` (recompensa canjeable)
| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre de la recompensa |
| `pointsCost` | number | Puntos necesarios para canjearla |
| `discountType` | `PERCENTAGE` \| `FIXED_AMOUNT` | Tipo de descuento |
| `discountValue` | number | Porcentaje o monto fijo, según `discountType` |
| `validityDays` | number | Días de validez del cupón una vez canjeado (default `30`) |
| `isActive` | boolean | Soft delete |

### `Coupon` (instancia canjeada por un cliente)
| Campo | Tipo | Descripción |
|---|---|---|
| `customer` | ObjectId → `User` | Dueño del cupón |
| `template` | ObjectId → `CouponTemplate` | Recompensa de la que proviene |
| `uniqueCode` | string | Código único a enviar en `couponCode` al crear un pedido |
| `status` | `AVAILABLE` \| `USED` \| `EXPIRED` | `EXPIRED` se marca de forma perezosa al leer, si ya venció |
| `expiresAt` | Date | Fecha de expiración |
| `usedAt` | Date \| `null` | Cuándo se usó |
| `usedInOrder` | ObjectId → `Order` \| `null` | En qué pedido se aplicó |

### `PointsLedgerEntry` (movimiento del ledger de puntos)
| Campo | Tipo | Descripción |
|---|---|---|
| `customer` | ObjectId → `User` | Cliente dueño del movimiento |
| `type` | `PURCHASE_ACCRUAL` \| `COUPON_REDEMPTION` \| `ADMIN_ADJUSTMENT` | Origen del movimiento |
| `amount` | number | Positivo suma, negativo resta |
| `resultingBalance` | number | Saldo total después de este movimiento (nunca negativo) |
| `order` | ObjectId → `Order` \| `null` | Pedido relacionado, si aplica |
| `description` | string | Descripción legible del movimiento |

### `LoyaltyConfig`
| Campo | Tipo | Descripción |
|---|---|---|
| `pointsPerCurrencyUnit` | number | Puntos otorgados por cada unidad monetaria del `total` del pedido (default `1`) |

### `Notification`
| Campo | Tipo | Descripción |
|---|---|---|
| `user` | ObjectId → `User` | Destinatario |
| `type` | `ORDER_UPDATED` \| `NEW_ORDER` \| `COUPON_EARNED` \| `SYSTEM` | Tipo de notificación |
| `title` | string | Título corto |
| `message` | string | Mensaje completo |
| `order` | ObjectId → `Order` \| `null` | Pedido relacionado, si aplica |
| `isRead` | boolean | Si ya fue leída |

---

## Lista de endpoints

Todos bajo el prefijo `/api/v1`, salvo `/health` y `/api/docs`. Formato de respuesta uniforme en toda la API: `{ success, data, message }` en éxito, `{ success, error: { message, details? } }` en error.

### Salud y documentación
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | Pública | Estado del servicio y de la conexión a MongoDB |
| GET | `/api/docs` | Pública | Swagger UI (o el JSON del spec con `Accept: application/json`) |

### Categorías (`/categories`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/categories` | Pública | Listar categorías activas |
| GET | `/categories/{id}` | Pública | Obtener una categoría |
| POST | `/categories` | ADMIN | Crear categoría |
| PATCH | `/categories/{id}` | ADMIN | Actualizar categoría |
| DELETE | `/categories/{id}` | ADMIN | Eliminar (soft delete) |

### Productos (`/products`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/products` | Pública | Listar productos activos (`?category=<id>` opcional) |
| GET | `/products/{id}` | Pública | Obtener un producto |
| POST | `/products` | ADMIN | Crear producto |
| PATCH | `/products/{id}` | ADMIN | Actualizar producto |
| PATCH | `/products/{id}/availability` | STAFF o ADMIN | Cambiar disponibilidad rápida |
| DELETE | `/products/{id}` | ADMIN | Eliminar (soft delete) |

### Usuarios (`/users`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/users/me` | Cualquier autenticado | Perfil propio |
| GET | `/users` | ADMIN | Listar todos los usuarios |
| PATCH | `/users/{id}/role` | ADMIN | Cambiar el rol de un usuario |

### Mesas (`/tables`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/tables` | STAFF o ADMIN | Listar mesas activas |
| GET | `/tables/{id}` | Pública | Obtener una mesa (usado por el QR) |
| GET | `/tables/{id}/qr` | ADMIN | Descargar el QR de la mesa (PNG) |
| POST | `/tables` | ADMIN | Crear mesa |
| PATCH | `/tables/{id}` | ADMIN | Actualizar mesa |
| DELETE | `/tables/{id}` | ADMIN | Eliminar (soft delete) |

### Pedidos (`/orders`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/orders` | Opcional | Crear pedido (con o sin sesión) |
| GET | `/orders` | STAFF o ADMIN | Listar pedidos (`?status=<estado>` opcional) |
| GET | `/orders/wait-estimate` | Pública | Estimación de tiempo de espera actual |
| GET | `/orders/{id}` | Pública | Obtener un pedido (seguimiento, incluso de invitados) |
| PATCH | `/orders/{id}/status` | Depende de la `action` (ver abajo) | Único endpoint para toda la FSM |

Permisos por `action` en `PATCH /orders/{id}/status`:

| `action` | Transición | Quién puede |
|---|---|---|
| `confirm` | `PENDING → CONFIRMED` | STAFF o ADMIN |
| `prepare` | `CONFIRMED → PREPARING` | STAFF o ADMIN |
| `markReady` | `PREPARING → READY` | STAFF o ADMIN |
| `deliver` | `READY → DELIVERED` (otorga puntos) | STAFF o ADMIN |
| `refund` | `DELIVERED`/`CANCELLED → REFUNDED` (revierte puntos) | Solo ADMIN |
| `cancel` | `PENDING`/`CONFIRMED`/`PREPARING → CANCELLED` | STAFF/ADMIN en cualquiera de esos 3 estados; el dueño autenticado o un invitado **solo** mientras sigue `PENDING` |

### Fidelización (`/loyalty`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/loyalty/config` | Pública | Ver configuración de puntos |
| PATCH | `/loyalty/config` | ADMIN | Actualizar tasa de conversión |
| GET | `/loyalty/points/me` | Cualquier autenticado | Saldo de puntos propio |
| GET | `/loyalty/points/me/history` | Cualquier autenticado | Historial de movimientos propio |
| POST | `/loyalty/points/{id}/adjust` | ADMIN | Ajuste manual de puntos de un usuario |
| GET | `/loyalty/coupon-templates` | Cualquier autenticado | Listar recompensas canjeables |
| POST | `/loyalty/coupon-templates` | ADMIN | Crear recompensa |
| PATCH | `/loyalty/coupon-templates/{id}` | ADMIN | Actualizar recompensa |
| DELETE | `/loyalty/coupon-templates/{id}` | ADMIN | Eliminar (soft delete) |
| GET | `/loyalty/coupons/me` | Cualquier autenticado | Listar mis cupones |
| POST | `/loyalty/coupons/redeem` | Cualquier autenticado | Canjear puntos por un cupón |

### Notificaciones (`/notifications`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/notifications/me` | Cualquier autenticado | Listar mis notificaciones |
| GET | `/notifications/me/unread-count` | Cualquier autenticado | Cantidad de no leídas (para la campanita) |
| PATCH | `/notifications/{id}/read` | Cualquier autenticado | Marcar una como leída |
| PATCH | `/notifications/read-all` | Cualquier autenticado | Marcar todas como leídas |

---

## Más documentación

- [`docs/FLUJO_Y_MEJORA.md`](docs/FLUJO_Y_MEJORA.md) — cómo interactúan los módulos entre sí, el flujo completo de un pedido de punta a punta, y el detalle técnico de la mejora/innovación del proyecto (notificaciones en tiempo real + estimación de espera).
