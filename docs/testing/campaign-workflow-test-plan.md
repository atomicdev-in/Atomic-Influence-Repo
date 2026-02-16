# Atomic Influence Platform - End-to-End Test Plan

## Overview
This document provides a comprehensive manual testing plan for the complete campaign workflow on the Atomic Influence platform. Follow these scenarios sequentially to verify all core features.

---

## Pre-Test Setup

### Required Test Accounts
1. **Brand Account**: `brand-test@atomicinfluence.app`
2. **Creator Account 1**: `creator1-test@atomicinfluence.app`
3. **Creator Account 2**: `creator2-test@atomicinfluence.app`
4. **Admin Account**: `admin-test@atomicinfluence.app`

### Environment Variables to Configure
Before starting tests, ensure these are set in Supabase:

```bash
# Required API Keys
STRIPE_SECRET_KEY=sk_test_...           # Stripe test mode key
RESEND_API_KEY=re_...                   # Resend API key
RESEND_FROM_EMAIL=notifications@atomicinfluence.app

# Social Platform API Keys (Optional for basic testing)
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...

# Application Settings
SITE_URL=https://yourapp.com           # Your deployed URL
SUPABASE_URL=https://gqbnkbcwmwwfecjesany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...          # Service role key
```

### Database Checks
```sql
-- Verify all critical tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'campaigns', 'campaign_invitations', 'campaign_negotiations',
    'campaign_budget_reservations', 'campaign_participants',
    'creator_submissions', 'submission_reviews',
    'brand_wallets', 'wallet_transactions', 'creator_earnings',
    'tracking_events', 'tracking_aggregates', 'notifications'
);

-- Verify all RPCs exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'publish_campaign', 'accept_campaign_invitation',
    'decline_campaign_invitation', 'submit_negotiation_counter_offer',
    'respond_to_negotiation', 'submit_deliverable', 'review_submission'
);
```

---

## Test Scenario 1: Brand Creates Campaign

### Prerequisites
- Logged in as Brand Account
- Brand profile is complete

### Test Steps

#### 1.1 Create Draft Campaign
1. Navigate to **Brand Dashboard** → **Campaigns** → **Create New Campaign**
2. Fill out **Step 1: Basics**
   - Campaign Name: "Summer Wellness Campaign 2026"
   - Description: "Promote our new organic wellness product line"
   - Category: "Health & Wellness"
   - Objective: "Brand Awareness"
3. Click **Next**

**Expected Result:**
- ✅ Form validates successfully
- ✅ Progress bar shows Step 2

#### 1.2 Set Budget
4. Fill out **Step 2: Budget**
   - Total Budget: $5,000
   - Number of Influencers: 5
   - Calculated Payout Per Influencer: $1,000 (auto-calculated)
5. Click **Next**

**Expected Result:**
- ✅ Budget calculations are correct
- ✅ Progresses to Step 3

#### 1.3 Set Timeline
6. Fill out **Step 3: Timeline**
   - Start Date: 7 days from today
   - End Date: 30 days from today
7. Click **Next**

**Expected Result:**
- ✅ Date picker works correctly
- ✅ Validates end date is after start date

#### 1.4 Add Deliverables
8. Fill out **Step 4: Deliverables**
   - Deliverable 1:
     * Type: "Instagram Post"
     * Quantity: 2
     * Description: "High-quality lifestyle photo with product"
   - Deliverable 2:
     * Type: "Instagram Story"
     * Quantity: 5
     * Description: "Behind-the-scenes content"
9. Click **Add Deliverable** to add more
10. Click **Next**

**Expected Result:**
- ✅ Deliverables saved in JSON format
- ✅ Can add/remove deliverables dynamically

#### 1.5 Add Brand Guidelines
11. Fill out **Step 5: Guidelines**
    - Content Guidelines: "Must feature product prominently, use natural lighting, include #OrganicWellness hashtag"
12. Click **Next**

**Expected Result:**
- ✅ Guidelines saved

#### 1.6 Upload Brand Assets
13. Fill out **Step 6: Assets**
    - Upload logo (PNG/JPG)
    - Upload brand guidelines PDF
    - Upload product photos (3 images)
