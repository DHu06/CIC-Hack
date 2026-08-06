# AWS Deployment Guide — StudyHall UBC

## Deployment Architecture

StudyHall UBC is deployed on **AWS Amplify Hosting** with the following AWS services:

## AWS Services Used

### 1. AWS Amplify Hosting
- **Purpose**: Hosts the Next.js 16 application with server-side rendering (SSR)
- **Features used**:
  - Automatic CI/CD from GitHub (auto-deploy on push to `main`)
  - Server-side rendering support for Next.js App Router
  - Environment variable management (secrets stored securely)
  - Custom domain support with free SSL certificate
  - CDN distribution via Amazon CloudFront (built-in)
  - Branch-based deployments (preview deployments for PRs)

### 2. Amazon CloudFront (via Amplify)
- **Purpose**: Global CDN for static assets and edge caching
- **Features used**:
  - Edge locations for low-latency delivery worldwide
  - Automatic cache invalidation on deploy
  - HTTPS enforcement
  - Gzip/Brotli compression

### 3. AWS Lambda (via Amplify SSR)
- **Purpose**: Executes server-side rendering, Server Actions, and API routes
- **Features used**:
  - On-demand execution for SSR pages (React Server Components)
  - Server Actions execution (form submissions, RSVP, check-in)
  - AI pipeline calls to Anthropic (server-side only)
  - Auto-scaling based on traffic

### 4. Amazon S3 (via Amplify)
- **Purpose**: Static asset storage
- **Features used**:
  - Stores built Next.js static files (_next/static/)
  - Stores public assets (images, fonts)
  - Versioned deployments for instant rollback

### 5. AWS IAM
- **Purpose**: Access control and permissions
- **Features used**:
  - Amplify service role for deployment
  - Least-privilege access to resources

### 6. AWS Certificate Manager (ACM)
- **Purpose**: SSL/TLS certificates
- **Features used**:
  - Free SSL certificate for custom domain
  - Auto-renewal

## Setup Instructions

### Prerequisites
- AWS account
- GitHub repository connected to AWS Amplify
- Supabase project (external — not on AWS)

### Step 1: Connect to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Select GitHub and authorize
4. Choose the `DHu06/CIC-Hack` repository
5. Select the `main` branch
6. Amplify will auto-detect the Next.js framework

### Step 2: Configure Build Settings

Amplify should auto-detect the `amplify.yml` in the repo root. If not, use:

- Framework: Next.js - SSR
- Build command: `npm run build`
- Output directory: `.next`

### Step 3: Set Environment Variables

In the Amplify Console → App settings → Environment variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Public (OK in client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Public (OK in client) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | **Secret** — server-only |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | **Secret** — server-only |

### Step 4: Deploy

Push to `main` and Amplify auto-deploys. First deploy takes ~3-5 minutes.

### Step 5: Custom Domain (Optional)

1. In Amplify Console → Domain management
2. Add your custom domain
3. Amplify provisions an ACM certificate and configures CloudFront automatically

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                              │
│                                                          │
│  ┌─────────────┐     ┌──────────────┐                  │
│  │  CloudFront │────▶│   S3 Bucket  │ (static assets)  │
│  │    (CDN)    │     └──────────────┘                  │
│  └──────┬──────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐     ┌──────────────┐                  │
│  │   Lambda    │────▶│  Amplify     │ (build/deploy)   │
│  │ (SSR/API)   │     │  Hosting     │                  │
│  └──────┬──────┘     └──────────────┘                  │
│         │                                                │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼ (external services)
┌──────────────────┐    ┌──────────────────┐
│    Supabase      │    │   Anthropic AI   │
│  (Postgres +     │    │  (claude-sonnet) │
│   Auth + RT)     │    │                  │
└──────────────────┘    └──────────────────┘
```

## Cost Estimate (Hackathon/Demo)

- **Amplify Hosting**: Free tier covers 1000 build minutes/month + 15 GB served/month
- **Lambda**: Free tier covers 1M requests/month
- **CloudFront**: Free tier covers 1 TB data transfer/month
- **Total for demo usage**: ~$0/month (within free tier)

## Monitoring

- **Amplify Console**: Build logs, deploy status, access logs
- **CloudWatch**: Lambda execution logs, errors, latency metrics
- **X-Ray** (optional): Distributed tracing for SSR requests

## Differences from Local Development

| Aspect | Local | AWS Amplify |
|--------|-------|-------------|
| Server | `next dev` (Node.js) | Lambda functions |
| Static files | File system | S3 + CloudFront CDN |
| SSL | None (http://localhost) | ACM certificate (HTTPS) |
| Scaling | Single process | Auto-scaling Lambda |
| Deploys | Manual | Auto on git push |
| Env vars | `.env.local` file | Amplify Console (encrypted) |
