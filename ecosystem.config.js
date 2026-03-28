module.exports = {
  apps: [
    {
      name: "cloud-devops-project",
      script: "npm",
      args: "start -- -p 3000 -H 0.0.0.0",
      watch: false,
      cwd: "/opt/cloud-devops-project",
      env: {
        NODE_ENV: "development",
        ENVIRONMENT: "development",
      },
      env_development: {
        NODE_ENV: "development",
        ENVIRONMENT: "development",
      },
      env_production: {
        NODE_ENV: "production",
        ENVIRONMENT: "production",
      },
    },
  ],
};
