import { useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useMountEffect } from "./use-mount-effect";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useMountEffect(() => {
    setHasHydrated(true);
  });

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
