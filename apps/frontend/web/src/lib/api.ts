import { use } from "react";
import { ORPCContext, type ORPCReactUtils } from "#providers/orpc-provider";

export function useApi(): ORPCReactUtils {
  const orpc = use(ORPCContext);
  if (!orpc) {
    throw new Error("ORPCContext is not set up properly");
  }
  return orpc;
}
