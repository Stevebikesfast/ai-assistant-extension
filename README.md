# AI Assistant App

A Next.js application featuring AI assistance powered by OpenAI, with Supabase authentication and Stripe payments.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **AI Integration**: OpenAI
- **Payments**: Stripe
- **UI Components**: Radix UI

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in the environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/src
  /app - Pages and layouts using App Router
  /components - Reusable UI components
  /lib 
    /supabase - Supabase client configuration
    /openai - OpenAI integration and handlers
    /stripe - Stripe payment integration
    /types - TypeScript interfaces
  /hooks - Custom React hooks
  /utils - Helper functions
  /styles - Global styles and Tailwind config
```

## Features

- Supabase Authentication
- OpenAI Integration
- Stripe Payments
- Real-time Chat Interface
- Profile Management
- Subscription Handling
