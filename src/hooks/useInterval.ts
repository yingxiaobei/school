import { useRef, useEffect } from 'react';

type Fn = (...args: any) => void;

export function useInterval(fn: Fn, delay: number): void {
  const savedCallback = useRef<Fn>(fn);

  useEffect(() => {
    savedCallback.current = fn;
  });

  useEffect(() => {
    if (delay === 0) return;
    function tick() {
      savedCallback.current();
    }

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
