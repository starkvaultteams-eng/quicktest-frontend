export default function PageLoader({ label = "Loading..." }) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      </div>
    </div>
  );
}
