import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import type { IconName } from "./icon";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-action text-on-action shadow-[0_1px_0_rgb(255_255_255/0.2)_inset,0_8px_16px_-8px_var(--action)] hover:bg-action-hover",
  secondary: "border border-line-strong bg-surface text-ink shadow-[0_1px_0_rgb(255_255_255/0.5)_inset] hover:bg-primary-tint hover:text-primary",
  ghost: "text-ink-muted hover:bg-sunken hover:text-ink",
  danger: "bg-danger text-on-danger hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap rounded-control font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      aria-hidden="true"
      className={cn("animate-spin motion-reduce:animate-none", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconButton({
  icon,
  label,
  className,
  ...rest
}: Omit<ButtonProps, "children" | "icon" | "loading"> & { icon: IconName; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-sunken hover:text-ink disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
