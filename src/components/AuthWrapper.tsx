import { useContext } from 'react';
import GlobalContext from 'globalContext';

interface IProps {
  authId: string;
  insertWhen?: boolean;
  children: any; // TODO:
}

export default function AuthWrapper(props: IProps) {
  const { authId, insertWhen = true } = props;
  const { $elementAuthTable } = useContext(GlobalContext);

  if (!insertWhen) return null;
  if (authId && !$elementAuthTable[authId]) return null;

  return props.children;
}
