import Image from "next/image";
import { Code2 } from "lucide-react";

const platformIcons = [
  { match: ["youtube", "youtu.be"], src: "/yt.svg", label: "YouTube" },
  { match: ["gfg", "geeksforgeeks", "geeks"], src: "/gfg.png", label: "GeeksforGeeks" },
  { match: ["leetcode"], src: "/leetcode_dark.png", label: "LeetCode" },
  { match: ["takeuforward", "tuf"], src: "/tuf_dark.png", label: "TakeUForward" },
];

function getPlatformIcon(platform: string) {
  const normalized = platform.toLowerCase();
  return platformIcons.find((icon) => icon.match.some((needle) => normalized.includes(needle)));
}

export function PlatformIcon({ platform, className = "" }: { platform: string; className?: string }) {
  const icon = getPlatformIcon(platform);

  if (!icon) {
    return (
      <span className={`grid place-items-center rounded-full bg-muted text-muted-foreground ${className}`} aria-hidden="true">
        <Code2 className="size-3.5" />
      </span>
    );
  }

  return (
    <span className={`grid place-items-center rounded-full bg-background ${className}`} aria-hidden="true">
      <Image src={icon.src} alt="" width={20} height={20} className="max-h-[72%] max-w-[72%] object-contain" />
      <span className="sr-only">{icon.label}</span>
    </span>
  );
}
