import { createContext } from 'react';

// TODO:
type TOptionsStore = { [k: string]: { value: string; label: string }[] };

// TODO:
type THashStore = { [k: string]: { [key: string]: string } };

interface ContextState {
  $optionStore: TOptionsStore;
  // TODO:
  $setOptionStore(p: any): void;
  $hashStore: THashStore;
  // TODO:
  $setHashStore(p: any): void;
}

const OptionsContext = createContext({} as ContextState);

export default OptionsContext;
