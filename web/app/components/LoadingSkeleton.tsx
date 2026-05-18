export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[120, 80, 96, 72, 88].map((width, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface-raised overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border">
            <div
              className="h-3 rounded bg-border animate-pulse-subtle"
              style={{ width: `${width}px` }}
            />
          </div>
          <div className="px-4 py-4 flex flex-col gap-2">
            <div className="h-3 rounded bg-border animate-pulse-subtle w-full" style={{ animationDelay: "0.1s" }} />
            <div className="h-3 rounded bg-border animate-pulse-subtle w-4/5" style={{ animationDelay: "0.2s" }} />
            <div className="h-3 rounded bg-border animate-pulse-subtle w-3/5" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
