export default function ProduseLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-surface" />
        <div className="h-12 w-72 animate-pulse rounded bg-surface" />
      </div>
      <div className="flex gap-12">
        <aside className="hidden w-60 shrink-0 space-y-2 md:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-surface" />
          ))}
        </aside>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded bg-surface" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
