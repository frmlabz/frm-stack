import { useState } from "react";
import { useMountEffect } from "./use-mount-effect";

export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useMountEffect(() => {
    setIsMounted(true);
  });

  return isMounted;
}