14. Click **Next**

**Expected Result:**
- ✅ Files upload to Supabase storage (avatars bucket)
- ✅ File metadata saved to campaign_assets table
- ✅ File size and type validation works

#### 1.7 Add CTA Links
15. Fill out **Step 7: CTA Links**
    - Link 1:
      * Label: "Product Page"
      * URL: "https://example.com/products/wellness"
      * Is Primary: Yes
    - Link 2:
      * Label: "Discount Code"
      * URL: "https://example.com/discount/SUMMER20"
16. Click **Next**

**Expected Result:**
- ✅ CTA links saved to campaign_cta_links table
- ✅ URL validation works

#### 1.8 Save Draft
17. On **Step 8: Discovery**, click **Save Draft**

**Expected Result:**
- ✅ Toast notification: "Draft preserved"
- ✅ Campaign created in database with status = 'draft'
- ✅ Redirects to campaigns list

**Database Verification:**
```sql
SELECT id, name, status, total_budget, influencer_count,
       allocated_budget, remaining_budget
FROM campaigns
WHERE name = 'Summer Wellness Campaign 2026';

-- Check CTA links
SELECT * FROM campaign_cta_links WHERE campaign_id = '<campaign-id>';

-- Check assets
SELECT * FROM campaign_assets WHERE campaign_id = '<campaign-id>';
```

#### 1.9 Publish Campaign
18. Go back to draft campaign
19. Click **Edit**
20. Navigate to **Step 9: Review**
21. Click **Publish Campaign**

**Expected Result:**
- ✅ Frontend calls `publish_campaign` RPC
- ✅ RPC validates all required fields
- ✅ Campaign snapshot created in campaign_snapshots table
- ✅ Campaign status changes from 'draft' → 'discovery'
- ✅ Toast notification: "Campaign published"
- ✅ Redirects to campaigns list

**Database Verification:**
```sql
SELECT * FROM campaigns WHERE name = 'Summer Wellness Campaign 2026';
-- Verify status = 'discovery'

SELECT * FROM campaign_snapshots WHERE campaign_id = '<campaign-id>';
-- Verify snapshot_type = 'published'

SELECT * FROM audit_logs WHERE action = 'campaign_published';
-- Verify audit log created
```

---

## Test Scenario 2: Creator Receives Invitation

### Prerequisites
- Brand has published campaign
- Logged in as Creator Account 1
- Creator profile is complete

### Test Steps

#### 2.1 Brand Sends Invitation
1. As **Brand Account**, navigate to campaign detail page
2. Go to **Discovery** tab
3. Search for creators or browse matching creators
4. Click **Invite** on Creator 1's profile
5. Confirm invitation with offered payout: $1,000

**Expected Result:**
- ✅ Invitation created in campaign_invitations table
- ✅ Invitation status = 'pending'
- ✅ base_payout and offered_payout = $1,000

**Database Verification:**
```sql
SELECT * FROM campaign_invitations
WHERE campaign_id = '<campaign-id>'
AND creator_user_id = '<creator1-user-id>';
```

#### 2.2 Creator Views Invitation
6. Log in as **Creator Account 1**
7. Navigate to **Invitations** page

**Expected Result:**
- ✅ Invitation appears in list
- ✅ Shows campaign name, brand name, payout amount
- ✅ Shows "pending" status
- ✅ Notification created in notifications table
- ✅ Email sent to creator (check inbox if Resend configured)

**Database Verification:**
```sql
SELECT * FROM notifications
WHERE user_id = '<creator1-user-id>'
AND type = 'invitation_received';
```

---

## Test Scenario 3: Negotiation Flow

### Prerequisites
- Creator has received invitation

### Test Steps

#### 3.1 Creator Submits Counter-Offer
1. As **Creator Account 1**, on invitation detail page
2. Click **Negotiate**
3. Proposed Payout: $1,200
4. Message: "I can deliver additional TikTok content for this rate"
5. Click **Submit Counter-Offer**

