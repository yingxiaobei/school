import { useContext } from 'react';
import GlobalContext from 'globalContext';

export function useAuth(authId: string): boolean {
  const { $elementAuthTable } = useContext(GlobalContext);

  return Boolean($elementAuthTable[authId]);
}
