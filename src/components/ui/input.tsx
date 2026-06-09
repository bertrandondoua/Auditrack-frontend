import * as React from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconProps =
  | React.SVGProps<SVGSVGElement>
  | LucideProps
  | (React.SVGProps<SVGSVGElement> & { children?: never });

type IconPropsWithBehavior<T extends IconProps> = T & {
  behavior: "append" | "prepend";
};

export type IconComponent<T extends IconProps = IconProps> = React.FC<T>;

export type InputProps<T extends IconComponent = IconComponent> =
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: T;
    iconProps?: T extends IconComponent<infer P> ? IconPropsWithBehavior<P> : never;
    onIconClick?: () => void;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      icon,
      iconProps: { behavior: iconBehavior = "append", className: iconClassName, ...iconProps } = {
        behavior: "append",
      },
      readOnly,
      onIconClick,
      ...props
    },
    ref,
  ) => {
    const Icon = icon;

    return (
      <div
        aria-disabled={readOnly}
        className={cn(
          "flex items-center justify-center m-0 p-0 rounded-md border-input border-2 bg-[#F3F3F3] px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-[3px] focus-within:ring-primary disabled:cursor-not-allowed",
          className,
          readOnly ? "bg-white cursor-not-allowed" : "",
        )}
      >
        {Icon && type !== "file" && iconBehavior === "prepend" && (
          <Icon
            onClick={onIconClick}
            className={cn("w-4 h-4 mr-3 text-muted-foreground", iconClassName)}
            {...iconProps}
          />
        )}
        <input
          type={type}
          className={cn(
            "flex items-center border-0 focus-within:border-0 focus-within:ring-0 py-4 justify-center h-9 w-full bg-transparent placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed",
            type !== "file" ? "py-1" : "py-1.5",
            className,
          )}
          readOnly={readOnly}
          aria-readonly={readOnly}
          disabled={readOnly}
          ref={ref}
          {...props}
        />
        {Icon && type !== "file" && iconBehavior === "append" && (
          <Icon
            onClick={onIconClick}
            className={cn("w-4 h-4 ml-3 text-muted-foreground", iconClassName)}
            {...iconProps}
          />
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
