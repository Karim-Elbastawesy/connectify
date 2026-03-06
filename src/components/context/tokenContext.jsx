import { createContext, useEffect, useState } from "react";

export const tokenContext = createContext();

export function TokenContextProvider({ children }) {
  const [userToken, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  return (
    <tokenContext.Provider value={{ userToken, setToken }}>
      {children}
    </tokenContext.Provider>
  );
}
