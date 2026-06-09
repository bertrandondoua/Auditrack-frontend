"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Dict } from "@/lib/dictionaries";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useGetAuthConfigQuery,
  useLoginMutation,
  useSendOtpMutation,
} from "@/redux/features/auth/authApiSlice";

const schema = z.object({
  username: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm({ dict }: Readonly<{ dict: Dict }>) {
  const { toast } = useToast();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();

  // Public config — tells us at runtime whether this backend requires an OTP.
  // Defaults to the OTP flow if the config can't be read, since OTP is the
  // backend's default (safer to ask for a code than to send a doomed grant).
  const { data: authConfig } = useGetAuthConfigQuery();
  const requireOtp = authConfig?.login_require_otp ?? true;

  const isLoading = loggingIn || sendingOtp;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const clearAuthKeys = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      // Surgical clear — preserve locale prefs, etc. Only auth keys.
      window.localStorage.removeItem("tokens");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("userCredentials");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    clearAuthKeys();
    try {
      if (requireOtp) {
        // OTP flow: request a code, stash creds, hand off to /verification
        // which finishes the token exchange with the entered code.
        await sendOtp({ email: values.username }).unwrap();
        window.localStorage.setItem(
          "userCredentials",
          JSON.stringify({ username: values.username, password: values.password }),
        );
        router.push("verification");
        return;
      }
      // No OTP — straight OAuth2 password grant.
      const res = await login({
        username: values.username,
        password: values.password,
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.signin.login_Success, dict);
      router.push("dashboard");
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
            <h2 className="text-gray-800 text-center text-2xl font-bold">{dict.signin.welcome}</h2>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <FormField
                label={<span className="text-gray-800">Email*</span>}
                type="email"
                autoComplete="email"
                placeholder={dict.signin.mail}
                error={errors.username?.message}
                inputProps={register("username")}
              />

              <FormField
                label={<span className="text-gray-800">{dict.signin.password}</span>}
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                placeholder={dict.signin.password_msg}
                error={errors.password?.message}
                icon={visible ? Eye : EyeClosed}
                iconProps={{ behavior: "append", className: "cursor-pointer" }}
                onIconClick={() => setVisible((v) => !v)}
                inputProps={register("password")}
              />

              <div className="flex flex-wrap items-center justify-end gap-4">
                <Link
                  href="forgot-password"
                  className="hover:underline font-semibold decoration-[#126D4E] text-[#126D4E] text-sm"
                >
                  {dict.signin.fogot_pass}
                </Link>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full !mt-8">
                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : dict.signin.login}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
