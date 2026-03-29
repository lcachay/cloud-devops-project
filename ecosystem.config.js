module.exports = {
  apps: [
    {
      name: "cloud-devops-project",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 0.0.0.0",
      watch: false,
      cwd: "/opt/cloud-devops-project",
      exec_mode: "fork",
      instances: 1,
      autorestart: false,
      kill_timeout: 5000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: "production",
        ENVIRONMENT: "development",
      },
      env_development: {
        NODE_ENV: "production",
        ENVIRONMENT: "development",
      },
      env_production: {
        NODE_ENV: "production",
        ENVIRONMENT: "production",
      },
    },
  ],
};
