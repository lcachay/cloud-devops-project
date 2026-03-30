# Cloud DevOps Project

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/lcachay/cloud-devops-project/deploy.yml)
![GitHub package.json version](https://img.shields.io/github/package-json/v/lcachay/cloud-devops-project)
![Static Badge](https://img.shields.io/badge/node-%3E%3D20-blue)

Next.js dashboard app that exposes CI/CD, process, and traffic metrics, to demonstrate Cloud and DevOps concepts.
This application deploys through **GitHub Actions**, runs on an **EC2** instance, and uses **PM2** for process management.

![Dashboard Screen Example]()

## Environment Setup

### Local Env Template

```
APP_NAME=cloud-devops-project
ENVIRONMENT=environment
AWS_REGION=aws-region
VERSION=version-number
BRANCH=branch-name
BUILD_TIME=ISO
COMMIT_HASH=git-sha
DEPLOY_TIME=ISO
DEPLOY_STATUS=status
```

## Run locally

```bash
npm install
npm run dev
```

## Test

Unit tests for API routes and metrics calculations

```bash
npm test
```

## Deployment

This project is deployed automatically via GitHub Actions to AWS EC2 instances using PM2 for process management.

### Environments

| Environment | EC2 Instance ID       | Branch |
| ----------- | --------------------- | ------ |
| Development | `${DEV_INSTANCE_ID}`  | `dev`  |
| Production  | `${PROD_INSTANCE_ID}` | `prod` |

### Workflow

#### **Push to `dev` or `prod` branch**

Triggers the GitHub Actions workflow defined in deploy.yml:

    1. Checkout repo – gets all commits and history
    2. Install dependencies – using npm ci
    3. Set build info – generates .env with version, branch, commit, build & deploy times
    4. Run tests – ensures your code passes before deployment
    5. Build Next.js app
    6. Package artifact – .next, node_modules, package.json, public, ecosystem.config.cjs, and .env
    7. Upload artifacts – to GitHub Actions and S3 bucket
    8. Deploy – via AWS SSM using deploy.sh, which:
        1. Downloads the artifact from S3
        2. Extracts it to /opt/<APP_NAME>
        3. Start/Restart PM2 using ecosystem.config.cjs
        4. Updates the environment variables

### Actions secrets and variables

Required Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Required Variables:

- `AWS_REGION`
- `DEV_INSTANCE_ID`
- `PROD_INSTANCE_ID`
- `S3_BUCKET`

## API routes

- `GET /api/message` returns a basic test message.
- `GET /api/dashboard` returns merged CI/CD + PM2 + traffic metrics.
- `GET /api/debug` returns environment variables (debug use only).

## Notes

- On localhost PM2 metrics fall back to mock values since PM2 is not available locally.
