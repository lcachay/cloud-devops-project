module.exports = {
  apps: [
    {
      name: "cloud-devops-project",
      script: "node",
      args: "node_modules/next/dist/bin/next start -p 3000 -H 0.0.0.0",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
