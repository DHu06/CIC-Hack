# StudyHall UBC — Architecture

## Overview

StudyHall UBC runs entirely on AWS (us-east-1). The frontend is a Next.js app hosted on AWS Amplify. The backend is a set of Lambda functions behind API Gateway that connect to an RDS PostgreSQL database and Amazon Bedrock for AI.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            AWS Cloud (us-east-1)                                  │
│                                                                                   │
│                                                                                   │
│    ┌───────────────────────────────────────────────────────────────────────┐     │
│    │                        AWS AMPLIFY HOSTING                             │     │
│    │                                                                        │     │
│    │    GitHub Repo ──▶ Auto Build ──▶ Deploy                              │     │
│    │                                                                        │     │
│    │    ┌──────────────┐    ┌────────────┐    ┌─────────────────────┐     │     │
│    │    │  CloudFront   │    │    S3      │    │   Lambda@Edge       │     │     │
│    │    │  (Global CDN) │    │  (Static   │    │   (Server-Side      │     │     │
│    │    │  HTTPS + Edge │    │   Assets)  │    │    Rendering)       │     │     │
│    │    │  Caching)     │    │  JS/CSS/   │    │   Next.js Pages     │     │     │
│    │    │               │    │  Images    │    │                     │     │     │
│    │    └───────────────┘    └────────────┘    └─────────────────────┘     │     │
│    │                                                                        │     │
│    └────────────────────────────────────────────────────────────────────────┘     │
│                                        │                                          │
│                                        │ fetch("/api/...")                         │
│                                        ▼                                          │
│    ┌────────────────────────────────────────────────────────────────────────┐     │
│    │                     AMAZON API GATEWAY (REST)                           │     │
│    │                     CORS: Access-Control-Allow-Origin: *                │     │
│    │                                                                        │     │
│    │    GET  /api/subjects                 GET  /api/subjects/{code}         │     │
│    │    GET  /api/sessions                 GET  /api/sessions/{id}           │     │
│    │    GET  /api/sessions/{id}/attendance                                   │     │
│    │    POST /api/sessions/{id}/rsvp       POST /api/sessions/{id}/checkin   │     │
│    │    POST /api/notes                                                      │     │
│    │    GET  /api/groups/{id}              POST /api/courses/{id}/match      │     │
│    │    POST /api/seed                                                       │     │
│    │                                                                        │     │
│    └───────────────────────────────────┬────────────────────────────────────┘     │
│                                        │                                          │
│                                        │ Routes request to Lambda                  │
│                                        ▼                                          │
│    ┌────────────────────────────────────────────────────────────────────────┐     │
│    │                      AWS LAMBDA (Node.js 20)                            │     │
│    │                      Serverless Functions                                │     │
│    │                                                                        │     │
│    │    ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────┐   │     │
│    │    │  subjects   │ │  sessions  │ │  attendance  │ │    notes     │   │     │
│    │    │  handler    │ │  handler   │ │   handler    │ │   handler    │   │     │
│    │    └──────┬──────┘ └──────┬─────┘ └──────┬───────┘ └──────┬───────┘   │     │
│    │           │               │              │                │            │     │
│    │    ┌──────┴──────┐ ┌──────┴──────┐                        │            │     │
│    │    │   groups    │ │    seed     │                        │            │     │
│    │    │   handler   │ │   handler   │                        │            │     │
│    │    └──────┬──────┘ └──────┬──────┘                        │            │     │
│    │           │               │                               │            │     │
│    │    ┌──────┴───────────────┴───────────────────────────────┘            │     │
│    │    │                                                                    │     │
│    │    │   Shared Libraries:                                                │     │
│    │    │     db.ts      → PostgreSQL connection pool (pg)                   │     │
│    │    │     bedrock.ts → Bedrock API client (Claude Haiku 4.5)            │     │
│    │    │     response.ts → CORS response helpers                            │     │
│    │    │                                                                    │     │
│    │    └────────────────────────────────────────────────────────────────────┘     │
│    │                                                                        │     │
│    └───────────────────┬────────────────────────────────┬───────────────────┘     │
│                        │                                │                          │
│                        ▼                                ▼                          │
│    ┌─────────────────────────────┐    ┌─────────────────────────────────────┐     │
│    │     AMAZON RDS              │    │        AMAZON BEDROCK                │     │
│    │     (PostgreSQL 15)         │    │                                      │     │
│    │                             │    │   Model: Claude 3.5 Haiku            │     │
│    │   ┌───────────────────┐    │    │   (anthropic.claude-3-5-haiku-       │     │
│    │   │ Tables:           │    │    │    20241022-v1:0)                     │     │
│    │   │                   │    │    │                                      │     │
│    │   │ • subjects        │    │    │   AI Capabilities:                    │     │
│    │   │ • courses         │    │    │   ┌────────────────────────────┐     │     │
│    │   │ • profiles        │    │    │   │ 1. Topic Extraction        │     │     │
│    │   │ • enrollments     │    │    │   │    Notes → Topics +        │     │     │
│    │   │ • note_uploads    │    │    │   │    Confidence Scores       │     │     │
│    │   │ • topic_profiles  │    │    │   ├────────────────────────────┤     │     │
│    │   │ • study_groups    │    │    │   │ 2. Group Naming            │     │     │
│    │   │ • group_members   │    │    │   │    Generate playful        │     │     │
│    │   │ • rooms           │    │    │   │    group names + rationale │     │     │
│    │   │ • sessions        │    │    │   ├────────────────────────────┤     │     │
│    │   │ • attendance      │    │    │   │ 3. Timeline Generation     │     │     │
│    │   │                   │    │    │   │    Plan 6 study sessions   │     │     │
│    │   │ Instance:         │    │    │   │    with topics + goals     │     │     │
│    │   │ db.t3.micro       │    │    │   └────────────────────────────┘     │     │
│    │   │ (Free Tier)       │    │    │                                      │     │
│    │   └───────────────────┘    │    └─────────────────────────────────────┘     │
│    │                             │                                                │
│    └─────────────────────────────┘                                                │
│                                                                                   │
│    ┌────────────────────────────────────────────────────────────────────────┐     │
│    │                          AWS IAM                                        │     │
│    │                                                                        │     │
│    │   Lambda Execution Role:                                                │     │
│    │   • AmazonRDSDataFullAccess (connect to PostgreSQL)                    │     │
│    │   • AmazonBedrockFullAccess (invoke Claude Haiku model)                │     │
│    │   • CloudWatchLogsFullAccess (write execution logs)                     │     │
│    │   • VPC access (reach RDS in private subnet)                           │     │
│    │                                                                        │     │
│    └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. User visits the website

