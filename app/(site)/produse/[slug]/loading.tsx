export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8 h-3 w-48 animate-pulse rounded bg-surface" />
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-square animate-pulse rounded bg-surface" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded bg-surface" />
          <div className="h-12 w-full animate-pulse rounded bg-surface" />
          <div className="h-24 w-full animate-pulse rounded bg-surface" />
          <div className="h-12 w-40 animate-pulse rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}
