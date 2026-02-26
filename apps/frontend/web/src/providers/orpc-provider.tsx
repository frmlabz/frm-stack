import { type ClientOptions, createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterUtils } from "@orpc/react-query";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { ClientContext, RouterClient } from "@orpc/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Router } from "@yourcompany/api/orpc";
import { createContext, useState } from "react";

export type ORPCReactUtils = RouterUtils<RouterClient<Router>>;

export const ORPCContext = createContext<ORPCReactUtils | undefined>(undefined);

export function ORPCProvider({ children, apiUrl }: { children: React.ReactNode; apiUrl: string }) {
  const link = new RPCLink({
    url: `${apiUrl}/rpc`,
    headers: {},
    fetch: (
      request: Request,
      _init: { redirect?: RequestRedirect | undefined },
      options: ClientOptions<ClientContext>,
      _path: readonly string[],
      _input: unknown,
    ) => {
      // Use the built-in fetch with credentials included to send cookies automatically
      return fetch(request, {
        ...options,
        credentials: "include",
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
