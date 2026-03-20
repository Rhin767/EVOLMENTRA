# EvolMentra — ABA Clinical Platform

## Setup in 10 minutes

### 1. Run the database schema
- Go to supabase.com → your project → SQL Editor
- Paste the contents of `schema.sql` and click Run

### 2. Get your environment variables
From Supabase: Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` = your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon/public key

From Anthropic: console.anthropic.com → API Keys
- `ANTHROPIC_API_KEY` = your API key

### 3. Local development
```bash
cp .env.local.template .env.local
# Fill in your keys in .env.local
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import the repo
3. Add all 3 environment variables in Vercel settings
4. Deploy

## Demo credentials (after signup)
Sign up at /auth/signup — create your clinic account.
First user becomes admin.

## What works now
- Clinic signup and login (real Supabase auth)
- Add and view patients (real database)
- NOVA AI SOAP notes (real Claude API, server-side)
- NOVA AI goal writing
- Dashboard with live patient data

## Coming next
- Session scheduling with EVV
- Goal tracking with data
- Insurance billing (Availity)
- Parent portal
- Mobile app
