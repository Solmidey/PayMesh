import { clsx } from "clsx";

export default function Timeline({ items }: { items: { t: number; label: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((e, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={clsx("w-2 h-2 rounded-full",
            i === items.length - 1 ? "bg-paymesh-accent" : "bg-white/30")} />
          <div className="text-sm opacity-80">
            {new Date(e.t).toLocaleTimeString()} &middot; {e.label}
          </div>
        </div>
      ))}
      {!items.length && <div className="text-sm opacity-60">No events yet.</div>}
    </div>
  );
}
