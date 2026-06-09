"use client";

import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/dictionaries";

import { Input } from "@/components/ui/input";
import { routeNames } from "@/configs/constants";
import { type getDictionary } from "@/lib/dictionaries";
import type { User } from "@/types/user";

import { AvatarDemo } from "./avatar";
import LanguageSelector from "./LanguageSelector";
import SearchEyeIcon from "./icons/searchEye";

interface HeaderProps {
  user?: User;
  dict: Dict;
}

export default function Header({ user, dict }: HeaderProps) {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] ?? "";
  const pageKey = routeNames[segment] as keyof typeof dict.routes | undefined;

  return (
    <header className="bg-white p-4 flex items-center justify-between">
      <div className="text-2xl font-bold text-black">{pageKey ? dict.routes[pageKey] : ""}</div>
      <div className="flex flex-row items-center justify-normal gap-4">
        <Input
          icon={SearchEyeIcon}
          placeholder={dict.header.search}
          iconProps={{ behavior: "append", className: "cursor-pointer w-5 h-5" }}
        />
        <LanguageSelector />
        <AvatarDemo
          fallbackClassName="bg-primary text-white"
          img={user?.image}
          fallback={`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`}
        />
      </div>
    </header>
  );
}
