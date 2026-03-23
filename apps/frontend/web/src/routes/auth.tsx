import { useEffect } from "react";
import { useAuth } from "#providers/auth-provider";
import { SignIn } from "#components/auth/signin";
import { SignUp } from "#components/auth/signup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@yourcompany/web/components/base/tabs";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

type AuthMode = "signin" | "signup";

type AuthSearch = {
  mode?: AuthMode;
};

export const Route = createFileRoute("/auth")({
  component: AuthComponent,
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const mode = search.mode as string | undefined;
    if (mode === "signin" || mode === "signup") {
      return { mode };
    }
    return { mode: "signin" };
  },
});

function AuthComponent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const activeTab = search.mode ?? "signin";

  // Update search params when tab changes
  const handleTabChange = (value: string) => {
    const mode = value as AuthMode;
    navigate({
      to: "/auth",
      search: { mode } as AuthSearch,
      replace: true,
    });
  };

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate({
        to: "/",
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    navigate({
      to: "/",
      replace: true,
    });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" data-testid="auth-page">
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignIn onSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUp onSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
