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

# --- 1. Collect metrics ---
CPU=$(pm2 jlist | jq '.[0].monit.cpu')
MEMORY=$(pm2 jlist | jq '.[0].monit.memory')
PROCESS_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status')
UPTIME=$(pm2 jlist | jq '.[0].pm2_env.pm_uptime')
RESTART_COUNT=$(pm2 jlist | jq '.[0].pm2_env.restart_time')

# --- 2. Export them in the current shell ---
export CPU MEMORY PROCESS_STATUS UPTIME RESTART_COUNT

# --- 3. Start/restart PM2 as root, preserving env ---
sudo -E pm2 startOrRestart ecosystem.config.cjs --env $ENVIRONMENT --update-env
sudo -E pm2 save

sudo -E pm2 save

echo "Deploy finished"