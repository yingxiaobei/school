import { useReducer } from 'react';

//随机数+时间戳 避免重复
export function useRandomUpdate(): [number, () => void] {
  const [ignore, forceUpdate] = useReducer((x) => Math.random() + Date.now(), 0);

  return [ignore, forceUpdate];
}
