import { user } from "@heroui/react";
import React, { useContext } from "react";
import { tokenContext } from "../../context/tokenContext";
import { Navigate } from "react-router-dom";

export default function MainProtectedRoute({ children }) {
  let { userToken } = useContext(tokenContext);

  if (userToken) {
    return children;
  } else {
    return <Navigate to={"/auth/login"} />;
  }
}
