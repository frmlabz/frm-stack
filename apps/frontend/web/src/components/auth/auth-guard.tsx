import type * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "#providers/auth-provider";
import { Spinner } from "@yourcompany/web/components/base/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const state = useRouterState();

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Don't redirect while auth state is still loading
    if (isLoading) {
      setIsRedirecting(false);
      return;
    }

    // Redirect unauthenticated users to auth page (unless already on auth page)
    if (!isAuthenticated && !state.location.pathname.includes("/auth")) {
      setIsRedirecting(true);
      navigate({
        to: "/auth",
        replace: true,
      });
      return;
    }

    // Redirect authenticated users away from auth page
    if (isAuthenticated && state.location.pathname.includes("/auth")) {
      setIsRedirecting(true);
      navigate({
        to: "/",
        replace: true,
      });
      return;
    }

    // Reset redirecting state when we're on the correct page
    setIsRedirecting(false);
  }, [isAuthenticated, isLoading, navigate, state.location.pathname]);

  // Show loading spinner only while auth state is being determined or during redirect
  if (isLoading || (isRedirecting && !state.location.pathname.includes("/auth") && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return <>{children}</>;
}
