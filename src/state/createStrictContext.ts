import { createContext, useContext } from "react";

export const createStrictContext = <T,>(name: string) => {
  const context = createContext<T | undefined>(undefined);

  const useStrictContext = () => {
    const value = useContext(context);
    if (!value) {
      throw new Error(`${name} debe usarse dentro de su provider`);
    }
    return value;
  };

  return [context, useStrictContext] as const;
};
