"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hideNavbar =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register";

  if (hideNavbar) return null;

  return <Navbar />;
}