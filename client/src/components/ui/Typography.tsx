import { HTMLAttributes, ElementType } from "react";
import { cn } from "../../lib/cn";

type TypographyVariant = "h1" | "h2" | "body" | "n1" | "label" | "caption";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant: TypographyVariant;
  as?: ElementType;
  nowrap?: boolean;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: "text-h1 font-poppins font-bold",
  h2: "text-h2 font-poppins font-semibold",
  body: "text-body font-manrope font-semibold",
  n1: "text-n1 font-manrope font-medium",
  label: "text-sm font-poppins font-medium",
  caption: "font-poppins text-sm font-normal",
};

const defaultTags: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  body: "p",
  n1: "p",
  label: "label",
  caption: "p",
};

export function Typography({
  variant,
  as,
  nowrap,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = as || defaultTags[variant];

  return (
    <Component
      className={cn(
        variantStyles[variant],
        nowrap && "whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
