"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Dict } from "@/lib/dictionaries";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useResetPasswordMutation } from "@/redux/features/auth/authApiSlice";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm({ dict }: Readonly<{ dict: Dict }>) {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const signinHref = `/${lang}/signin`;
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  /**
   * NOTE: Auditrack-api dropped the OTP step. Reset now does a direct POST
   * to /accounts/users/reset_password/ with email + new password. If OTP
   * returns, route back through /verification — the resetPassword mutation
   * already accepts an optional `otp` field.
   */
  const onSubmit = handleSubmit(async (values) => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      // Surgical clear — preserve locale prefs, etc.
      window.localStorage.removeItem("tokens");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("userCredentials");
      window.localStorage.removeItem("userResseteCredentials");
    }
    try {
      const res = await resetPassword({
        email: values.email,
        password: values.password,
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.notification.resset_pswd_success, dict);
      router.push(signinHref);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <div className="font-[sans-serif] w-screen">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          <div className="p-8 rounded-2xl">
            <Image
              src="/logo.svg"
              alt="logo"
              width={64}
              height={64}
              className="w-40 mb-8 mx-auto block"
            />
            <h2 className="text-gray-800 text-center text-2xl font-bold">
              {dict.forgot_password.title}
            </h2>
            <p className="text-gray-800 text-center">{dict.forgot_password.subtitle}</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <FormField
                label={dict.forgot_password.label}
                type="email"
                autoComplete="email"
                placeholder={dict.forgot_password.placeholder}
                error={errors.email?.message}
                inputProps={register("email")}
              />

              <FormField
                label={dict.new_password}
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                placeholder={dict.new_password}
                error={errors.password?.message}
                icon={visible ? Eye : EyeClosed}
                iconProps={{ behavior: "append", className: "cursor-pointer" }}
                onIconClick={() => setVisible((v) => !v)}
                inputProps={register("password")}
              />

              <div className="flex my-4 gap-4">
                <Button
                  type="button"
                  onClick={() => router.push(signinHref)}
                  className="w-full"
                  variant="dark"
                >
                  {dict.forgot_password.btn1}
                </Button>
                <Button type="submit" className="w-full" variant="default">
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    dict.forgot_password.btn2
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
