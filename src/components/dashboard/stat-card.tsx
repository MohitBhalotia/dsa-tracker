import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "default" | "primary" | "urgent";
}) {
  return (
    <Card className={tone === "primary" ? "border-primary bg-primary text-primary-foreground" : tone === "urgent" ? "border-amber-300 bg-amber-50 text-stone-950 dark:bg-amber-950/30 dark:text-amber-50" : ""}>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className={tone === "default" ? "text-sm text-muted-foreground" : "text-sm opacity-70"}>{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className={tone === "default" ? "mt-1 text-xs text-muted-foreground" : "mt-1 text-xs opacity-70"}>{detail}</p>
        </div>
        <div className={tone === "default" ? "rounded-full bg-muted p-2" : "rounded-full bg-background/20 p-2"}>
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}
