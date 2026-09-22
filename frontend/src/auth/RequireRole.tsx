import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { Role } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(profile.role)) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-lg font-semibold text-ink">No tienes acceso a esta sección.</p>
        <p className="mt-2 text-sm text-muted">Tu cuenta no tiene el rol necesario para ver esta página.</p>
      </div>
    );
  }

  return <>{children}</>;
}
