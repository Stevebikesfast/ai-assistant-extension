# AI Assistant Platform

A Next.js application with OpenAI integration, Supabase authentication, and Stripe payments.

## Features

- 🔐 Authentication with Supabase
- 🤖 OpenAI Assistant Integration
- 💳 Stripe Payment Processing
- 🔒 Protected Routes
- 💬 Real-time Chat Interface
- 📱 Responsive Design

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API
- Stripe

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.local.example` to `.env.local` and fill in your environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_URL`

## Project Structure

```
src/
├── app/                # Next.js 13 app directory
├── components/         # React components
├── hooks/             # Custom React hooks
└── lib/               # Utility functions and configurations
    ├── openai/        # OpenAI integration
    ├── stripe/        # Stripe integration
    ├── supabase/      # Supabase client
    └── types/         # TypeScript types
