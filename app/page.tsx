"use client";

import { useState, useEffect, useTransition } from "react";
import Toast from "./components/Toast";
import EnvTopBar from "./components/EnvTopBar";
import { DashboardMetrics } from "@/lib/metrics/types";
import DashboardCard from "./components/DashboardCard";
import { Duration } from "luxon";
import CircularProgress from "./components/CircularProgress";
import SaveClipboard from "./components/SaveClipboard";

export default function Dashboard() {
  const refreshRate = 10000;
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchDashboard = () => {
    startTransition(() => {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((json: DashboardMetrics) => setData(json))
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

  if (!data)
    return (
      <main>
        <Toast type='info' open={true}>
          Loading dashboard...
        </Toast>
        {/* Skeleton goes here */}
      </main>
    );

  return (
    <>
      <header>
        <EnvTopBar env={data.environment as "development" | "production"} />
      </header>
      <main className='grid-cols-1 sm:grid-cols-4 gap-6 p-6 grid'>
        <DashboardCard className='sm:col-span-3 items-center flex'>
          <h1 className='text-3xl min-w-fit '>{data.appName}</h1>
        </DashboardCard>

        <DashboardCard className='flex text-xs flex-wrap justify-around gap-2 items-center sm:flex-col sm:items-start'>
          <p>Region: {data.region}</p>
          <p>Version: {data.version}</p>
          <p>Branch: {data.branch}</p>
        </DashboardCard>
        <DashboardCard className='col-span-full md:col-span-2 flex justify-center flex-col '>
          <h2 className='text-lg'>CI/CD</h2>
          <div className='flex flex-col gap-1'>
            <details>
              <summary>
                <span>
                  Build Time:
                  <span className='text-gray-500 font-normal'> {new Date(data.buildTime).toLocaleString()}</span>
                </span>
              </summary>
              <div className='text-xs text-gray-600'>Raw timestamp: {data.buildTime}</div>
            </details>
            <p className='relative w-fit '>
              Latest commit SHA: {data.latestCommit.slice(0, 7)}
              <span className='absolute -right-8 top-1/2 -translate-y-1/2'>
                <SaveClipboard text={data.latestCommit} />
              </span>
            </p>

            <details>
              <summary className='font-medium text-gray-800'>
                <span>
                  Last Deploy Time:
                  <span className='text-gray-500 font-normal'> {new Date(data.deployTime).toLocaleString()}</span>
                </span>
              </summary>
              <div className='text-xs text-gray-600'>Raw timestamp: {data.deployTime}</div>
            </details>
            <p>Last deploy status: {data.deployStatus}</p>
          </div>
        </DashboardCard>
        <DashboardCard className='col-span-full md:col-span-2 flex justify-center flex-col '>
          <h2 className='text-lg'>System Metrics</h2>
          <div className='grid auto-cols-fr grid-flow-col w-full justify-items-center gap-6 items-center text-center items-baseline '>
            <div className='flex flex-col items-center justify-center gap-2 max-w-fit'>
              <CircularProgress
                percentage={parseFloat(data.cpu) * 100}
                size={75}
                strokeWidth={10}
                color='var(--color-sky-400)'
              />
              <p className='text-nowrap'>CPU Usage</p>
            </div>
            <div className='flex flex-col items-center justify-center gap-2 max-w-fit'>
              <CircularProgress
                percentage={parseFloat(
                  ((parseInt(data.memory) / (parseInt(data.totalMemory) * 1024)) * 100).toFixed(2),
                )}
                size={75}
                strokeWidth={10}
                color='var(--color-sky-400)'
              />
              <p className='text-nowrap'>Memory Usage</p>
            </div>
            <div className='flex flex-col items-center justify-center gap-2 max-w-fit'>
              <p className='text-nowrap'>Server Uptime</p>
              <p className='text-2xl'>
                {Duration.fromMillis(new Date().getTime() - parseInt(data.uptime)).toFormat("hh:mm:ss")}
              </p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard className='col-span-full flex justify-center flex-col '>
          <h2 className='text-lg'>Traffic Metrics</h2>
          <div className='grid-cols-3 sm:grid-cols-5  grid w-full justify-items-center gap-6 items-start text-center items-baseline '>
            <div className='flex flex-col items-center justify-around gap-2 max-w-fit h-full'>
              <p className='text-5xl'>{data.requestsPerSecond.toFixed(1)}</p>
              <p>Requests per&nbsp;second</p>
            </div>
            <div className='flex flex-col items-center justify-around gap-2 max-w-fit h-full'>
              <p className='text-5xl'>{data.totalRequests}</p>
              <p>Total Requests</p>
            </div>
            <div className='flex flex-col items-center justify-around gap-2 max-w-fit h-full'>
              <p className='text-5xl'>{data.totalErrors}</p>
              <p>Total Errors</p>
            </div>
            <div className='flex flex-col items-center justify-around gap-2 max-w-fit h-full'>
              <CircularProgress
                percentage={parseFloat(data.errorRate)}
                size={75}
                strokeWidth={10}
                color='var(--color-red-400)'
              />
              <p className='text-nowrap'>Error Rate</p>
            </div>
            <div className=' flex flex-col items-center justify-around gap-2 max-w-fit h-full'>
              <p className='text-3xl'>{data.avgResponseTime}</p>
              <p>Avg. Response Time</p>
            </div>
          </div>
        </DashboardCard>
        <Toast type='info' open={isPending}>
          Updating...
        </Toast>
      </main>
    </>
  );
}