**Expected Result:**
- ✅ Frontend calls `submit_negotiation_counter_offer` RPC
- ✅ Invitation status changes to 'negotiating'
- ✅ Negotiation record created with proposed_by = 'creator'
- ✅ Toast notification: "Counter-offer submitted"

**Database Verification:**
```sql
SELECT * FROM campaign_negotiations WHERE invitation_id = '<invitation-id>';
-- Verify proposed_payout = 1200, proposed_by = creator user ID, status = 'pending'

SELECT status FROM campaign_invitations WHERE id = '<invitation-id>';
-- Verify status = 'negotiating'
```

#### 3.2 Brand Receives Negotiation
6. Log in as **Brand Account**
7. Navigate to campaign → **Applications** tab

**Expected Result:**
- ✅ See Creator 1's counter-offer
- ✅ Shows proposed payout: $1,200
- ✅ Shows message

#### 3.3 Brand Accepts Negotiation
8. Click **Accept** on the counter-offer

**Expected Result:**
- ✅ Frontend calls `respond_to_negotiation` RPC with response = 'accepted'
- ✅ Negotiation status changes to 'accepted'
- ✅ Invitation offered_payout updated to $1,200
- ✅ Invitation negotiated_delta = $200
- ✅ Campaign allocated_budget increased by $200
- ✅ Campaign remaining_budget decreased by $200
- ✅ Toast notification: "Negotiation resolved"

**Database Verification:**
```sql
SELECT offered_payout, negotiated_delta FROM campaign_invitations
WHERE id = '<invitation-id>';
-- Verify offered_payout = 1200, negotiated_delta = 200

SELECT allocated_budget, remaining_budget FROM campaigns
WHERE id = '<campaign-id>';
-- Verify budget adjusted

SELECT status FROM campaign_negotiations WHERE invitation_id = '<invitation-id>';
-- Verify status = 'accepted'
```

#### 3.4 Alternative: Brand Rejects Negotiation
(Test this with Creator 2)
1. Creator 2 submits counter-offer
2. Brand clicks **Reject**

**Expected Result:**
- ✅ Negotiation status = 'rejected'
- ✅ Invitation status returns to 'pending'
- ✅ No budget changes

---

## Test Scenario 4: Invitation Acceptance

### Prerequisites
- Negotiation completed (or invitation still pending)

### Test Steps

#### 4.1 Creator Accepts Invitation
1. As **Creator Account 1**, on invitation detail page
2. Click **Accept Invitation**
3. Confirm acceptance

**Expected Result:**
- ✅ Frontend calls `accept_campaign_invitation` RPC
- ✅ Budget reservation created in campaign_budget_reservations
  * reserved_amount = $1,200 (negotiated amount)
  * reservation_status = 'held'
- ✅ Invitation status = 'accepted'
- ✅ Campaign participant record created
- ✅ Campaign allocated_budget updated (if not already from negotiation)
- ✅ Tracking links generated via tracking-links edge function
- ✅ Toast notification with budget reserved amount
- ✅ Brand receives notification

**Database Verification:**
```sql
SELECT * FROM campaign_budget_reservations
WHERE invitation_id = '<invitation-id>';
-- Verify reserved_amount = 1200, reservation_status = 'held'

SELECT * FROM campaign_participants
WHERE campaign_id = '<campaign-id>' AND creator_user_id = '<creator1-user-id>';
-- Verify status = 'active'

SELECT * FROM creator_tracking_links
WHERE campaign_id = '<campaign-id>' AND creator_user_id = '<creator1-user-id>';
-- Verify tracking links created with unique codes

SELECT * FROM campaigns WHERE id = '<campaign-id>';
-- Verify allocated_budget = 1200, remaining_budget = 3800 (if 1 creator accepted)

SELECT * FROM notifications WHERE user_id = '<brand-user-id>' AND type = 'invitation_accepted';
-- Verify brand notified
```

#### 4.2 Verify Tracking Links
4. As **Creator**, view campaign detail page
5. Find **My Tracking Links** section

**Expected Result:**
- ✅ Unique tracking code displayed
- ✅ QR code image displayed
- ✅ Tracking URLs for each CTA link

