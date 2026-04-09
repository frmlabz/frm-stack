import type * as React from "react";
import { Navigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "#/providers/auth-provider";
import { Spinner } from "@yourcompany/web/components/base/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const state = useRouterState();
  const isOnAuthPage = state.location.pathname.includes("/auth");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  // Redirect unauthenticated users to auth page
  if (!isAuthenticated && !isOnAuthPage) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect authenticated users away from auth page
  if (isAuthenticated && isOnAuthPage) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
