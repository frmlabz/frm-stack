import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import { AuthGuard } from "#components/auth/auth-guard";
import { getConfig } from "#lib/config";
import { AuthProvider } from "#providers/auth-provider";
import { ORPCProvider } from "#providers/orpc-provider";
import { SessionProvider } from "#providers/session-provider";

const config = getConfig();

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <ORPCProvider apiUrl={config.apiUrl}>
          <AuthProvider>
            <AuthGuard>
              <Outlet />
            </AuthGuard>
          </AuthProvider>
        </ORPCProvider>
      </SessionProvider>
      <TanStackRouterDevtools />
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
