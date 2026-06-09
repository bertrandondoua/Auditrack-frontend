"use client";

import { useEffect } from "react";
import type { Dict } from "@/lib/dictionaries";

import Loading from "@/app/[lang]/loading";
import { type getDictionary } from "@/lib/dictionaries";
import type { Role } from "@/lib/types";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useGetAuthenticatedUserQuery } from "@/redux/features/users/usersApiSlice";
import { useAppDispatch } from "@/redux/hooks";

import Header from "./header";
import Sidebar from "./sidebar";

export default function Layout({
  children,
  dict,
}: Readonly<{
  children: React.ReactNode;
  dict: Dict;
}>) {
  const dispatch = useAppDispatch();
  const { data: user, isLoading } = useGetAuthenticatedUserQuery();

  useEffect(() => {
    if (user) dispatch(setCredentials(user));
  }, [user, dispatch]);

  if (isLoading) return <Loading />;

  return (
    <section className="flex min-h-screen">
      <Sidebar dict={dict} userRole={(user?.role ?? "clerk") as Role} />

      <div className="flex flex-col w-full overflow-auto">
        <Header user={user} dict={dict} />
        <main style={{ maxHeight: "calc(100vh - 64px)" }} className="flex-grow p-6 overflow-y-auto">
          {children}
          <p className="mt-6 w-fit ml-auto absolute bottom-5 right-5">
            <span className="text-[#5e5e5e] text-sm leading-7">Proudly powered by</span>{" "}
            <span className="text-[#5e5e5e] text-lg leading-7">AITECAF</span>
          </p>
        </main>
      </div>
    </section>
  );
}
