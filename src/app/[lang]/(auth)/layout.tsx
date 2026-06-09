import LanguageSelector from "@/components/shared/Layout/LanguageSelector";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 bg-[url('/auth_back@2x.svg')] bg-cover bg-no-repeat bg-center">
      <LanguageSelector />
      {children}
    </div>
  );
}
