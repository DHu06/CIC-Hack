# StudyHall UBC

AI-powered complementary study groups for UBC students. Upload notes, get matched with classmates who complement your strengths, and study smarter together.

## Architecture

- **Frontend**: Next.js 16 (Amplify Hosting)
- **Backend API**: AWS Lambda + API Gateway (in `backend/`)
- **Database**: Amazon RDS (PostgreSQL)
- **AI**: Amazon Bedrock (Claude Haiku 4.5)

## Quick Start

### Frontend
```bash
npm install
npm run dev
```
Requires `NEXT_PUBLIC_API_URL` in `.env.local`.

### Backend
```bash
cd backend
npm install
sam build && sam deploy --guided
```

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for full deployment instructions.

## Project Structure
```
├── src/                  # Next.js frontend (Amplify)
├── backend/              # Lambda functions (SAM)
│   ├── src/handlers/     # API endpoints
│   ├── src/lib/          # DB + Bedrock helpers
│   ├── sql/              # Database schema + seed
│   └── template.yaml     # SAM template
├── amplify.yml           # Amplify build config
└── AWS_DEPLOYMENT.md     # Full AWS setup guide
```
