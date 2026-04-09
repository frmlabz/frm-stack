import { useState } from "react";
import { useMountEffect } from "./use-mount-effect";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useMountEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 720);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return isMobile;
};
