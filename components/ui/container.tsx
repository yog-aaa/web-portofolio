import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export function Container<T extends ElementType = "div">({ as, className = "", children, ...props }:
  { as?: T; className?: string; children: ReactNode } & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">) {
  const Component = as ?? "div";
  return <Component className={`container-site ${className}`} {...props}>{children}</Component>;
}
