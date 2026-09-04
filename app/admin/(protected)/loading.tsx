export default function AdminLoading() {
  return <main aria-busy="true" aria-label="Loading owner workspace" className="animate-pulse py-4">
    <div className="h-3 w-28 rounded-control bg-accent-soft" />
    <div className="mt-5 h-10 max-w-md rounded-control bg-accent-soft" />
    <div className="mt-10 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-32 border-t border-border bg-surface" />)}</div>
  </main>;
}
