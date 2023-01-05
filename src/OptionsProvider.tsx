import { useState } from 'react';
import OptionsContext from './optionsContext';

export default function OptionsProvider(props: any) {
  const [$optionStore, $setOptionStore] = useState({});
  const [$hashStore, $setHashStore] = useState({});

  return (
    <OptionsContext.Provider value={{ $optionStore, $setOptionStore, $hashStore, $setHashStore }}>
      {props.children}
    </OptionsContext.Provider>
  );
}
