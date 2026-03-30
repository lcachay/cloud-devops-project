export default function DashboardCard({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={`px-4 py-6 bg-white text-slate-700 rounded-2xl ${className}`}>{children}</div>;
}
