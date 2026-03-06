import React from "react";
import NavbarComponent from "../../components/Layout/Navbar/Navbar";
import Footer from "../../components/Layout/Footer/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <NavbarComponent />
      <Outlet />
      <Footer />
    </>
  );
}
