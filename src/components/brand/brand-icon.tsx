import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandIconProps = {
  className?: string;
  priority?: boolean;
};

export function BrandIcon({ className, priority = false }: BrandIconProps) {
  return (
    <Image
      src="/icon.svg"
      alt=""
      width={32}
      height={32}
      priority={priority}
      unoptimized
      className={cn("size-8 shrink-0 rounded-[10px]", className)}
    />
  );
}
