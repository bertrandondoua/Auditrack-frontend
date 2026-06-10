"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useAdminResetPasswordMutation } from "@/redux/features/users/usersApiSlice";
import type { User } from "@/types/user";

const schema = z.object({
  // Optional: leave blank to have the backend generate + email a temp password.
  password: z.string().optional().default(""),
});

type FormValues = z.infer<typeof schema>;

export interface ResetPasswordDialogProps {
  dict: Dict;
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetPasswordDialog({
  dict,
  user,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const { toast } = useToast();
  const [adminReset, { isLoading }] = useAdminResetPasswordMutation();
  const [visible, setVisible] = useState(false);
  const r = dict.users.reset;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ password: "" });
      setVisible(false);
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    if (!user?.uuid) return;
    const password = values.password?.trim();
    try {
      const res = await adminReset({
        uuid: user.uuid,
        ...(password ? { password } : {}),
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, password ? r.success_set : r.success_emailed, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{r.title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <p className="text-sm text-[#585757]">{r.description.replace("{name}", fullName)}</p>
          <FormField
            label={r.password}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            placeholder={r.password_placeholder}
            error={errors.password?.message}
            icon={visible ? Eye : EyeClosed}
            iconProps={{ behavior: "append", className: "cursor-pointer" }}
            onIconClick={() => setVisible((v) => !v)}
            inputProps={register("password")}
          />
          <p className="text-xs text-[#585757]">{r.generate_hint}</p>
          <DialogFooter className="self-end h-fit">
            <Button
              type="button"
              variant="dark"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" size="lg" isLoading={isLoading}>
              {r.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
