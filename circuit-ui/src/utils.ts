import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { ClassList } from "@builder.io/qwik";

export function cn(...inputs: ClassList[]) {
  // Merge class names
  return twMerge(clsx(inputs));
}
