import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));

  function fetchUser() {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUser(null);
      setUserLoading(false);
      return;
    }
    api
      .get("/users/profile-data")
      .then((res) => {
        const d = res.data.data;
        const resolved = d?.user ?? d?.profile ?? d;
        setUser(resolved);
      })
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }

  useEffect(() => {
    fetchUser();
  }, [token]); 

  function notifyLogin() {
    setTokenState(localStorage.getItem("token"));
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, userLoading, fetchUser, notifyLogin }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
