"use client";

import * as React from "react";
import { classNames } from "./utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={classNames(
      "shrink-0 bg-border",
      className,
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };