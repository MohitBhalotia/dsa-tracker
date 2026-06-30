import Link from "next/link";
import { BrandIcon } from "@/components/brand/brand-icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="surface-grid grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3 text-xl font-semibold tracking-tight">
          <BrandIcon className="size-11 rounded-[14px] shadow-lg shadow-stone-300/40" priority />
          <span>DSA Tracker</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
