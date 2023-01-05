import { useState } from 'react';
import { useInterval } from 'hooks';

interface IReturn {
  isFirstCounting: boolean;
  count: number;
  setIsCounting(isCounting: boolean): void;
  isCounting: boolean;
}

export function useCountdown(seconds: number = 60): IReturn {
  const [isCounting, setIsCounting] = useState(false);
  const [count, setCount] = useState(seconds);
  const [isFirstCounting, setIsFirstCounting] = useState(true);

  useInterval(() => {
    if (!isCounting) return;
    setIsFirstCounting(false);

    if (count === 0) {
      setCount(seconds);
      setIsCounting(false);
    } else {
      setCount(count - 1);
    }
  }, 1000);

  return { isFirstCounting, count, setIsCounting, isCounting };
}
