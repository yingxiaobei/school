import { useRef, useEffect } from 'react';

export function useUnload(fn: any) {
  const cb = useRef(fn); // init with fn, so that type checkers won't assume that current might be undefined

  useEffect(() => {
    cb.current = fn;
  }, [fn]);

  useEffect(() => {
    const onUnload = (e: any) => {
      cb.current?.(e);
    };

    window.addEventListener('beforeunload', onUnload);

    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);
}
