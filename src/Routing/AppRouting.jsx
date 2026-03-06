import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout/MainLayout";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import NotFound from "../pages/notfound/NotFound";
import AuthLayout from "../Layouts/AuthLayout/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import MainProtectedRoute from "../components/guard/mainProtectedRoute/MainProtectedRoute";
import AuthProtected from "../components/guard/mainProtectedRoute/authProtected/AuthProtected";
import Notifications from "../pages/Notifications/Notifications";
import UserProfile from "../pages/Profile/UserProfile";

export const routes = createBrowserRouter([
  {
    path: "",
    element: (
      <MainProtectedRoute>
        <MainLayout />
      </MainProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "profile", element: <Profile /> },
      { path: "users/:userId", element: <UserProfile /> },
      { path: "notifications", element: <Notifications /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "auth",
    element: (
      <AuthProtected>
        <AuthLayout />
      </AuthProtected>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Register /> },
    ],
  },
]);
