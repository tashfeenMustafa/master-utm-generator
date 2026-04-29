import { HealthChecker } from "@/components/health/health-checker";

export const metadata = {
  title: "UTM Health Checker | MagicUTMs",
  description: "Free tool to audit your UTM tracking links for best practices and consistency.",
};

export default function HealthCheckerPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 font-display">
            Health Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Audit your marketing links for consistency and tracking reliability.
          </p>
        </div>
      </div>

      <HealthChecker />
    </div>
  );
}
