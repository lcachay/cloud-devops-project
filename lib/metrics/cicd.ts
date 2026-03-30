export function getCICDMetrics() {
  return {
    appName: process.env.APP_NAME || "unknown",
    environment: process.env.ENVIRONMENT || "unknown",
    region: process.env.AWS_REGION || "unknown",
    version: process.env.VERSION || "unknown",
    branch: process.env.BRANCH || "unknown",
    buildTime: process.env.BUILD_TIME || "unknown",
    latestCommit: process.env.COMMIT_HASH || "unknown",
    deployTime: process.env.DEPLOY_TIME || "unknown",
    deployStatus: process.env.DEPLOY_STATUS || "unknown",
  };
}
