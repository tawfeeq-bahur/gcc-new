# GCC-Pulse Backend Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

## Step 1: Supabase Project Setup

1. **Go to**: https://supabase.com
2. **Create a new project** with these settings:
   - Name: `gcc-pulse`
   - Database Password: (save this securely!)
   - Region: Choose closest to you

3. **Wait 2-3 minutes** for the project to initialize

## Step 2: Configure Environment Variables

Your `.env.local` file should have:

```env
# Google Gemini API (for resume analysis)
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**To get these values:**
1. Go to Supabase Dashboard → Settings → API
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Run Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the ENTIRE contents of `supabase/migrations/001_complete_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this is correct!

## Step 4: Enable Email Authentication

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL**: `http://localhost:3000`
5. Set **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`

## Step 5: Create Test Users (Optional)

In Supabase Dashboard → **Authentication** → **Users**, click "Add User":

### Demo Applicant:
- Email: `applicant@demo.com`
- Password: `demo123456`

### Demo Panelist:
- Email: `panelist@demo.com`
- Password: `demo123456`

### Demo Admin:
- Email: `admin@demo.com`
- Password: `demo123456`

**IMPORTANT**: After creating users, you need to update their roles in the database:

Go to **SQL Editor** and run:

```sql
-- Update panelist role
UPDATE profiles 
SET role = 'panelist' 
WHERE email = 'panelist@demo.com';

-- Update admin role
UPDATE profiles 
SET role = 'recruiting_admin' 
WHERE email = 'admin@demo.com';
```

## Step 6: Start the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## Routes Available:

| Route | Description |
|-------|-------------|
| `/` | Resume Analyzer (public) |
| `/auth/login` | Login page |
| `/auth/signup` | Signup with role selection |
| `/dashboard` | Applicant Dashboard (after login) |
| `/panelist` | Panelist Dashboard |
| `/admin` | Recruiting Admin Dashboard |

## Troubleshooting

### "Supabase URL/Key not configured"
- Check `.env.local` has correct values
- Restart dev server after changing env vars

### "User not found in profiles"
- The trigger `handle_new_user()` should auto-create profiles
- If not working, check if the SQL migration ran successfully

### Authentication not redirecting
- Check Site URL in Supabase is `http://localhost:3000`
- Clear browser cookies and try again

## Production Deployment

For production, update:
1. Site URL in Supabase to your production domain
2. Add production domain to Redirect URLs
3. Update `.env.local` (or platform env vars) with production values
