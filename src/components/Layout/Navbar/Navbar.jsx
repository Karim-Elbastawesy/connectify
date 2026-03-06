import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Badge,
} from "@heroui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { tokenContext } from "../../context/tokenContext";
import { useUser } from "../../context/userContext";
import logo from "../../../images/ConnectifyRS.png";
import api from "../../services/api";

export default function NavbarComponent() {
  const { setToken } = useContext(tokenContext);
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    function fetchCount() {
      api
        .get("/notifications/unread-count")
        .then((res) => {
          const count = res.data.data?.count ?? res.data.data?.unreadCount ?? 0;
          setUnreadCount(count);
        })
        .catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  function logoutSystem() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/auth/login");
  }

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar
      isBordered
      classNames={{
        base: "bg-white border-b border-gray-100",
        wrapper: "max-w-6xl px-4",
      }}
    >
      <NavbarBrand>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} className="h-8 w-auto rounded-md" alt="Connectify" />
          <p className="font-bold text-lg text-gray-800">Connectify</p>
        </Link>
      </NavbarBrand>

      <NavbarContent
        className="hidden sm:flex border border-gray-200 rounded-full px-4 gap-1"
        justify="center"
      >
        <NavbarItem>
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive("/") ? "bg-green-50 text-green-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
          >
            <i className="fa-regular fa-house text-sm" />
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            to="/profile"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive("/profile") ? "bg-green-50 text-green-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
          >
            <i className="fa-regular fa-user text-sm" />
            Profile
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            to="/notifications"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive("/notifications") ? "bg-green-50 text-green-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
          >
            <span className="relative">
              <i className="fa-regular fa-bell text-sm" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            Notifications
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="flex items-center gap-2 outline-none">
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name || user?.username || ""}
              </span>
              <div className="relative">
                <Avatar
                  isBordered
                  color="success"
                  size="sm"
                  src={user?.photo || undefined}
                  name={user?.name?.[0]?.toUpperCase() || "U"}
                  className="cursor-pointer transition-transform hover:scale-105"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile_info" className="h-14 gap-2" isReadOnly>
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="font-semibold text-sm text-gray-700 truncate max-w-[180px]">
                {user?.email || user?.username || "—"}
              </p>
            </DropdownItem>
            <DropdownItem key="profile" as={Link} to="/profile">
              <i className="fa-regular fa-user mr-2 text-gray-500" />
              Profile
            </DropdownItem>
            <DropdownItem key="notifications" as={Link} to="/notifications">
              <span className="flex items-center gap-2">
                <i className="fa-regular fa-bell text-gray-500" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </span>
            </DropdownItem>
            <DropdownItem key="settings">
              <i className="fa-solid fa-gear mr-2 text-gray-500" />
              Settings
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={logoutSystem}>
              <i className="fa-solid fa-right-from-bracket mr-2" />
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
