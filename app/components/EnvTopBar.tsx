type EnvTopBarProps = { env: "development" | "production" };

export default function EnvTopBar({ env }: EnvTopBarProps) {
  const resolvedColor = env === "development" ? "olive" : "olive";

  const colorClasses: Record<string, string> = {
    mauve: "bg-mauve-300 text-mauve-700",
    olive: "bg-olive-300 text-olive-700",
  };

  const classes = colorClasses[resolvedColor || "slate"];
  return <div className={`sticky top-0 w-full text-xs p-1 ${classes}`}>Environment: {env}</div>;
}
