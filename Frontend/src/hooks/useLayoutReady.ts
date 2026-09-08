import { useEffect, useState } from "react";

/** Wait one frame so layout is stable before mounting charts (avoids Recharts resize flicker). */
export const useLayoutReady = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return ready;
};
