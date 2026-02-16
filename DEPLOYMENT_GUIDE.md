# Atomic Influence Platform - Deployment Guide

---

## ✅ What's Already Built

- ✅ **Complete campaign management system** (9-step creation wizard)
- ✅ **Budget & escrow infrastructure** (atomic reservations, wallet system)
- ✅ **Invitation & negotiation system** (counter-offers, acceptance flow)
- ✅ **Content submission & review workflow** (deliverables, approvals)
- ✅ **Payment processing infrastructure** (Stripe-ready with adapter pattern)
- ✅ **Email notification system** (Resend-ready with HTML templates)
- ✅ **Tracking & analytics** (click tracking, QR codes, daily aggregation)
- ✅ **Social platform OAuth** (Instagram, TikTok, Twitter, LinkedIn, YouTube)
- ✅ **Admin panel** (user management, platform settings)
- ✅ **Real-time updates** (Supabase subscriptions)
- ✅ **Row-level security** (RLS policies on all tables)
- ✅ **Audit logging** (compliance-ready)

---

## 🚀 Deployment Checklist

### Step 1: Database Migrations (15 minutes)

1. **Apply all migrations to Supabase**

```bash
# Navigate to project directory
cd "f:\Digital Agency\Atomic Influence\Website"

# Apply migrations using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor:
# Run each migration file in order from supabase/migrations/
```

2. **Verify migrations applied**

```sql
-- In Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see all tables including:
-- campaigns, campaign_invitations, campaign_negotiations,
-- campaign_budget_reservations, campaign_participants,
-- creator_submissions, submission_reviews,
-- brand_wallets, wallet_transactions, creator_earnings,
-- tracking_events, tracking_aggregates, notifications
```

3. **Verify RPCs exist**

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Should see:
-- publish_campaign, accept_campaign_invitation,
-- decline_campaign_invitation, submit_negotiation_counter_offer,
-- respond_to_negotiation, submit_deliverable, review_submission,
-- aggregate_tracking_events, mark_earnings_eligible, etc.
```

---

### Step 2: Environment Variables (10 minutes)

**Configure in Supabase Dashboard → Settings → Edge Functions → Secrets:**

#### Required for Production

```bash
# Supabase
SUPABASE_URL=https://gqbnkbcwmwwfecjesany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
SITE_URL=https://yourdomain.com

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_live_...  # Use sk_test_... for testing

# Resend (Required for emails)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com
```

#### Optional (Social Platform Integration)

```bash
# Instagram
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret

# TikTok
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret

# Twitter/X
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret

# LinkedIn
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret

# YouTube
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
```

**Also configure in frontend `.env` file:**

```bash
VITE_SUPABASE_URL=https://gqbnkbcwmwwfecjesany.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

### Step 3: Deploy Edge Functions (20 minutes)

1. **Deploy all edge functions to Supabase**

```bash
# Deploy individual functions
supabase functions deploy payments
supabase functions deploy notifications
supabase functions deploy campaign-lifecycle
supabase functions deploy tracking-links
supabase functions deploy social-connect
supabase functions deploy matching-intelligence
supabase functions deploy user-management

# Or deploy all at once
supabase functions deploy --all
```

2. **Verify deployments**

Go to Supabase Dashboard → Edge Functions → Check all functions are listed and have recent deployment times.

3. **Test edge functions**

```bash
# Test payments function (should return stub or Stripe response)
curl -X POST https://gqbnkbcwmwwfecjesany.supabase.co/functions/v1/payments \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"get-wallet-balance","brandUserId":"test-uuid"}'

# Test notifications function
curl -X POST https://gqbnkbcwmwwfecjesany.supabase.co/functions/v1/notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"send","userId":"test-uuid","type":"test","title":"Test","message":"Test message"}'
```

---

### Step 4: Configure pg_cron (30 minutes)

**Important**: Enable pg_cron for automated jobs (campaign lifecycle, tracking aggregation, token refresh).

1. **Enable pg_cron extension in Supabase**

Go to Supabase Dashboard → Database → Extensions → Enable `pg_cron`

2. **Configure database settings**

