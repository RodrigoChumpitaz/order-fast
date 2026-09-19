# Flujo entre módulos y la mejora del proyecto

## 1. Cómo interactúan los módulos

> **Cómo importarlo a draw.io:** abre [app.diagrams.net](https://app.diagrams.net) → `Extras` → `Editar diagrama...` → pega el bloque XML de abajo completo → `Reemplazar`.

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Flujo OrderFast" id="orderfast-flow">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1080" pageHeight="700" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <mxCell id="authSupabase" value="Supabase Auth" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="authMw" value="auth (middleware)&#10;verifica JWT contra JWKS" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="300" y="40" width="220" height="60" as="geometry" />
        </mxCell>
        <mxCell id="users" value="users&#10;(perfil + rol en Mongo)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="660" y="40" width="180" height="60" as="geometry" />
        </mxCell>

        <mxCell id="categories" value="categories" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="40" y="220" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="products" value="products" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="300" y="220" width="200" height="60" as="geometry" />
        </mxCell>

        <mxCell id="tables" value="tables&#10;(mesas)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="40" y="420" width="180" height="70" as="geometry" />
        </mxCell>
        <mxCell id="orders" value="orders&#10;(módulo central + FSM)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="340" y="400" width="240" height="100" as="geometry" />
        </mxCell>

        <mxCell id="loyalty" value="loyalty&#10;(puntos / cupones)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
          <mxGeometry x="160" y="600" width="180" height="70" as="geometry" />
        </mxCell>
        <mxCell id="notifications" value="notifications&#10;(feed al cliente)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
          <mxGeometry x="400" y="600" width="200" height="70" as="geometry" />
        </mxCell>
        <mxCell id="realtime" value="Supabase Realtime&#10;(broadcast al staff)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
          <mxGeometry x="660" y="600" width="200" height="70" as="geometry" />
        </mxCell>

        <mxCell id="e1" value="JWT" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;" edge="1" parent="1" source="authSupabase" target="authMw">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e2" value="crea/lee perfil" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;" edge="1" parent="1" source="authMw" target="users">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e3" value="role (CUSTOMER/STAFF/ADMIN)" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;dashed=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.85;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="users" target="orders">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e4" value="define" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;" edge="1" parent="1" source="categories" target="products">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e5" value="referencia (items)" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.3;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="products" target="orders">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e6" value="asigna si type=DINE_IN" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;exitX=0;exitY=0.3;exitDx=0;exitDy=0;entryX=1;entryY=0.3;entryDx=0;entryDy=0;" edge="1" parent="1" source="orders" target="tables">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e7" value="libera/ocupa según pedidos activos" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;dashed=1;exitX=1;exitY=0.7;exitDx=0;exitDy=0;entryX=0;entryY=0.7;entryDx=0;entryDy=0;" edge="1" parent="1" source="tables" target="orders">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e8" value="otorga / revierte puntos" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;exitX=0.2;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="orders" target="loyalty">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e9" value="crea notificación" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="orders" target="notifications">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e10" value="broadcast evento" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;exitX=0.85;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="orders" target="realtime">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

- **`auth`** no es un módulo con datos propios: es el punto de entrada que traduce un JWT de Supabase en un documento `User` de Mongo (creándolo si es la primera vez que ese usuario llega).
- **`categories`** y **`products`** son de solo lectura pública — cualquiera que escanee el QR de una mesa los puede ver sin loguearse.
- **`tables`** solo se conecta con `orders`: una mesa pasa a `OCCUPIED` cuando se crea un pedido `DINE_IN` sobre ella, y vuelve a `FREE` automáticamente cuando ya no queda ningún pedido activo (no `DELIVERED`/`CANCELLED`/`REFUNDED`) asociado a esa mesa.
- **`orders`** es el módulo central: al crearse, valida contra `products` (stock, disponibilidad) y opcionalmente contra `loyalty` (si se manda un `couponCode`). Cada transición de estado dispara efectos en `loyalty` (puntos), `notifications` (aviso al cliente) y Supabase Realtime (aviso al staff) — ver flujo detallado abajo.
- **`loyalty`** y **`notifications`** nunca inician nada por sí solos: siempre reaccionan a algo que pasó en `orders`.

## 2. Flujo completo de un pedido, paso a paso

1. **El cliente escanea el QR de su mesa** (o entra directo si es para llevar). El QR apunta a `{FRONTEND_URL}/mesa/{tableId}`; el frontend llama a `GET /tables/{id}` (público) para mostrar "Mesa 5" y confirmar que existe.
2. **El cliente arma su pedido** viendo `GET /categories` y `GET /products` (ambos públicos, sin login).
3. **Crea el pedido** con `POST /orders`:
   - Si no tiene sesión iniciada, debe mandar `guestName` (y opcionalmente `guestPhone`).
   - Si tiene sesión, el pedido queda ligado a su `User` automáticamente.
   - Si manda un `couponCode` válido (solo posible logueado), el descuento se calcula y el cupón se marca `USED` — todo dentro de la misma transacción de Mongo que descuenta el stock y crea el pedido, para que no quede stock descontado sin pedido creado o viceversa.
   - Si es `DINE_IN`, la mesa pasa a `OCCUPIED`.
4. **El staff ve el pedido entrar** en `GET /orders?status=PENDING` (o recibe el aviso en tiempo real — ver sección 3) y lo va avanzando con `PATCH /orders/{id}/status`:
   - `confirm` → `CONFIRMED`
   - `prepare` → `PREPARING`
   - `markReady` → `READY`
   - `deliver` → `DELIVERED` — **aquí se otorgan los puntos de fidelización** (si el pedido tiene cliente logueado): se calcula `floor(total × pointsPerCurrencyUnit)`, se inserta el movimiento en el ledger de `loyalty`, y se guarda en `order.pointsEarned`.
5. **En cada una de esas transiciones** (incluyendo `cancel`/`refund`), automáticamente:
   - Se agrega una entrada a `order.statusHistory`.
   - Si el pedido tiene cliente logueado, se crea una `Notification` para él.
   - Se dispara un broadcast a Supabase Realtime para que el panel de staff se entere al instante (sección 3).
   - Si la mesa ya no tiene más pedidos activos, vuelve a `FREE`.
6. **Si se cancela** (`cancel`) antes de `DELIVERED`: el stock se reintegra automáticamente a los productos que sí lo controlan.
7. **Si se reembolsa** (`refund`) un pedido que ya había otorgado puntos: esos puntos se revierten con un movimiento negativo en el ledger — **pero si el cliente ya se gastó esos puntos en un canje mientras tanto, el reembolso se bloquea** (422) para no dejar su saldo en negativo. Es una regla de negocio explícita, no un bug: protege contra que alguien gane puntos, los canjee por un cupón, y luego pida el reembolso del pedido original para quedarse con ambos.

## 3. La mejora: notificaciones en tiempo real + estimación de espera

### Contexto: qué problema resuelve

El proyecto original (MitrufelyWeb) documentaba explícitamente que había **evitado WebSockets a propósito**, optando por que el frontend hiciera *polling* cada 20-30 segundos, justificándolo así: *"para evitar la complejidad de infraestructura bidireccional... dado que hay múltiples contenedores"*. Es una limitación real y reconocida del proyecto original: el staff no se entera de un pedido nuevo hasta el siguiente ciclo de polling.

OrderFast resuelve esto de verdad, sin la complejidad de infraestructura que el proyecto original quiso evitar, aprovechando que el backend ya es serverless y que Supabase ya está integrado para autenticación.

### Cómo funciona

**No usamos WebSockets desde nuestro propio backend** (sería impráctico en una función serverless de Vercel, que vive solo durante la duración de cada request). En cambio:

1. El backend, después de confirmar en base de datos que un pedido se creó o cambió de estado, hace **una sola llamada HTTP** (no un WebSocket) al endpoint de broadcast de Supabase Realtime:
   ```
   POST {SUPABASE_URL}/realtime/v1/api/broadcast
   Body: { "messages": [{ "topic": "orders", "event": "new_order" | "order_status_changed", "payload": {...} }] }
   ```
2. El **frontend del staff** (cuando se construya) abre una única conexión WebSocket **directo contra Supabase** (no contra nuestro backend) y se suscribe al topic `orders`:
   ```js
   supabase.channel('orders')
     .on('broadcast', { event: 'new_order' }, (msg) => { /* refrescar lista */ })
     .on('broadcast', { event: 'order_status_changed' }, (msg) => { /* refrescar ese pedido */ })
     .subscribe()
   ```
3. Quien sostiene la conexión persistente es **Supabase**, no nuestra función serverless — por eso este patrón encaja perfecto con Vercel, a diferencia de un WebSocket propio.

**Decisión de seguridad deliberada:** el payload del broadcast es mínimo a propósito —
- `new_order`: `{ orderId, type }`
- `order_status_changed`: `{ orderId, status }`

**Nunca** se manda el detalle completo del pedido (cliente, productos, montos) por ese canal, porque hoy es un canal público de Supabase Realtime (no tenemos una regla de autorización propia ahí, ya que nuestros roles `STAFF`/`ADMIN` viven en Mongo, no en el sistema de permisos de Supabase). El broadcast es solo un "aviso" — el frontend, al recibirlo, pide el detalle real a `GET /orders/{id}` o `GET /orders`, que sí están protegidos por nuestro propio sistema de roles.

Si falla el envío del broadcast (ej. Supabase Realtime no responde), **no se rompe la respuesta al cliente**: la llamada está envuelta en un `try/catch` silencioso, igual que la creación de notificaciones — es un efecto secundario "best effort", nunca la fuente de verdad de los datos.

### Bonus: estimación de tiempo de espera

`GET /orders/wait-estimate` (público, sin login) — heurística simple pensada para mostrarse en la carta antes de pedir:

```
pedidos activos (CONFIRMED + PREPARING) × AVERAGE_PREP_MINUTES = minutos estimados de espera
```

`AVERAGE_PREP_MINUTES` es una variable de entorno (default `5`), así que se puede ajustar el ritmo real de la cocina sin tocar código ni redeployar la lógica, solo la variable.
