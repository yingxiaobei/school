import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({ screenWidth: window.innerWidth, screenHeight: window.innerHeight });

  useEffect(() => {
    const handler = () => {
      setSize({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      });
    };

    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  return size;
}