---

## Test Scenario 5: Content Submission

### Prerequisites
- Creator has accepted invitation
- Campaign status = 'active' (timeline_start has passed, or manually updated for testing)

### Test Steps

#### 5.1 Creator Submits Deliverable
1. As **Creator Account 1**, navigate to campaign detail page
2. Find **Deliverables** section
3. For "Instagram Post" deliverable:
   - Submission URL: "https://instagram.com/p/ABC123"
   - Click **Submit**

**Expected Result:**
- ✅ Frontend calls `submit_deliverable` RPC
- ✅ Submission created in creator_submissions table
  * status = 'pending_review'
  * submission_type = 'manual'
- ✅ Toast notification: "Content submitted"
- ✅ Brand receives notification
- ✅ Audit log created

**Database Verification:**
```sql
SELECT * FROM creator_submissions
WHERE campaign_id = '<campaign-id>'
AND creator_user_id = '<creator1-user-id>';
-- Verify status = 'pending_review'

SELECT * FROM notifications WHERE user_id = '<brand-user-id>' AND type = 'submission_received';
-- Verify brand notified

SELECT * FROM audit_logs WHERE action = 'deliverable_submitted';
```

#### 5.2 Brand Views Submission
2. As **Brand Account**, navigate to campaign → **Submissions** tab

**Expected Result:**
- ✅ See Creator 1's submission
- ✅ Can preview submission URL
- ✅ Can see submission timestamp

---

## Test Scenario 6: Submission Review & Approval

### Prerequisites
- Creator has submitted content

### Test Steps

#### 6.1 Brand Approves Submission
1. As **Brand Account**, on submission detail page
2. Click **Approve**
3. Optional feedback: "Great work! Love the lighting."
4. Confirm approval

**Expected Result:**
- ✅ Frontend calls `review_submission` RPC
- ✅ Submission status = 'approved'
- ✅ Review record created in submission_reviews table
  * action = 'approved'
  * feedback stored
- ✅ Toast notification: "Review submitted"
- ✅ Creator receives notification
- ✅ If all deliverables approved:
  * Campaign participant status = 'completed'
  * Creator earnings marked as 'eligible'

**Database Verification:**
```sql
SELECT status FROM creator_submissions WHERE id = '<submission-id>';
-- Verify status = 'approved'

SELECT * FROM submission_reviews WHERE submission_id = '<submission-id>';
-- Verify action = 'approved', feedback stored

SELECT * FROM notifications WHERE user_id = '<creator1-user-id>' AND type = 'submission_reviewed';
-- Verify creator notified

SELECT * FROM campaign_participants
WHERE campaign_id = '<campaign-id>' AND creator_user_id = '<creator1-user-id>';
-- If all deliverables approved, verify status = 'completed'

SELECT * FROM creator_earnings WHERE invitation_id = '<invitation-id>';
-- If completed, verify status = 'eligible', gross_amount = 1200, net_amount = 1080 (after 10% fee)
```

#### 6.2 Alternative: Request Revision
(Test with second deliverable)
1. Brand clicks **Request Revision**
2. Feedback: "Please use different background"
3. Confirm

**Expected Result:**
- ✅ Submission status = 'revision_requested'
- ✅ Creator notified
- ✅ Creator can resubmit

#### 6.3 Alternative: Reject Submission
1. Brand clicks **Reject**
2. Feedback: "Does not meet brand guidelines"
3. Confirm

**Expected Result:**
- ✅ Submission status = 'rejected'
- ✅ Creator notified
- ✅ Creator cannot resubmit this deliverable

---

## Test Scenario 7: Payment Flow

### Prerequisites
- All creator deliverables approved
- Creator earnings marked as 'eligible'

### Test Steps

#### 7.1 Brand Wallet Setup
1. As **Brand Account**, navigate to **Wallet** page
2. If no wallet exists, click **Create Wallet**

**Expected Result:**
- ✅ Calls payments edge function with action = 'create-wallet'
- ✅ Stripe customer created (if Stripe configured) or stub customer
- ✅ brand_wallets record created

