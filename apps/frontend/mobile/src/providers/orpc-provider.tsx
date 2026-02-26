import { createContext, useState, type ReactNode } from "react";
import type { RouterUtils } from "@orpc/react-query";
import { type ClientOptions, createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient, ClientContext } from "@orpc/server";
import type { Router } from "@yourcompany/api/orpc";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAuthCookie } from "#lib/auth";
import { Platform } from "react-native";
import * as Linking from "expo-linking";

export type ORPCReactUtils = RouterUtils<RouterClient<Router>>;

export const ORPCContext = createContext<ORPCReactUtils | undefined>(undefined);

export function ORPCProvider({ children, apiUrl }: { children: ReactNode; apiUrl: string }) {
  const link = new RPCLink({
    url: `${apiUrl}/rpc`,
    headers: {},
    fetch: (
      request: Request,
      _init: { redirect?: RequestRedirect | undefined },
      options: ClientOptions<ClientContext>,
      _path: readonly string[],
      _input: unknown
    ) => {
      if (Platform.OS === "web") {
        return fetch(request, {
          ...options,
          credentials: "include",
        });
      }

      const cookie = getAuthCookie();
      const headers = new Headers(request.headers);
      if (cookie) headers.set("cookie", cookie);
      headers.set("expo-origin", Linking.createURL("", { scheme: "mobile" }));

      return fetch(request, {
        ...options,
        headers,
        // Cookies are added manually to headers; "include" can interfere on native.
        credentials: "omit",
      });
    },
  });
  const [client] = useState<RouterClient<Router>>(() => createORPCClient(link));
  const [orpc] = useState(() => createORPCReactQueryUtils(client));
  const [queryClient] = useState(() => new QueryClient({}));

  return (
    <QueryClientProvider client={queryClient}>
      <ORPCContext.Provider value={orpc}>{children}</ORPCContext.Provider>
    </QueryClientProvider>
  );
}
