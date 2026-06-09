import type { Locale } from "@/i18n-config";

interface ErrorData {
  [key: string]: string[] | string;
}

export interface ApiError {
  data?: ErrorData | { description?: string | string[]; [key: string]: unknown };
  status?: number;
}

type ToastFunction = (options: {
  variant: "destructive" | "success" | "default";
  title: string;
  description: string;
}) => void;

type Dict = {
  notification?: {
    error?: string;
    permission_denied?: string;
  };
};

export function showSuccesToasts(
  toast: ToastFunction,
  res: unknown,
  local?: Locale,
  msg?: string,
  dict?: Dict,
): void {
  const errored = res as { error?: { status?: number | string } } | undefined;
  if (errored?.error && typeof errored.error === "object") {
    if (String(errored.error.status) === "403") {
      toast({
        variant: "destructive",
        title: dict?.notification?.error ?? "Error",
        description: dict?.notification?.permission_denied ?? "",
      });
    } else {
      showErrorToasts(errored.error as ApiError, toast, local);
    }
    return;
  }

  toast({
    variant: "success",
    title: msg ?? "",
    description: "",
  });
}

/**
 * Accepts `unknown` so callers don't need `as Parameters<typeof showErrorToasts>[0]`
 * casts on every RTK Query catch. We treat anything that doesn't look like an
 * RTK Query error envelope as "unexpected error".
 */
export function showErrorToasts(error: unknown, toast: ToastFunction, local?: Locale): void {
  const e = (error ?? {}) as ApiError;
  if (e.data && typeof e.data === "object" && !("description" in e.data)) {
    const data = e.data as Record<string, unknown>;

    if (data.error_description) {
      toast({
        variant: "destructive",
        title: (data.error as string) ?? "Error",
        description: data.error_description as string,
      });
      return;
    }

    const errorData = e.data as ErrorData;
    const locals: Record<string, string> = {};
    let formattedKey = "";
    let message = "";

    Object.keys(errorData).forEach((key) => {
      const localeKey = key.split("_")[1];
      if (localeKey) locals[localeKey] = errorData[key] as string;

      formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      message = Array.isArray(errorData[key])
        ? (errorData[key] as string[]).join(", ")
        : (errorData[key] as string);
    });

    toast({
      variant: "destructive",
      title: formattedKey,
      description: Object.keys(locals).length > 0 && local ? locals[local] : message,
    });
    return;
  }

  const description = (e.data as { description?: string | string[] } | undefined)?.description;
  toast({
    variant: "destructive",
    title: "Error",
    description: Array.isArray(description)
      ? description.join(", ")
      : (description ?? "An unexpected error occurred."),
  });
}
