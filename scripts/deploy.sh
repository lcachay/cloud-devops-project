exec > >(tee -a /tmp/deploy.log) 2>&1

echo "CLEANUP"

export HOME=/root
export PM2_HOME=/root/.pm2

chown -R root:root /opt/${APP_NAME}

uptime

cd /opt
rm -rf ${APP_NAME}
mkdir ${APP_NAME}
cd ${APP_NAME}

echo "Downloading artifact"
aws s3 cp s3://${S3_BUCKET}/app-${GITHUB_SHA}.tar.gz app.tar.gz

echo "Extracting"
tar -xzf app.tar.gz

echo "Ecosystem file:"
if [ ! -f ecosystem.config.cjs ]; then
    echo "Missing ecosystem file"
    exit 1
fi

pm2 jlist | jq -r '.[] | ["CPU=" + (.monit.cpu|tostring), "MEMORY=" + (.monit.memory|tostring), "PROCESS_STATUS=" + .pm2_env.status, "UPTIME=" + (.pm2_env.pm_uptime|tostring), "RESTART_COUNT=" + (.pm2_env.restart_time|tostring)] | .[]' > .pm2-env
source .pm2-env

sudo pm2 startOrRestart ecosystem.config.cjs --env $ENVIRONMENT --update-env
sudo pm2 save

echo "Deploy finished, see /tmp/deploy.log for details"
cat /tmp/deploy.log