**Database Verification:**
```sql
SELECT * FROM brand_wallets WHERE brand_user_id = '<brand-user-id>';
-- Verify stripe_customer_id populated, balance = 0
```

#### 7.2 Deposit Funds
3. Click **Add Funds**
4. Amount: $2,000
5. Complete Stripe payment (test mode)

**Expected Result:**
- ✅ Calls payments edge function with action = 'deposit-funds'
- ✅ Stripe payment intent created
- ✅ wallet_transactions record created (status = 'pending')
- ✅ After payment confirmation:
  * Transaction status = 'completed'
  * Wallet balance updated

**Database Verification:**
```sql
SELECT * FROM wallet_transactions WHERE wallet_id = '<wallet-id>';
-- Verify transaction_type = 'deposit', amount = 2000, status = 'completed'

SELECT balance FROM brand_wallets WHERE id = '<wallet-id>';
-- Verify balance = 2000
```

#### 7.3 Process Creator Payouts
6. As **Admin** or via scheduled job, trigger payout processing
7. Call payments edge function with action = 'process-eligible-payouts'

**Expected Result:**
- ✅ Payout batch created in payout_batches table
- ✅ Creator earnings status changes: eligible → processing → paid
- ✅ Stripe transfers created for each creator (or manual payout logged)
- ✅ Creator notified

**Database Verification:**
```sql
SELECT * FROM payout_batches ORDER BY created_at DESC LIMIT 1;
-- Verify batch created, total_amount = 1080 (net amount), creator_count = 1, status = 'completed'

SELECT status, paid_at FROM creator_earnings WHERE invitation_id = '<invitation-id>';
-- Verify status = 'paid', paid_at is set

SELECT * FROM notifications WHERE user_id = '<creator1-user-id>' AND type = 'payment_released';
-- Verify creator notified
```

---

## Test Scenario 8: Campaign Lifecycle Automation

### Prerequisites
- Campaign published with defined timeline

### Test Steps

#### 8.1 Auto-Transition to Active
1. Set campaign timeline_start to current time
2. Wait for hourly cron job (or manually call campaign-lifecycle edge function)

**Expected Result:**
- ✅ Campaign status changes from 'discovery' → 'active'
- ✅ Participants can submit content

**Database Verification:**
```sql
SELECT status FROM campaigns WHERE id = '<campaign-id>';
-- Verify status = 'active'
```

#### 8.2 Deadline Reminder
1. Set campaign timeline_end to 48 hours from now
2. Wait for hourly cron job

**Expected Result:**
- ✅ Deadline reminder notifications sent to all active participants
- ✅ Notification type = 'deadline_reminder'

**Database Verification:**
```sql
SELECT * FROM notifications WHERE metadata->>'campaign_id' = '<campaign-id>' AND type = 'deadline_reminder';
```

#### 8.3 Auto-Transition to Reviewing
1. Set campaign timeline_end to current time
2. Wait for hourly cron job

**Expected Result:**
- ✅ Campaign status changes from 'active' → 'reviewing'

#### 8.4 Auto-Complete Campaign
1. Set campaign to 'reviewing' status
2. Set updated_at to 15 days ago (to simulate 14+ days in reviewing)
3. Wait for hourly cron job

**Expected Result:**
- ✅ Campaign status changes from 'reviewing' → 'completed'
- ✅ Campaign snapshot created (snapshot_type = 'completed')

**Database Verification:**
```sql
SELECT status FROM campaigns WHERE id = '<campaign-id>';
-- Verify status = 'completed'

SELECT * FROM campaign_snapshots WHERE campaign_id = '<campaign-id>' AND snapshot_type = 'completed';
```

---

## Test Scenario 9: Tracking & Analytics

### Prerequisites
- Creator has tracking links
- Campaign is active

### Test Steps

#### 9.1 Click Tracking Link
1. Copy creator's tracking URL
2. Open in incognito browser
3. Click the link

**Expected Result:**
- ✅ Redirect to CTA destination
- ✅ Click event recorded in tracking_events table
  * event_type = 'click'
  * visitor_ip_hash populated
  * tracking_link_id references creator_tracking_links

