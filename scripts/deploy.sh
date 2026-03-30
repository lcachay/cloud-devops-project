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

sudo -E pm2 startOrRestart ecosystem.config.cjs --env $ENVIRONMENT --update-env
sudo -E pm2 save

sudo -E pm2 save

echo "Deploy finished"