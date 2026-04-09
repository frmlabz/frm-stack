import { useEffect } from "react";

/**
 * Wraps useEffect with an empty dependency array to make mount-only intent explicit.
 * This is the only sanctioned way to use useEffect in this codebase.
 */
export function useMountEffect(effect: () => void | (() => void)) {
  // biome-ignore lint/plugin/no-direct-use-effect: sanctioned useEffect wrapper
  useEffect(effect, []);
}