**Database Verification:**
```sql
SELECT * FROM tracking_events
WHERE tracking_link_id IN (
    SELECT id FROM creator_tracking_links WHERE creator_user_id = '<creator1-user-id>'
)
ORDER BY created_at DESC LIMIT 10;
```

#### 9.2 Event Aggregation
1. Wait for nightly aggregation cron job (2 AM UTC)
2. Or manually run: `SELECT * FROM aggregate_tracking_events(CURRENT_DATE);`

**Expected Result:**
- ✅ Daily aggregate created in tracking_aggregates table
  * total_clicks = count of clicks
  * unique_clicks = count of distinct IPs
  * total_views, total_conversions as applicable

**Database Verification:**
```sql
SELECT * FROM tracking_aggregates
WHERE campaign_id = '<campaign-id>'
AND creator_user_id = '<creator1-user-id>';
-- Verify total_clicks > 0
```

#### 9.3 View Campaign Analytics
1. As **Brand Account**, navigate to campaign detail page
2. Go to **Analytics** tab

**Expected Result:**
- ✅ Shows total clicks, views, conversions
- ✅ Shows per-creator breakdown
- ✅ Shows click-through rate, conversion rate
- ✅ Charts render correctly

---

## Test Scenario 10: Admin Functions

### Prerequisites
- Logged in as Admin Account

### Test Steps

#### 10.1 Update Platform Settings
1. Navigate to **Admin** → **Settings**
2. Update "Platform Fee Percentage" to 12
3. Click **Save**

**Expected Result:**
- ✅ Frontend calls `update_platform_setting` RPC
- ✅ admin_settings table updated
- ✅ Audit log created
- ✅ Toast notification: "Setting updated"

**Database Verification:**
```sql
SELECT * FROM admin_settings WHERE key = 'platform_fee_percentage';
-- Verify value = 12

SELECT * FROM audit_logs WHERE action = 'setting_updated';
```

#### 10.2 User Management
1. Navigate to **Admin** → **Users**
2. Search for a user
3. Click **Disable User**
4. Confirm

**Expected Result:**
- ✅ Calls user-management edge function with action = 'disable'
- ✅ User status logged in user_status_log
- ✅ Audit log created
- ✅ User cannot log in

**Database Verification:**
```sql
SELECT * FROM user_status_log WHERE user_id = '<disabled-user-id>' ORDER BY created_at DESC LIMIT 1;
-- Verify status = 'disabled'

SELECT * FROM audit_logs WHERE action = 'user_disabled';
```

---

## Performance & Load Testing

### Test Metrics to Monitor

1. **Page Load Times**
   - Campaign creation wizard: < 2 seconds per step
   - Dashboard load: < 3 seconds
   - Campaign list: < 2 seconds

2. **RPC Performance**
   - publish_campaign: < 500ms
   - accept_campaign_invitation: < 500ms
   - submit_deliverable: < 300ms

3. **Edge Function Response Times**
   - payments: < 1 second (excluding Stripe API calls)
   - notifications: < 500ms
   - tracking-links: < 300ms

4. **Database Query Performance**
   ```sql
   -- Check slow queries
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 20;
   ```

---

## Security Testing

### Authentication Tests
- ✅ Cannot access brand dashboard as creator
- ✅ Cannot access creator invitations as brand
- ✅ Cannot access admin pages as non-admin
- ✅ Cannot edit other brand's campaigns
- ✅ RLS policies prevent cross-tenant data access

### Authorization Tests
- ✅ Creator cannot accept invitation for another creator
- ✅ Brand cannot review submissions for campaigns they don't own
- ✅ Cannot call RPCs without authentication
- ✅ Service role key required for admin operations

### Input Validation Tests
- ✅ Campaign budget must be > 0
- ✅ Timeline end date must be after start date
- ✅ Cannot submit deliverable for campaign you're not part of
- ✅ SQL injection attempts are blocked
- ✅ XSS attempts are sanitized

---

## Error Handling Tests

