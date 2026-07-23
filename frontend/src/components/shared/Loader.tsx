export default function Loader({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-mad-accent border-t-transparent" />
      <p className="text-sm text-mad-muted">{label}</p>
    </div>
  );
}
