import { useState, useEffect } from "react";

/**
 * Hook customizado para detectar se a tela é mobile (<= 768px)
 * Melhora a performance ao centralizar o listener de resize.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    // Cleanup ao desmontar o componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}