type ToastProps =
  | { type: "info" | "warn" | "err"; color?: never; open: boolean }
  | { type?: never; color: string; open: boolean };

export default function Toast({ type, color, open = false, children }: ToastProps & { children?: React.ReactNode }) {
  const resolvedColor = type ? (type === "info" ? "blue" : type === "warn" ? "orange" : "red") : color;

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-200 text-blue-800 border-blue-300",
    orange: "bg-orange-200 text-orange-800 border-orange-300",
    red: "bg-red-200 text-red-800 border-red-300",
    slate: "bg-slate-200 text-slate-800 border-slate-300",
  };

  const classes = colorClasses[resolvedColor || "slate"];
  return (
    <dialog
      open={open}
      className={`
          fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-md border w-auto max-w-md
          animate-appear-from-top  ${classes}
        `}
    >
      {children}
    </dialog>
  );
}