```sql
-- Set service role key for cron jobs
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';

-- Set Supabase URL
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://gqbnkbcwmwwfecjesany.supabase.co';
```

3. **Apply the pg_cron migration**

Run the migration: `20260209000001_setup_pg_cron_automation.sql`

This will create:
- **Hourly**: Campaign lifecycle management
- **Every 4 hours**: OAuth token refresh
- **Every 6 hours**: Social platform data sync
- **Daily at 2 AM UTC**: Tracking event aggregation

4. **Verify cron jobs**

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

### Step 5: Frontend Deployment (15 minutes)

1. **Build frontend for production**

```bash
cd "f:\Digital Agency\Atomic Influence\Website"

# Install dependencies
npm install

# Build for production
npm run build
```

2. **Deploy to hosting provider**

Choose one:

**Option A: Vercel** (Recommended)
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: Supabase Static Hosting** (Coming soon)

3. **Configure custom domain**

In your hosting provider:
- Add custom domain (e.g., `app.atomicinfluence.com`)
- Configure DNS records
- Enable HTTPS/SSL
- Update `SITE_URL` environment variable to match

---

### Step 6: Stripe Configuration (30 minutes)

**Required for payment processing**

1. **Create Stripe account** at https://dashboard.stripe.com

2. **Get API keys**
   - Test mode: `sk_test_...` (for testing)
   - Live mode: `sk_live_...` (for production)

3. **Configure Stripe webhook** (for payment confirmations)

In Stripe Dashboard → Developers → Webhooks:
- Endpoint URL: `https://gqbnkbcwmwwfecjesany.supabase.co/functions/v1/payments/webhook`
- Events to send:
  * `payment_intent.succeeded`
  * `payment_intent.payment_failed`
  * `transfer.created`
  * `transfer.failed`

4. **Update Supabase secrets**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. **Test payment flow**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits

**Note**: For creator payouts, you'll need to set up **Stripe Connect** to create connected accounts for each creator. This is a more advanced setup - see Stripe documentation.

---

### Step 7: Resend Email Configuration (15 minutes)

**Required for email notifications**

1. **Create Resend account** at https://resend.com

2. **Get API key**
   - Dashboard → API Keys → Create API Key
   - Copy the key (starts with `re_...`)

3. **Verify domain**
   - Dashboard → Domains → Add Domain
   - Add DNS records (SPF, DKIM, DMARC)
   - Verify domain ownership

4. **Update Supabase secrets**
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com
```

5. **Test email sending**
```sql
-- Trigger a test notification
INSERT INTO notifications (user_id, type, title, message, category)
VALUES (
  'your-user-id',
  'test',
  'Test Notification',
  'This is a test email from Atomic Influence',
  'general'
);
```

Check your email inbox for delivery.

---

### Step 8: Social Platform API Setup (Optional)

**Only needed if you want creators to connect social accounts**

#### Instagram (Meta)

1. Create app at https://developers.facebook.com
2. Add Instagram Basic Display product
3. Configure OAuth redirect URI: `https://yourdomain.com/oauth/callback`
4. Get App ID and App Secret
5. Submit for app review (required for production)

#### TikTok

1. Create app at https://developers.tiktok.com
2. Enable Login Kit
3. Configure redirect URI
4. Get Client Key and Secret

#### Twitter/X

1. Create app at https://developer.twitter.com
2. Enable OAuth 2.0
3. Configure callback URL
4. Get API Key and Secret

#### LinkedIn

1. Create app at https://www.linkedin.com/developers
2. Add Sign In with LinkedIn product
3. Configure redirect URL
4. Get Client ID and Secret

#### YouTube

1. Create project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Configure authorized redirect URIs

---

### Step 9: Security Hardening (20 minutes)

1. **Review RLS policies**

```sql
-- Test RLS is enabled on all tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Should return empty (all tables should have RLS enabled)
```

2. **Configure rate limiting**

In Supabase Dashboard → Settings → API:
- Enable rate limiting (recommended: 100 requests/minute per IP)

3. **Set up CORS**

Already configured in edge functions with:
```typescript
'Access-Control-Allow-Origin': '*'
```

