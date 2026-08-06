# AWS Deployment Guide — StudyHall UBC

## Architecture Overview

StudyHall UBC uses a fully AWS-native architecture:

- **Frontend**: Next.js on AWS Amplify Hosting (SSR)
- **Backend**: AWS Lambda + API Gateway (SAM)
- **Database**: Amazon RDS PostgreSQL
- **AI**: Amazon Bedrock (Claude 3.5 Haiku)

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
│                                                              │
│  ┌──────────────┐     ┌──────────────────┐                 │
│  │   Amplify    │     │   CloudFront     │ (CDN)           │
│  │  (Next.js)   │◀───▶│   + S3 static    │                 │
│  └──────┬───────┘     └──────────────────┘                 │
│         │                                                    │
│         │  NEXT_PUBLIC_API_URL                               │
│         ▼                                                    │
│  ┌──────────────┐     ┌──────────────────┐                 │
│  │ API Gateway  │────▶│  Lambda (SAM)    │                 │
│  │   (REST)     │     │  Node.js 20.x    │                 │
│  └──────────────┘     └────────┬─────────┘                 │
│                                │                             │
│                    ┌───────────┼───────────┐                │
│                    ▼                       ▼                 │
│           ┌──────────────┐       ┌──────────────┐          │
│           │  RDS Postgres │       │   Bedrock    │          │
│           │  (studyhall)  │       │ (Claude 3.5  │          │
│           │               │       │   Haiku)     │          │
│           └──────────────┘       └──────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Steps

### Step 1: Deploy the Backend (SAM)

The backend uses AWS SAM (Serverless Application Model).

**Prerequisites:**
- AWS CLI configured (`aws configure`)
- SAM CLI installed (`brew install aws-sam-cli`)
- An RDS PostgreSQL instance running

**Deploy:**

```bash
cd backend

# Build
sam build

# Deploy (first time — guided)
sam deploy --guided
```

During guided deploy, you'll be prompted for:

| Parameter | Description |
|-----------|-------------|
| `DBHost` | RDS PostgreSQL endpoint (e.g. `studyhall.xxxxx.us-west-2.rds.amazonaws.com`) |
| `DBName` | Database name (default: `studyhall`) |
| `DBUser` | Database user (default: `postgres`) |
| `DBPassword` | Database password |

After deploy, SAM outputs the **API Gateway URL**. Save it — you'll need it for the frontend.

```
Outputs:
  ApiUrl: https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod
```

### Step 2: Initialize the Database

Run the schema and seed SQL against your RDS instance:

```bash
psql -h <RDS_ENDPOINT> -U postgres -d studyhall -f backend/sql/schema.sql
psql -h <RDS_ENDPOINT> -U postgres -d studyhall -f backend/sql/seed.sql
```

Or use the seed endpoint after deploy:

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod/api/seed
```

### Step 3: Deploy the Frontend (Amplify)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create new app"** → **"Host web app"**
3. Select **GitHub**, authorize, and choose `DHu06/CIC-Hack` on the `main` branch
4. Amplify auto-detects the `amplify.yml` build config
5. Add the environment variable:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod/api` | The API Gateway URL from Step 1 |

6. Click **Save and deploy**

### Step 4: Enable Bedrock Model Access

The Lambda functions call Amazon Bedrock (Claude 3.5 Haiku). You need to enable model access:

1. Go to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to **Model access** → **Manage model access**
3. Enable **Anthropic → Claude 3.5 Haiku** (`anthropic.claude-3-5-haiku-20241022-v1:0`)
4. Ensure the Lambda execution role has `bedrock:InvokeModel` permission

The SAM template's Lambda functions inherit the default execution role. You may need to add this policy:

```json
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0"
}
```

## Environment Variables Summary

### Frontend (Amplify)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | API Gateway URL from SAM deploy |

### Backend (Lambda — set via SAM parameters)

| Variable | Source |
|----------|--------|
| `DB_HOST` | RDS endpoint |
| `DB_NAME` | `studyhall` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | RDS password |
| `DB_PORT` | `5432` |
| `AWS_BEDROCK_REGION` | Auto (from Lambda region) |

## Subsequent Deploys

- **Frontend**: Push to `main` → Amplify auto-deploys
- **Backend**: Run `sam build && sam deploy` from the `backend/` directory

## Cost Estimate (Hackathon/Demo)

| Service | Free Tier |
|---------|-----------|
| Amplify Hosting | 1000 build min/mo + 15 GB served/mo |
| Lambda | 1M requests/mo |
| API Gateway | 1M calls/mo |
| RDS (db.t3.micro) | 750 hours/mo for 12 months |
| Bedrock (Claude Haiku) | Pay per token (~$0.25/1M input, $1.25/1M output) |

For demo/hackathon traffic: effectively **$0/month** except minor Bedrock token costs.
