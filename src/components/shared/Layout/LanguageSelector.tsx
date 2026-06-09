"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { i18n, type Locale } from "@/i18n-config";

interface Language {
  code: Locale;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", flag: "/GB.svg" },
  { code: "fr", flag: "/FR.svg" },
];

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (i18n.locales as readonly string[]).includes(value);
}

export default function LanguageSelector({
  defaultLanguage = i18n.defaultLocale,
}: {
  defaultLanguage?: Locale;
}) {
  const { lang } = useParams<{ lang: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<Locale>(
    isLocale(lang) ? lang : defaultLanguage,
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleChangeLanguage = (next: Locale) => {
    setCurrentLanguage(next);
    if (typeof window !== "undefined") window.localStorage.setItem("lang", next);
    const newPathname = `/${next}${pathname.slice(3)}`;
    const queryString = new URLSearchParams(Object.fromEntries(searchParams.entries())).toString();
    router.push(queryString ? `${newPathname}?${queryString}` : newPathname);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isLocale(lang)) {
      setCurrentLanguage(lang);
      if (typeof window !== "undefined") window.localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const currentFlag = LANGUAGES.find((l) => l.code === currentLanguage)?.flag ?? "/FR.svg";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded p-2 flex items-center capitalize"
      >
        <Image
          height={24}
          width={24}
          src={currentFlag}
          alt={`${currentLanguage} flag`}
          className="inline-block w-5 h-5 mr-2"
        />
        {currentLanguage}
        <ChevronDown className={`${isOpen ? "rotate-180" : ""} transition-all duration-200`} />
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-2 bg-white border-gray-300 rounded-md shadow-lg px-2 py-2">
          {LANGUAGES.map((l) => (
            <li
              key={l.code}
              onClick={() => handleChangeLanguage(l.code)}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-200 capitalize"
            >
              <Image
                src={l.flag}
                alt={`${l.code} flag`}
                height={24}
                width={24}
                className="inline-block w-5 h-5 mr-2"
              />
              {l.code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
