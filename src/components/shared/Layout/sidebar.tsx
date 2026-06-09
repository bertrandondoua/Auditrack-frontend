"use client";

import Cookies from "js-cookie";
import { PanelRightOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Dict } from "@/lib/dictionaries";

import { DashboardRoutes } from "@/configs/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Sidebar({
  dict,
  userRole,
}: Readonly<{
  dict: Dict;
  userRole: Role;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const filterRoutes = <T extends { roles: Role[] }>(routes: T[]) =>
    routes.filter((route) => route.roles.includes(userRole));

  const mainRoutes = filterRoutes(DashboardRoutes.main);
  const bottomRoutes = filterRoutes(DashboardRoutes.bottom);
  const currentSegment = `/${pathname.split("/")[2] ?? ""}`;

  const handleLogout = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      // Surgical clear — preserve locale prefs + any non-auth client state.
      window.localStorage.removeItem("tokens");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("userCredentials");
      window.localStorage.removeItem("userResseteCredentials");
    }
    router.push(`/${dict.lang}/signin`);
  };

  return (
    <aside
      className={cn("bg-white p-6 flex flex-col w-1/6 duration-300", {
        "w-20 px-4": !open,
      })}
    >
      <div className="text-lg font-semibold mb-10">
        <Image
          src={open ? "/logo.svg" : "/sm-logo.svg"}
          width={500}
          height={500}
          alt="logo"
          className="h-auto cursor-pointer duration-300"
        />
      </div>

      <div className="mb-auto space-y-3">
        {mainRoutes.map((route) => {
          const Icon = route.icon;
          const active = currentSegment === route.path;
          return (
            <Link
              href={`/${dict.lang}${route.path}`}
              key={route.path}
              className={cn(
                "flex items-center space-x-2 mb-2 rounded-xl hover:bg-[#E7F0ED] hover:text-[#5E5E5E] py-4 px-8 text-base font-semibold text-[#5E5E5E]",
                {
                  "text-white bg-primary": active,
                  "py-2.5 px-1 justify-center": !open,
                },
              )}
            >
              <Icon className="w-6 h-6" />
              {open && (
                <span className="duration-200 origin-left">
                  {dict.routes[route.label as keyof typeof dict.routes]}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div>
        {bottomRoutes.map((route) => {
          const Icon = route.icon;
          const active = currentSegment === route.path;

          if (route.path === "/logout") {
            return (
              <button
                type="button"
                key={route.path}
                onClick={handleLogout}
                className={cn(
                  "flex items-center space-x-2 mb-2 rounded-xl hover:bg-[#E7F0ED] hover:text-[#5e5e5e] py-4 px-8 text-base font-semibold text-[#5E5E5E] w-full text-left",
                  {
                    "text-white bg-primary hover:bg-primary-hover": active,
                    "py-2.5 px-1 justify-center": !open,
                  },
                )}
              >
                <Icon className="w-6 h-6" />
                {open && <span>{dict.routes[route.label as keyof typeof dict.routes]}</span>}
              </button>
            );
          }

          return (
            <Link
              href={`/${dict.lang}${route.path}`}
              key={route.path}
              className={cn(
                "flex items-center space-x-2 mb-2 rounded-xl py-4 px-8 text-base hover:bg-[#E7F0ED] hover:text-[#5e5e5e] font-semibold text-[#5E5E5E]",
                {
                  "text-[#5e5e5e] bg-primary hover:bg-primary-hover": active,
                  "py-2.5 px-1 justify-center": !open,
                },
              )}
            >
              <Icon className="w-6 h-6" />
              {open && <span>{dict.routes[route.label as keyof typeof dict.routes]}</span>}
            </Link>
          );
        })}
      </div>

      <div className={cn("self-end", { "self-center": !open })}>
        <PanelRightOpen
          className={cn("duration-300 cursor-pointer text-[#5E5E5E]", {
            "rotate-180": !open,
          })}
          onClick={() => setOpen((o) => !o)}
        />
      </div>
    </aside>
  );
}
