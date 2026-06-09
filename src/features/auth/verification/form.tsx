"use client";

import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Countdown, { type CountdownApi, zeroPad } from "react-countdown";
import type { Dict } from "@/lib/dictionaries";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useLoginMutation,
  useResetPasswordMutation,
  useSendOtpMutation,
} from "@/redux/features/auth/authApiSlice";

const COUNTDOWN_MS = 30_000;

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function VerificationForm({ dict }: { dict: Dict }) {
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [timeOut, setTimeOut] = useState(true);
  const [countdownState, setCountdownState] = useState({ date: Date.now() + COUNTDOWN_MS });
  const countdownApi = useRef<CountdownApi | null>(null);

  const [loginUser, { isLoading: loggingIn }] = useLoginMutation();
  const [sendOtp] = useSendOtpMutation();
  const [resetPassword, { isLoading: resettingPwd }] = useResetPasswordMutation();

  const handleResend = async (email: string) => {
    setOtp("");
    try {
      const res = await sendOtp({ email }).unwrap();
      setTimeOut(true);
      setCountdownState({ date: Date.now() + COUNTDOWN_MS });
      countdownApi.current?.start();
      showSuccesToasts(toast, res, dict.lang, dict.notification.otp_sent, dict);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const signinCreds = readJson<{ username: string; password: string }>("userCredentials");
    const resetCreds = readJson<{ email: string; password: string }>("userResseteCredentials");

    if (!signinCreds && !resetCreds) {
      router.push("signin");
      return;
    }

    if (signinCreds) {
      try {
        const res = await loginUser({ ...signinCreds, otp }).unwrap();
        Cookies.set("token", res.access_token);
        showSuccesToasts(toast, res, dict.lang, dict.signin.login_Success, dict);
        window.localStorage.removeItem("userCredentials");
        router.push("dashboard");
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
      return;
    }

    if (resetCreds) {
      try {
        const res = await resetPassword({ ...resetCreds, otp }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.notification.resset_pswd_success, dict);
        window.localStorage.removeItem("userResseteCredentials");
        router.push("signin");
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    }
  };

  const handleResetClick = () => {
    // Resend the OTP to whichever flow is active (signin or password reset).
    const signinCreds = readJson<{ username: string }>("userCredentials");
    if (signinCreds) {
      handleResend(signinCreds.username);
      return;
    }
    const resetCreds = readJson<{ email: string }>("userResseteCredentials");
    if (resetCreds) handleResend(resetCreds.email);
  };

  const renderer = ({
    seconds,
    completed,
  }: {
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      setTimeOut(false);
      return null;
    }
    return <span>{zeroPad(seconds)}</span>;
  };

  return (
    <section className="flex items-center justify-center flex-1 w-full text-center">
      <div className="w-full lg:w-1/2">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="logo"
            width={64}
            height={64}
            className="w-40 mb-8 mx-auto block"
          />
          <h2 className="text-[#2B2E31] font-bold text-3xl">{dict.otp.title}</h2>
          <p className="text-sm px-4 md:w-3/4 mx-auto">{dict.otp.subtitle}</p>
        </div>

        <div className="text-center flex justify-center my-5">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button isLoading={loggingIn || resettingPwd} type="submit" variant="default">
              {!loggingIn && !resettingPwd && dict.otp.btn}
            </Button>
          </form>
        </div>

        {!timeOut && (
          <button className="text-primary underline" onClick={handleResetClick}>
            {dict.otp.resend}
          </button>
        )}

        <p className="text-black text-base">
          {dict.otp.code_validity}{" "}
          <span>
            {timeOut ? (
              <>
                00:
                <Countdown
                  key={countdownState.date}
                  ref={(c) => {
                    countdownApi.current = c?.getApi() ?? null;
                  }}
                  date={countdownState.date}
                  renderer={renderer}
                  onStart={() => setTimeOut(true)}
                  onComplete={() => setTimeOut(false)}
                  autoStart
                />
              </>
            ) : (
              "00:00"
            )}
          </span>
        </p>
      </div>
    </section>
  );
}
