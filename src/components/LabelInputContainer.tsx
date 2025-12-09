import { cn } from "@/lib/utils";
import { ShineBorder } from "./ui";

export default function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-start justify-center overflow-hidden rounded-xl border border-neutral-50/10 bg-neutral-800 p-4 shadow-xl",
        className,
      )}
    >
      <ShineBorder
        className="absolute inset-0"
        shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
      />
      <div className="relative z-10 w-full space-y-2">{children}</div>
    </div>
  );
}
