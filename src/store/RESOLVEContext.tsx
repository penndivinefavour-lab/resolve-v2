import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { resolveReducer, type Action } from './reducer';
import { initialState } from './initialState';
import type { RESOLVESState } from './types';

export interface RESOLVEContextValue {
  state: RESOLVESState;
  dispatch: React.Dispatch<Action>;
}

const RESOLVEContext = createContext<RESOLVEContextValue>({
  state: initialState,
  dispatch: () => {},
});

export function useRESOLVE(): RESOLVEContextValue {
  const ctx = useContext(RESOLVEContext);
  if (!ctx) {
    throw new Error('useRESOLVE must be used within a RESOLVEProvider');
  }
  return ctx;
}

export function RESOLVEProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(resolveReducer, initialState);
  return (
    <RESOLVEContext.Provider value={{ state, dispatch }}>
      {children}
    </RESOLVEContext.Provider>
  );
}
