import { readAppBuildInfo } from "@/lib/appBuildInfo";
import { cn } from "@/lib/utils";

type AppBuildVersionProps = {
  className?: string;
};

export function AppBuildVersion({ className }: AppBuildVersionProps) {
  const buildInfo = readAppBuildInfo();
  return (
    <p
      className={cn(
        "group-data-[collapsible=icon]:hidden truncate text-[0.68rem] leading-snug text-sidebar-foreground/55",
        className,
      )}
      title={buildInfo.title}
      data-testid="app-build-version"
      aria-label={buildInfo.title}
    >
      {buildInfo.label}
    </p>
  );
}