### Expected Error Scenarios
1. **Insufficient Budget**
   - Try to accept invitation when campaign remaining_budget < offered_payout
   - **Expected**: RPC returns error, invitation not accepted

2. **Duplicate Submission**
   - Submit same deliverable twice
   - **Expected**: Upsert logic updates existing submission

3. **Invalid RPC Parameters**
   - Call publish_campaign with null campaign_id
   - **Expected**: Error returned, no database changes

4. **Network Failures**
   - Disconnect internet during campaign creation
   - **Expected**: Form data preserved, retry mechanism works

---

## Regression Tests

After any code changes, re-run these critical paths:

1. ✅ Campaign creation → publish → discovery
2. ✅ Invitation → negotiation → acceptance → budget reservation
3. ✅ Content submission → review → approval → payment eligibility
4. ✅ Tracking link generation → click recording → aggregation
5. ✅ Notification creation → email dispatch

---

## Test Completion Checklist

- [ ] All 10 test scenarios completed without critical errors
- [ ] Database integrity verified (foreign keys, constraints)
- [ ] RLS policies tested for all user roles
- [ ] Email notifications received (if Resend configured)
- [ ] Stripe payments processed (if Stripe configured)
- [ ] Audit logs created for all critical actions
- [ ] Performance metrics meet targets
- [ ] No console errors or warnings
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested (Chrome, Firefox, Safari)

---

## Bug Reporting Template

If you encounter issues during testing, document them:

```markdown
## Bug Report

**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Database State**:
[Relevant SQL queries showing unexpected state]

**Screenshots**:
[Attach if applicable]

**Console Errors**:
[Paste console logs]

**Environment**:
- Browser: [Chrome 119, etc.]
- User Role: [Brand/Creator/Admin]
- Campaign ID: [UUID]
```

---

## Next Steps After Testing

1. **Fix Critical Bugs**: Address any P0/P1 issues found
2. **Deploy to Staging**: Run full test suite again
3. **User Acceptance Testing**: Have real brands/creators test
4. **Performance Optimization**: Optimize any slow queries
5. **Production Deployment**: Deploy with monitoring enabled
6. **Post-Launch Monitoring**:
   - Set up Sentry for error tracking
   - Monitor Supabase metrics
   - Track user feedback

---

## Appendix: SQL Queries for Test Verification

### Quick Health Check
```sql
-- Count records in key tables
SELECT
    'campaigns' as table_name, COUNT(*) as count FROM campaigns
UNION ALL SELECT 'campaign_invitations', COUNT(*) FROM campaign_invitations
UNION ALL SELECT 'campaign_participants', COUNT(*) FROM campaign_participants
UNION ALL SELECT 'creator_submissions', COUNT(*) FROM creator_submissions
UNION ALL SELECT 'creator_earnings', COUNT(*) FROM creator_earnings
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'tracking_events', COUNT(*) FROM tracking_events;
```

### Active Campaign Summary
```sql
SELECT
    c.name,
    c.status,
    c.total_budget,
    c.allocated_budget,
    c.remaining_budget,
    COUNT(DISTINCT cp.creator_user_id) as active_creators,
    COUNT(DISTINCT cs.id) as total_submissions
FROM campaigns c
LEFT JOIN campaign_participants cp ON c.id = cp.campaign_id AND cp.status = 'active'
LEFT JOIN creator_submissions cs ON c.id = cs.campaign_id
WHERE c.status IN ('discovery', 'active', 'reviewing')
GROUP BY c.id, c.name, c.status, c.total_budget, c.allocated_budget, c.remaining_budget;
```

### Creator Earnings Summary
```sql
SELECT
    ce.status,
    COUNT(*) as count,
    SUM(ce.gross_amount) as total_gross,
    SUM(ce.platform_fee) as total_fees,
    SUM(ce.net_amount) as total_net
FROM creator_earnings ce
GROUP BY ce.status;
```

---

**END OF TEST PLAN**

*Last Updated: February 9, 2026*
*Platform Version: 1.0.0*
*Test Coverage: End-to-End Campaign Workflow*
