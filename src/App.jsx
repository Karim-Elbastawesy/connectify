import React from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./Routing/AppRouting";


export default function App() {
  return (
    <div>
      <RouterProvider router={routes} />
    </div>
  );
}
