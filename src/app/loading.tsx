export default function Loading() {
  return (
    <div className="flex min-h-[65vh] w-full flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full bg-cyan-500/15 blur-xl animate-pulse" />
        <div className="h-11 w-11 rounded-full border-2 border-border/80 border-t-cyan-400 animate-spin" />
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse font-medium">
        Loading...
      </p>
    </div>
  );
}
