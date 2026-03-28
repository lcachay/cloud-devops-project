"use client";

import { useState, useEffect, useTransition } from "react";

type DashboardData = {
  appName: string;
  environment: string;
  buildTime: string;
  commitHash: string;
  branch: string;
  region: string;
  uptime: string;
};

export default function Dashboard() {
  const refreshRate = 10000;
  const [data, setData] = useState<DashboardData | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchDashboard = () => {
    startTransition(() => {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((json: DashboardData) => setData(json))
        .catch((err) => console.error("Failed to fetch dashboard:", err));
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchDashboard, refreshRate);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {isPending && <p style={{ color: "gray" }}>Updating…</p>}
      <h1>{data.appName}</h1>
      <p>Environment: {data.environment}</p>
      <p>Build Time: {data.buildTime}</p>
      <p>Commit: {data.commitHash}</p>
      <p>Branch: {data.branch}</p>
      <p>Region: {data.region}</p>
      <p>Server Uptime: {data.uptime}</p>
    </div>
  );
}
