import React, {useContext} from 'react';

export let SlotContext = React.createContext(null);

export function useSlotProvider() {
  return useContext(SlotContext);
};
