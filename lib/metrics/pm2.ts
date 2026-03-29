import pm2 from "pm2";
import { Pm2Metrics } from "./types";
import { formatUptime } from "./pm2-format";

export function getPm2Metrics(appName: string): Promise<Pm2Metrics> {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.describe(appName, (err, processList) => {
        if (err) {
          pm2.disconnect();
          return reject(err);
        }

        if (!processList || processList.length === 0) {
          pm2.disconnect();
          return reject("PM2 process not found");
        }

        const process = processList[0];
        const metrics: Pm2Metrics = {
          memory:
            process.monit && process.monit.memory ? `${(process.monit.memory / 1024 / 1024).toFixed(2)} MiB` : "0 MiB",
          cpu: process.monit && process.monit.cpu ? `${process.monit.cpu.toFixed(2)}%` : "0%",
          processStatus: process.pm2_env?.status || "unknown",
          uptime: formatUptime(process.pm2_env?.pm_uptime ?? 0),
          restartCount: process.pm2_env?.restart_time ?? 0,
        };

        pm2.disconnect();
        resolve(metrics);
      });
    });
  });
}