```
User's Browser
    │
    ▼
CloudFront (CDN, edge location nearest to user)
    │
    ├── Static asset (JS/CSS/image)? → Serve from S3 cache
    │
    └── Dynamic page? → Lambda@Edge renders Next.js → Returns HTML
```

### 2. Page fetches data from API

```
Browser (React component)
    │
    │  fetch("https://xyz.execute-api.us-east-1.amazonaws.com/Prod/api/subjects")
    ▼
API Gateway (validates request, applies CORS headers)
    │
    ▼
Lambda Function (subjects handler)
    │
    │  SQL: SELECT * FROM subjects ...
    ▼
RDS PostgreSQL (returns rows)
    │
    ▼
Lambda formats JSON response
    │
    ▼
API Gateway adds CORS headers → Browser receives JSON
```

### 3. Student uploads notes (AI pipeline)

```
Browser
    │
    │  POST /api/notes { user_id, course_id, raw_text }
    ▼
API Gateway → Lambda (notes handler)
    │
    ├── 1. INSERT INTO note_uploads (store raw text in RDS)
    │
    ├── 2. Call Bedrock (Claude Haiku 4.5)
    │       System: "Analyze student notes, extract 4-8 topics..."
    │       → Returns: { topics: [...], overall_pace, summary }
    │
    ├── 3. UPSERT INTO topic_profiles (store AI results in RDS)
    │
    └── 4. Return extracted topics to browser
            → Browser renders topic chips with confidence colors
```

### 4. Group matching algorithm

```
POST /api/courses/{id}/match
    │
    ▼
Lambda (groups handler)
    │
    ├── 1. SELECT topic_profiles WHERE course_id = X (from RDS)
    │
    ├── 2. Build topic confidence vectors per student
    │
    ├── 3. Run greedy complementarity algorithm:
    │       Score = Σ(max_confidence - min_confidence) per topic
    │       Penalize pace differences > 1 step
    │       Form groups of 4-6 maximizing complementarity
    │
    ├── 4. Call Bedrock for each group:
    │       → Generate playful name + rationale
    │
    ├── 5. INSERT INTO study_groups + group_members (RDS)
    │
    └── 6. Return formed groups with scores
```

