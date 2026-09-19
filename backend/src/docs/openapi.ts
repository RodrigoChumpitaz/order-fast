const errorResponse = (message: string) => ({
  description: message,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
});

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "OrderFast API",
    version: "0.1.0",
    description:
      "API de OrderFast (pedidos para mesa y para llevar). La autenticación la emite Supabase; este backend solo verifica el token contra el JWKS del proyecto y refleja el perfil de negocio en MongoDB. Para probar los endpoints protegidos desde este Swagger, obtén un access_token real haciendo login contra tu proyecto de Supabase (por ejemplo con curl a `POST {SUPABASE_URL}/auth/v1/token?grant_type=password`) y pégalo con el botón 'Authorize'. El primer usuario ADMIN se crea con `npm run promote-user -- <email> ADMIN` (requiere haber iniciado sesión al menos una vez).\n\n**Tiempo real (Supabase Realtime, fuera de este Swagger):** cuando se crea o cambia de estado un pedido, el backend publica un broadcast en el topic `orders` de Supabase Realtime — evento `new_order` con `{ orderId, type }` al crear, y `order_status_changed` con `{ orderId, status }` en cada transición. El frontend se suscribe directo a Supabase (WebSocket) con `supabase.channel('orders').on('broadcast', { event: '*' }, cb).subscribe()`; el payload es solo un aviso, el detalle completo del pedido se obtiene llamando a `GET /api/v1/orders/{id}` con el token de sesión.",
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Estado", description: "Estado del servicio" },
    { name: "Categorías", description: "Categorías del menú" },
    { name: "Productos", description: "Productos del menú" },
    { name: "Usuarios", description: "Perfiles y roles de usuario" },
    { name: "Mesas", description: "Mesas del local y su QR" },
    { name: "Pedidos", description: "Pedidos (mesa y para llevar)" },
    { name: "Fidelización", description: "Puntos, cupones y recompensas" },
    { name: "Notificaciones", description: "Notificaciones del cliente" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Estado"],
        summary: "Estado del servicio y de la conexión a MongoDB",
        security: [],
        responses: {
          "200": {
            description: "Servicio operativo",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: { mongo: { type: "string", enum: ["up", "down"] } },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/categories": {
      get: {
        tags: ["Categorías"],
        summary: "Listar categorías activas",
        responses: {
          "200": {
            description: "Lista de categorías",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Category" } },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
      post: {
        tags: ["Categorías"],
        summary: "Crear categoría (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateCategoryRequest" } },
          },
        },
        responses: {
          "201": {
            description: "Categoría creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Category" },
                    message: { type: "string", example: "Categoría creada" },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "409": errorResponse("El campo 'name' ya está en uso."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/categories/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Categorías"],
        summary: "Obtener una categoría por id",
        responses: {
          "200": {
            description: "Categoría encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Category" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "404": errorResponse("Categoría no encontrada."),
          "422": errorResponse("El campo 'id' no tiene un formato válido."),
        },
      },
      patch: {
        tags: ["Categorías"],
        summary: "Actualizar categoría (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateCategoryRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Categoría actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Category" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Categoría no encontrada."),
          "409": errorResponse("El campo 'name' ya está en uso."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
      delete: {
        tags: ["Categorías"],
        summary: "Eliminar categoría (soft delete, requiere rol ADMIN)",
        responses: {
          "200": { description: "Categoría eliminada" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Categoría no encontrada."),
        },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos activos",
        parameters: [
          {
            name: "category",
            in: "query",
            required: false,
            description: "Filtra por ObjectId de categoría",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Lista de productos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "422": errorResponse("El campo 'category' no tiene un formato válido."),
        },
      },
      post: {
        tags: ["Productos"],
        summary: "Crear producto (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateProductRequest" } },
          },
        },
        responses: {
          "201": {
            description: "Producto creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Categoría no encontrada."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/products/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Productos"],
        summary: "Obtener un producto por id",
        responses: {
          "200": {
            description: "Producto encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "404": errorResponse("Producto no encontrado."),
        },
      },
      patch: {
        tags: ["Productos"],
        summary: "Actualizar producto (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateProductRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Producto actualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Producto no encontrado."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
      delete: {
        tags: ["Productos"],
        summary: "Eliminar producto (soft delete, requiere rol ADMIN)",
        responses: {
          "200": { description: "Producto eliminado" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Producto no encontrado."),
        },
      },
    },
    "/api/v1/products/{id}/availability": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Productos"],
        summary: "Cambiar disponibilidad (requiere rol STAFF o ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SetAvailabilityRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Disponibilidad actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Producto no encontrado."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["Usuarios"],
        summary: "Perfil del usuario autenticado",
        responses: {
          "200": {
            description: "Perfil del usuario",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios (requiere rol ADMIN)",
        responses: {
          "200": {
            description: "Lista de usuarios",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/User" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
        },
      },
    },
    "/api/v1/users/{id}/role": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Usuarios"],
        summary: "Cambiar el rol de un usuario (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateRoleRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Rol actualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Usuario no encontrado."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/tables": {
      get: {
        tags: ["Mesas"],
        summary: "Listar mesas activas (requiere rol STAFF o ADMIN)",
        responses: {
          "200": {
            description: "Lista de mesas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Table" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
        },
      },
      post: {
        tags: ["Mesas"],
        summary: "Crear mesa (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTableRequest" } } },
        },
        responses: {
          "201": {
            description: "Mesa creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Table" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "409": errorResponse("El campo 'number' ya está en uso."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/tables/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Mesas"],
        summary: "Obtener una mesa por id (público, usado por el QR)",
        security: [],
        responses: {
          "200": {
            description: "Mesa encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Table" } },
                },
              },
            },
          },
          "404": errorResponse("Mesa no encontrada."),
        },
      },
      patch: {
        tags: ["Mesas"],
        summary: "Actualizar mesa (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTableRequest" } } },
        },
        responses: {
          "200": {
            description: "Mesa actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Table" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Mesa no encontrada."),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
      delete: {
        tags: ["Mesas"],
        summary: "Eliminar mesa (soft delete, requiere rol ADMIN)",
        responses: {
          "200": { description: "Mesa eliminada" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Mesa no encontrada."),
        },
      },
    },
    "/api/v1/tables/{id}/qr": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Mesas"],
        summary: "Descargar el QR de la mesa (PNG, requiere rol ADMIN)",
        responses: {
          "200": {
            description: "Imagen PNG del QR",
            content: { "image/png": { schema: { type: "string", format: "binary" } } },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Mesa no encontrada."),
        },
      },
    },
    "/api/v1/orders": {
      post: {
        tags: ["Pedidos"],
        summary: "Crear pedido (con o sin sesión iniciada)",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateOrderRequest" } } },
        },
        responses: {
          "201": {
            description: "Pedido creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Order" } },
                },
              },
            },
          },
          "404": errorResponse("Producto o mesa no encontrada."),
          "422": errorResponse("Datos de entrada inválidos o stock insuficiente"),
        },
      },
      get: {
        tags: ["Pedidos"],
        summary: "Listar pedidos (requiere rol STAFF o ADMIN)",
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED", "REFUNDED"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Lista de pedidos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
        },
      },
    },
    "/api/v1/orders/wait-estimate": {
      get: {
        tags: ["Pedidos"],
        summary: "Estimar tiempo de espera actual (público)",
        description:
          "Heurística simple: pedidos activos (CONFIRMED + PREPARING) multiplicados por AVERAGE_PREP_MINUTES.",
        security: [],
        responses: {
          "200": {
            description: "Estimación actual",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        activeOrders: { type: "integer", example: 3 },
                        estimatedMinutes: { type: "integer", example: 15 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Pedidos"],
        summary: "Obtener un pedido por id (público, para seguimiento de invitados)",
        security: [],
        responses: {
          "200": {
            description: "Pedido encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Order" } },
                },
              },
            },
          },
          "404": errorResponse("Pedido no encontrado."),
        },
      },
    },
    "/api/v1/orders/{id}/status": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Pedidos"],
        summary: "Cambiar el estado del pedido (un solo endpoint para toda la FSM)",
        description:
          "El campo 'action' del body define la transición. 'confirm' (PENDING→CONFIRMED), 'prepare' (CONFIRMED→PREPARING), 'markReady' (PREPARING→READY) y 'deliver' (READY→DELIVERED) requieren rol STAFF o ADMIN; al llegar a DELIVERED se otorgan los puntos de fidelización si el pedido tiene cliente autenticado. 'refund' (desde DELIVERED o CANCELLED) requiere rol ADMIN y revierte los puntos otorgados, si los hubo. 'cancel' (desde PENDING, CONFIRMED o PREPARING) lo puede ejecutar STAFF/ADMIN en cualquiera de esos estados, o el dueño autenticado / un invitado solo mientras el pedido sigue PENDING.",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" } } },
        },
        responses: {
          "200": {
            description: "Pedido actualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Order" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Pedido no encontrado."),
          "422": errorResponse(
            'No se puede ejecutar la acción indicada desde el estado actual del pedido, o el saldo de puntos quedaría negativo.',
          ),
        },
      },
    },
    "/api/v1/loyalty/config": {
      get: {
        tags: ["Fidelización"],
        summary: "Ver configuración de puntos (pública)",
        security: [],
        responses: {
          "200": {
            description: "Configuración actual",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/LoyaltyConfig" } },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Fidelización"],
        summary: "Actualizar tasa de conversión (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateLoyaltyConfigRequest" } } },
        },
        responses: {
          "200": { description: "Configuración actualizada" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/loyalty/points/me": {
      get: {
        tags: ["Fidelización"],
        summary: "Saldo de puntos del usuario autenticado",
        responses: {
          "200": {
            description: "Saldo actual",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "object", properties: { balance: { type: "number", example: 120 } } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
    },
    "/api/v1/loyalty/points/me/history": {
      get: {
        tags: ["Fidelización"],
        summary: "Historial de movimientos de puntos (ledger)",
        responses: {
          "200": {
            description: "Historial",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/PointsLedgerEntry" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
    },
    "/api/v1/loyalty/points/{id}/adjust": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      post: {
        tags: ["Fidelización"],
        summary: "Ajuste manual de puntos de un usuario (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AdjustPointsRequest" } } },
        },
        responses: {
          "201": { description: "Ajuste registrado" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "422": errorResponse("El saldo de puntos no puede quedar negativo."),
        },
      },
    },
    "/api/v1/loyalty/coupon-templates": {
      get: {
        tags: ["Fidelización"],
        summary: "Listar recompensas canjeables",
        responses: {
          "200": {
            description: "Lista de recompensas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/CouponTemplate" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
      post: {
        tags: ["Fidelización"],
        summary: "Crear recompensa canjeable (requiere rol ADMIN)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCouponTemplateRequest" } } },
        },
        responses: {
          "201": { description: "Recompensa creada" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "422": errorResponse("Datos de entrada inválidos"),
        },
      },
    },
    "/api/v1/loyalty/coupon-templates/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Fidelización"],
        summary: "Actualizar recompensa (requiere rol ADMIN)",
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCouponTemplateRequest" } } },
        },
        responses: {
          "200": { description: "Recompensa actualizada" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Recompensa no encontrada."),
        },
      },
      delete: {
        tags: ["Fidelización"],
        summary: "Eliminar recompensa (soft delete, requiere rol ADMIN)",
        responses: {
          "200": { description: "Recompensa eliminada" },
          "401": errorResponse("No autenticado"),
          "403": errorResponse("No autorizado para esta acción"),
          "404": errorResponse("Recompensa no encontrada."),
        },
      },
    },
    "/api/v1/loyalty/coupons/me": {
      get: {
        tags: ["Fidelización"],
        summary: "Listar mis cupones",
        responses: {
          "200": {
            description: "Cupones del usuario",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Coupon" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
    },
    "/api/v1/loyalty/coupons/redeem": {
      post: {
        tags: ["Fidelización"],
        summary: "Canjear puntos por un cupón",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RedeemCouponRequest" } } },
        },
        responses: {
          "201": {
            description: "Cupón creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Coupon" } },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
          "404": errorResponse("Recompensa no encontrada."),
          "422": errorResponse("El saldo de puntos no puede quedar negativo."),
        },
      },
    },
    "/api/v1/notifications/me": {
      get: {
        tags: ["Notificaciones"],
        summary: "Listar mis notificaciones",
        responses: {
          "200": {
            description: "Notificaciones",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Notification" } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
    },
    "/api/v1/notifications/me/unread-count": {
      get: {
        tags: ["Notificaciones"],
        summary: "Cantidad de notificaciones no leídas (para la campanita)",
        responses: {
          "200": {
            description: "Contador",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "object", properties: { count: { type: "integer", example: 3 } } },
                  },
                },
              },
            },
          },
          "401": errorResponse("No autenticado"),
        },
      },
    },
    "/api/v1/notifications/{id}/read": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Notificaciones"],
        summary: "Marcar una notificación como leída",
        responses: {
          "200": { description: "Notificación marcada como leída" },
          "401": errorResponse("No autenticado"),
          "404": errorResponse("Notificación no encontrada."),
        },
      },
    },
    "/api/v1/notifications/read-all": {
      patch: {
        tags: ["Notificaciones"],
        summary: "Marcar todas mis notificaciones como leídas",
        responses: {
          "200": { description: "Notificaciones marcadas como leídas" },
          "401": errorResponse("No autenticado"),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token emitido por Supabase Auth",
      },
    },
    parameters: {
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        description: "ObjectId de MongoDB (24 caracteres hexadecimales)",
        schema: { type: "string", example: "6aac82df001fa4d642c66706" },
      },
    },
    schemas: {
      Category: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6aac82df001fa4d642c66706" },
          name: { type: "string", example: "Postres" },
          slug: { type: "string", example: "postres" },
          order: { type: "integer", example: 0 },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6aac82df001fa4d642c6670a" },
          name: { type: "string", example: "Brownie" },
          description: { type: "string", example: "" },
          price: { type: "number", example: 12.5 },
          imageUrl: { type: "string", example: "" },
          category: {
            description: "ObjectId de la categoría, o la categoría poblada en GET",
            oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Category" }],
          },
          stock: { type: "integer", nullable: true, example: null },
          isAvailable: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6aac82df001fa4d642c66799" },
          supabaseUserId: { type: "string", example: "fb4c23fe-17fa-41c0-be93-087c0094b195" },
          email: { type: "string", example: "cliente@ejemplo.com" },
          name: { type: "string", example: "" },
          phone: { type: "string", example: "" },
          role: { type: "string", enum: ["CUSTOMER", "STAFF", "ADMIN"], example: "CUSTOMER" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UpdateRoleRequest: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: ["CUSTOMER", "STAFF", "ADMIN"], example: "STAFF" },
        },
      },
      Table: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6aac82df001fa4d642c667aa" },
          number: { type: "integer", example: 5 },
          capacity: { type: "integer", example: 4 },
          status: { type: "string", enum: ["FREE", "OCCUPIED"], example: "FREE" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateTableRequest: {
        type: "object",
        required: ["number"],
        properties: {
          number: { type: "integer", minimum: 1, example: 5 },
          capacity: { type: "integer", minimum: 1, example: 4 },
        },
      },
      UpdateTableRequest: {
        type: "object",
        properties: {
          number: { type: "integer", minimum: 1 },
          capacity: { type: "integer", minimum: 1 },
          status: { type: "string", enum: ["FREE", "OCCUPIED"] },
          isActive: { type: "boolean" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          product: { description: "ObjectId o producto poblado", oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Product" }] },
          productName: { type: "string", example: "Brownie" },
          unitPrice: { type: "number", example: 12.5 },
          quantity: { type: "integer", example: 2 },
          subtotal: { type: "number", example: 25 },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6aac82df001fa4d642c667bb" },
          customer: {
            nullable: true,
            oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }],
          },
          guestName: { type: "string", example: "Juan Pérez" },
          guestPhone: { type: "string", example: "" },
          type: { type: "string", enum: ["DINE_IN", "TAKEAWAY"], example: "DINE_IN" },
          table: {
            nullable: true,
            oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Table" }],
          },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          subtotal: { type: "number", example: 25 },
          discount: { type: "number", example: 0 },
          total: { type: "number", example: 25 },
          pointsEarned: { type: "number", example: 0 },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED", "REFUNDED"],
            example: "PENDING",
          },
          statusHistory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string" },
                date: { type: "string", format: "date-time" },
                comment: { type: "string" },
                updatedBy: { type: "string", nullable: true },
              },
            },
          },
          notes: { type: "string", example: "" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateOrderRequest: {
        type: "object",
        required: ["type", "items"],
        properties: {
          type: { type: "string", enum: ["DINE_IN", "TAKEAWAY"], example: "DINE_IN" },
          table: { type: "string", description: "Obligatorio si type=DINE_IN", example: "6aac82df001fa4d642c667aa" },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["product", "quantity"],
              properties: {
                product: { type: "string", example: "6aac82df001fa4d642c6670a" },
                quantity: { type: "integer", minimum: 1, example: 2 },
              },
            },
          },
          notes: { type: "string", example: "" },
          guestName: { type: "string", description: "Obligatorio si no envías Authorization", example: "Juan Pérez" },
          guestPhone: { type: "string", example: "" },
        },
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["action"],
        properties: {
          action: {
            type: "string",
            enum: ["confirm", "prepare", "markReady", "deliver", "cancel", "refund"],
            example: "confirm",
          },
          comment: { type: "string", example: "" },
        },
      },
      LoyaltyConfig: {
        type: "object",
        properties: {
          pointsPerCurrencyUnit: { type: "number", example: 1 },
        },
      },
      UpdateLoyaltyConfigRequest: {
        type: "object",
        required: ["pointsPerCurrencyUnit"],
        properties: {
          pointsPerCurrencyUnit: { type: "number", minimum: 0, example: 1 },
        },
      },
      AdjustPointsRequest: {
        type: "object",
        required: ["amount", "description"],
        properties: {
          amount: { type: "integer", example: -50, description: "Positivo suma, negativo resta" },
          description: { type: "string", example: "Corrección manual" },
        },
      },
      PointsLedgerEntry: {
        type: "object",
        properties: {
          _id: { type: "string" },
          customer: { type: "string" },
          type: { type: "string", enum: ["PURCHASE_ACCRUAL", "COUPON_REDEMPTION", "ADMIN_ADJUSTMENT"] },
          amount: { type: "integer", example: 17 },
          resultingBalance: { type: "integer", example: 120 },
          order: { type: "string", nullable: true },
          description: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CouponTemplate: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "10% de descuento" },
          pointsCost: { type: "integer", example: 100 },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED_AMOUNT"], example: "PERCENTAGE" },
          discountValue: { type: "number", example: 10 },
          validityDays: { type: "integer", example: 30 },
          isActive: { type: "boolean", example: true },
        },
      },
      CreateCouponTemplateRequest: {
        type: "object",
        required: ["name", "pointsCost", "discountType", "discountValue"],
        properties: {
          name: { type: "string", example: "10% de descuento" },
          pointsCost: { type: "integer", minimum: 1, example: 100 },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED_AMOUNT"] },
          discountValue: { type: "number", minimum: 0, example: 10 },
          validityDays: { type: "integer", minimum: 1, example: 30 },
        },
      },
      UpdateCouponTemplateRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          pointsCost: { type: "integer", minimum: 1 },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED_AMOUNT"] },
          discountValue: { type: "number", minimum: 0 },
          validityDays: { type: "integer", minimum: 1 },
          isActive: { type: "boolean" },
        },
      },
      RedeemCouponRequest: {
        type: "object",
        required: ["templateId"],
        properties: {
          templateId: { type: "string", example: "6aac82df001fa4d642c66706" },
        },
      },
      Coupon: {
        type: "object",
        properties: {
          _id: { type: "string" },
          customer: { type: "string" },
          template: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/CouponTemplate" }] },
          uniqueCode: { type: "string", example: "A1B2C3D4E5" },
          status: { type: "string", enum: ["AVAILABLE", "USED", "EXPIRED"], example: "AVAILABLE" },
          expiresAt: { type: "string", format: "date-time" },
          usedAt: { type: "string", format: "date-time", nullable: true },
          usedInOrder: { type: "string", nullable: true },
        },
      },
      Notification: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          type: { type: "string", enum: ["ORDER_UPDATED", "NEW_ORDER", "COUPON_EARNED", "SYSTEM"] },
          title: { type: "string", example: "Pedido actualizado" },
          message: { type: "string", example: "Tu pedido está listo." },
          order: { type: "string", nullable: true },
          isRead: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateCategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Postres" },
          order: { type: "integer", minimum: 0, example: 0 },
        },
      },
      UpdateCategoryRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          order: { type: "integer", minimum: 0 },
          isActive: { type: "boolean" },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "price", "category"],
        properties: {
          name: { type: "string", example: "Brownie" },
          description: { type: "string" },
          price: { type: "number", minimum: 0, example: 12.5 },
          imageUrl: { type: "string" },
          category: { type: "string", example: "6aac82df001fa4d642c66706" },
          stock: { type: "integer", nullable: true, minimum: 0 },
        },
      },
      UpdateProductRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          imageUrl: { type: "string" },
          category: { type: "string" },
          stock: { type: "integer", nullable: true, minimum: 0 },
          isActive: { type: "boolean" },
        },
      },
      SetAvailabilityRequest: {
        type: "object",
        required: ["isAvailable"],
        properties: { isAvailable: { type: "boolean" } },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              message: { type: "string", example: "Datos de entrada inválidos" },
              details: {
                type: "array",
                nullable: true,
                items: {
                  type: "object",
                  properties: { campo: { type: "string" }, mensaje: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },
};
