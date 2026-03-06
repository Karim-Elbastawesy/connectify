import React from "react";
import { useContext } from "react";
import { tokenContext } from "../../../context/tokenContext";
import { Navigate } from "react-router-dom";

export default function AuthProtected({ children }) {
  let { userToken } = useContext(tokenContext);

  if (!userToken) {
    return children;
  } else {
    return <Navigate to={"/"} />;
  }
}
