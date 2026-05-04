import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          Calm nutrition tracking.
        </p>
        <p className="mt-4 max-w-lg text-lg text-muted">
          Log meals, see your summary, and stay on top of your goals — minimal interface, clear data.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
          >
            Create account
          </Link>
        </div>
        <Card className="mt-16">
          <p className="text-sm text-muted">
            Connect this app to your Sarthi API. Set{" "}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-xs text-ink">NEXT_PUBLIC_API_URL</code> in{" "}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-xs text-ink">.env.local</code>.
          </p>
        </Card>
      </div>
    </div>
  );
}