### 5. RSVP + live attendance (polling)

```
User clicks "RSVP"
    │
    │  POST /api/sessions/{id}/rsvp { user_id }
    ▼
Lambda → INSERT INTO attendance → Success
    
Meanwhile, browser polls every 3 seconds:
    │
    │  GET /api/sessions/{id}/attendance
    ▼
Lambda → SELECT FROM attendance → Returns current count + attendees
    │
    ▼
Browser updates UI with new counts (no page refresh)
```

## AWS Services Used

| # | Service | Purpose | Free Tier |
|---|---------|---------|-----------|
| 1 | **AWS Amplify** | Frontend hosting, CI/CD from GitHub, SSR | 1000 build min/mo, 15 GB served |
| 2 | **Amazon CloudFront** | Global CDN, HTTPS, edge caching | 1 TB/month |
| 3 | **Amazon S3** | Static asset storage (JS, CSS, images) | 5 GB |
| 4 | **API Gateway** | REST API routing, CORS, throttling | 1M calls/month |
| 5 | **AWS Lambda** | Serverless backend compute (Node.js 20) | 1M invocations/month |
| 6 | **Amazon RDS** | PostgreSQL database (11 tables) | 750 hrs db.t3.micro |
| 7 | **Amazon Bedrock** | AI inference (Claude Haiku 4.5) | Pay per token (~$0.001/req) |
| 8 | **AWS IAM** | Permissions and access control | Free |

## Database Schema (RDS PostgreSQL)

```
subjects ──────┐
               │ 1:N
courses ───────┤
  │            │
  │ N:M        │
enrollments    │
  │            │
profiles ──────┤
  │            │
  │            │
note_uploads   │
  │            │
topic_profiles │
               │
study_groups ──┤
  │            │
group_members  │
               │
rooms ─────────┤
               │
sessions ──────┘
  │
attendance
```

## Project Structure

```
CIC-Hack/
├── src/                          # Next.js frontend (deploys to Amplify)
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── subjects/             # Subject browsing
│   │   ├── sessions/             # Session detail + RSVP
│   │   ├── groups/               # Group detail
│   │   ├── notes/                # PDF upload + topic extraction
│   │   └── me/                   # Redirect
│   ├── components/               # React components
│   └── lib/
│       └── api.ts                # API client (fetches from API Gateway)
│
├── backend/                      # Lambda backend (deploys via SAM)
│   ├── src/
│   │   ├── handlers/             # Lambda function handlers
│   │   │   ├── subjects.ts       # GET /subjects, GET /subjects/{code}
│   │   │   ├── sessions.ts       # GET /sessions, GET /sessions/{id}
│   │   │   ├── attendance.ts     # RSVP, check-in, get attendance
│   │   │   ├── notes.ts          # POST /notes (+ Bedrock AI call)
│   │   │   ├── groups.ts         # GET /groups/{id}, POST match
│   │   │   └── seed.ts           # POST /seed (populate demo data)
│   │   └── lib/
│   │       ├── db.ts             # PostgreSQL connection (pg library)
│   │       ├── bedrock.ts        # Bedrock client (Claude Haiku)
│   │       └── response.ts       # JSON response + CORS helpers
│   ├── sql/
│   │   ├── schema.sql            # Database table definitions
│   │   └── seed.sql              # Demo data (subjects, rooms, courses)
│   ├── template.yaml             # AWS SAM deployment template
│   └── package.json              # Backend dependencies
│
├── amplify.yml                   # Amplify build configuration
├── AWS_DEPLOYMENT.md             # Deployment instructions
├── ARCHITECTURE.md               # This file
└── DECISIONS.md                  # Design decisions
```

## Key Design Decisions

1. **Serverless over EC2** — No servers to manage, auto-scales, pay per request
2. **API Gateway + Lambda over AppRunner/ECS** — Simpler for a hackathon, true serverless
3. **RDS over DynamoDB** — Relational data with JOINs (groups ↔ members ↔ profiles)
4. **Bedrock over SageMaker** — Managed model access, no deployment needed
5. **Polling over WebSockets** — Simpler than API Gateway WebSocket API for a demo
6. **No auth** — Public-facing demo, faster to build and present
7. **CORS: */** — Open access for demo purposes