For production, update to:
```typescript
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

4. **Enable audit logging**

Already implemented - all critical actions log to `audit_logs` table.

5. **Configure backups**

In Supabase Dashboard → Settings → Database:
- Enable daily backups
- Set retention period (recommend 30 days)
- Enable Point-in-Time Recovery (PITR)

---

### Step 10: Monitoring & Error Tracking (15 minutes)

1. **Set up Sentry** (recommended)

```bash
npm install --save @sentry/react @sentry/tracing

# Add to src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

2. **Configure Supabase logging**

In Supabase Dashboard → Logs:
- Enable Edge Function logs
- Enable Database logs
- Set retention period

3. **Set up uptime monitoring**

Use services like:
- UptimeRobot (free)
- Pingdom
- Better Stack

Monitor:
- Main app URL
- Edge function endpoints
- Database health

---

### Step 11: Create Admin User (5 minutes)

1. **Sign up for an account** on your deployed app

2. **Promote to admin** via SQL

```sql
-- Get your user ID
SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Add admin role
INSERT INTO user_roles (user_id, role) VALUES ('your-user-id', 'admin');
```

3. **Verify admin access**
   - Log in
   - Navigate to `/admin` routes
   - Should see admin dashboard

---

### Step 12: Final Testing (30 minutes)

Follow the **Test Plan** at `docs/testing/campaign-workflow-test-plan.md`

Key tests:
- [ ] Create campaign as brand
- [ ] Publish campaign (verify RPC works)
- [ ] Invite creator
- [ ] Accept invitation (verify budget reservation)
- [ ] Submit content
- [ ] Review submission
- [ ] Check notifications sent
- [ ] Verify emails received
- [ ] Test tracking links
- [ ] Process payout (if Stripe configured)

---

## 📊 Post-Deployment Checklist

- [ ] All migrations applied successfully
- [ ] All edge functions deployed
- [ ] Environment variables configured
- [ ] pg_cron jobs running
- [ ] Frontend deployed to custom domain
- [ ] HTTPS/SSL enabled
- [ ] Stripe configured (test mode working)
- [ ] Resend configured (emails sending)
- [ ] Admin user created
- [ ] RLS policies tested
- [ ] Rate limiting enabled
- [ ] Backups configured
- [ ] Monitoring/error tracking set up
- [ ] End-to-end test suite passed
- [ ] Social OAuth configured (optional)
- [ ] Documentation reviewed

---

## 🔧 Troubleshooting

### Issue: Migrations fail to apply

**Solution:**
```sql
-- Check for migration conflicts
SELECT * FROM supabase_migrations.schema_migrations;

-- Rollback last migration if needed
DELETE FROM supabase_migrations.schema_migrations WHERE version = 'XXXXXXX';
```

### Issue: Edge function returns 500 error

**Solution:**
- Check edge function logs in Supabase Dashboard
- Verify environment variables are set
- Test with curl to see exact error message

### Issue: RPC not found

**Solution:**
```sql
-- List all functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public';

-- If missing, re-run the migration file that creates it
```

### Issue: Emails not sending

**Solution:**
- Verify RESEND_API_KEY is set correctly
- Check Resend dashboard for delivery logs
- Verify domain is verified in Resend
- Check edge function logs for errors

### Issue: Cron jobs not running

**Solution:**
```sql
-- Check job status
SELECT * FROM cron.job;

-- Check recent runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Manually trigger a job
SELECT cron.schedule('test-job', '* * * * *', 'SELECT 1');
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs
- **Platform Issues**: Open an issue at your repo

---

## 🎉 You're Ready to Launch!

Your Atomic Influence platform is now deployed and ready for real users. Key features:

✅ **Fully automated campaign management**
✅ **Secure payment processing**
✅ **Real-time notifications**
✅ **Comprehensive analytics**
✅ **Social platform integrations**
✅ **Admin controls**

**Next steps:**
1. Invite beta testers (5-10 brands + 20-30 creators)
2. Collect feedback
3. Iterate on features
4. Scale infrastructure as needed
5. Launch marketing campaign

---

