import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { MenuPage } from "@/features/catalog/MenuPage";
import { CartPage } from "@/features/cart/CartPage";
import { CheckoutPage } from "@/features/checkout/CheckoutPage";
import { OrderTrackingPage } from "@/features/orders/OrderTrackingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { StaffOrdersPage } from "@/features/staff/StaffOrdersPage";
import { StaffNewOrderPage } from "@/features/staff/StaffNewOrderPage";
import { CategoriesAdminPage } from "@/features/admin/CategoriesAdminPage";
import { ProductsAdminPage } from "@/features/admin/ProductsAdminPage";
import { TablesAdminPage } from "@/features/admin/TablesAdminPage";
import { RequireRole } from "@/auth/RequireRole";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/carta" replace />} />
        <Route path="/carta" element={<MenuPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/:id" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/staff/pedidos"
          element={
            <RequireRole roles={["STAFF", "ADMIN"]}>
              <StaffOrdersPage />
            </RequireRole>
          }
        />
        <Route
          path="/staff/nuevo-pedido"
          element={
            <RequireRole roles={["STAFF", "ADMIN"]}>
              <StaffNewOrderPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <RequireRole roles={["ADMIN"]}>
              <CategoriesAdminPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <RequireRole roles={["ADMIN"]}>
              <ProductsAdminPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/mesas"
          element={
            <RequireRole roles={["ADMIN"]}>
              <TablesAdminPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/carta" replace />} />
      </Route>
    </Routes>
  );
}
