import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PaymentAdapter {
  createCustomer(email: string, metadata: Record<string, string>): Promise<{ id: string }>;
  createPaymentIntent(amount: number, currency: string, customerId: string): Promise<{ id: string; client_secret: string }>;
  createTransfer(amount: number, destination: string): Promise<{ id: string }>;
  getBalance(customerId: string): Promise<{ available: number; pending: number }>;
}

// =====================================================
// STRIPE PAYMENT ADAPTER (Production)
// =====================================================

class StripePaymentAdapter implements PaymentAdapter {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
  }

  async createCustomer(email: string, metadata: Record<string, string>) {
    console.log(`[STRIPE] Creating customer for ${email}`);
    const customer = await this.stripe.customers.create({
      email,
      metadata,
    });
    return { id: customer.id };
  }

  async createPaymentIntent(amount: number, currency: string, customerId: string) {
    console.log(`[STRIPE] Creating payment intent: ${amount} ${currency} for ${customerId}`);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        service: 'atomic_influence_wallet_deposit',
      },
    });
    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret || '',
    };
  }

  async createTransfer(amount: number, destination: string) {
    console.log(`[STRIPE] Creating transfer: ${amount} to ${destination}`);

    // In production, you'd need to create a Stripe Connect account for each creator
    // For now, this creates a payout to a connected account
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount), // Amount in cents
        currency: 'usd',
        destination: destination, // Should be a Stripe Connect account ID
        description: 'Creator payout from Atomic Influence',
      });
      return { id: transfer.id };
    } catch (error) {
      console.error('[STRIPE] Transfer error:', error);
      // Fallback: Log the payout intent for manual processing
      console.warn(`[STRIPE] Manual payout needed: ${amount} cents to ${destination}`);
      return { id: `manual_${Date.now()}` };
    }
  }

  async getBalance(customerId: string) {
    console.log(`[STRIPE] Getting balance for ${customerId}`);
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      // Stripe customers don't have balances - we track this in our DB
      // This is a placeholder for future wallet balance verification
      return { available: 0, pending: 0 };
    } catch (error) {
      console.error('[STRIPE] Balance retrieval error:', error);
      return { available: 0, pending: 0 };
    }
  }
}

// =====================================================
// STUB PAYMENT ADAPTER (Development/Testing)
// =====================================================

class StubPaymentAdapter implements PaymentAdapter {
  async createCustomer(email: string, metadata: Record<string, string>) {
    console.log(`[STUB] Creating customer for ${email}`);
    return { id: `stub_cus_${Date.now()}` };
  }

  async createPaymentIntent(amount: number, currency: string, customerId: string) {
    console.log(`[STUB] Creating payment intent: ${amount} ${currency} for ${customerId}`);
    return {
      id: `stub_pi_${Date.now()}`,
      client_secret: `stub_secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  async createTransfer(amount: number, destination: string) {
    console.log(`[STUB] Creating transfer: ${amount} to ${destination}`);
    return { id: `stub_tr_${Date.now()}` };
  }

  async getBalance(customerId: string) {
    console.log(`[STUB] Getting balance for ${customerId}`);
    return { available: 0, pending: 0 };
  }
}

// =====================================================
// ADAPTER FACTORY
// =====================================================

function getPaymentAdapter(): PaymentAdapter {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (stripeKey && stripeKey.startsWith('sk_')) {
    console.log('[PAYMENTS] Using Stripe adapter (production mode)');
    return new StripePaymentAdapter(stripeKey);
  }

  console.log('[PAYMENTS] Using stub adapter (development mode) - Set STRIPE_SECRET_KEY for production');
  return new StubPaymentAdapter();
}

// =====================================================
// EDGE FUNCTION HANDLER
// =====================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    const adapter = getPaymentAdapter();

    console.log(`[PAYMENTS] Action: ${action}`);

    switch (action) {
      case 'create-wallet': {
        const { brandUserId, email } = params;

        const customer = await adapter.createCustomer(email, { brand_user_id: brandUserId });

        const { data: wallet, error } = await supabase
          .from('brand_wallets')
          .insert({
            brand_user_id: brandUserId,
            stripe_customer_id: customer.id,
          })
          .select()
          .single();

        if (error) {
          console.error('[PAYMENTS] Wallet creation error:', error);
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        return new Response(JSON.stringify({ success: true, wallet }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'deposit-funds': {
        const { walletId, amount, description } = params;

        const { data: wallet, error: walletError } = await supabase
          .from('brand_wallets')
          .select('*')
          .eq('id', walletId)
          .single();

        if (walletError || !wallet) {
          return new Response(JSON.stringify({ success: false, error: 'Wallet not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }

        const paymentIntent = await adapter.createPaymentIntent(
          amount * 100, // Convert to cents
          wallet.currency,
          wallet.stripe_customer_id || 'stub_customer'
        );

        const { data: transaction, error: txError } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: walletId,
            transaction_type: 'deposit',
            amount: amount,
            status: 'pending',
            stripe_payment_intent_id: paymentIntent.id,
            description: description || 'Wallet deposit',
          })
          .select()
          .single();

        if (txError) {
          console.error('[PAYMENTS] Transaction creation error:', txError);
          return new Response(JSON.stringify({ success: false, error: txError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        return new Response(JSON.stringify({
          success: true,
          transaction,
          clientSecret: paymentIntent.client_secret,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'confirm-deposit': {
        const { transactionId } = params;

        const { data: tx, error: txError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (txError || !tx) {
          return new Response(JSON.stringify({ success: false, error: 'Transaction not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }

        await supabase
          .from('wallet_transactions')
          .update({ status: 'completed' })
          .eq('id', transactionId);

        // Update wallet balance
        const { data: wallet } = await supabase
          .from('brand_wallets')
          .select('balance')
          .eq('id', tx.wallet_id)
          .single();

        await supabase
          .from('brand_wallets')
          .update({ balance: (wallet?.balance || 0) + tx.amount, updated_at: new Date().toISOString() })
          .eq('id', tx.wallet_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process-eligible-payouts': {
        const { data: eligibleEarnings, error: earningsError } = await supabase
          .from('creator_earnings')
          .select('*')
          .eq('status', 'eligible');

        if (earningsError) {
          return new Response(JSON.stringify({ success: false, error: earningsError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        if (!eligibleEarnings || eligibleEarnings.length === 0) {
          return new Response(JSON.stringify({ success: true, message: 'No eligible payouts' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const totalAmount = eligibleEarnings.reduce((sum: number, e: { net_amount: number }) => sum + e.net_amount, 0);
        const { data: batch, error: batchError } = await supabase
          .from('payout_batches')
          .insert({
            batch_date: new Date().toISOString().split('T')[0],
            total_amount: totalAmount,
            creator_count: eligibleEarnings.length,
            status: 'processing',
          })
          .select()
          .single();

        if (batchError) {
          return new Response(JSON.stringify({ success: false, error: batchError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        const earningIds = eligibleEarnings.map((e: { id: string }) => e.id);
        await supabase
          .from('creator_earnings')
          .update({ status: 'processing', payout_batch_id: batch.id })
          .in('id', earningIds);

        // Process each payout
        for (const earning of eligibleEarnings) {
          try {
            await adapter.createTransfer(
              earning.net_amount * 100, // Convert to cents
              `creator_${earning.creator_user_id}` // In production, use actual Stripe Connect account ID
            );
          } catch (error) {
            console.error(`[PAYMENTS] Failed to process payout for ${earning.creator_user_id}:`, error);
            // Continue processing other payouts
          }
        }

        await supabase
          .from('creator_earnings')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .in('id', earningIds);

        await supabase
          .from('payout_batches')
          .update({ status: 'completed', processed_at: new Date().toISOString() })
          .eq('id', batch.id);

        return new Response(JSON.stringify({
          success: true,
          batch,
          processedCount: eligibleEarnings.length,
          totalAmount,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-wallet-balance': {
        const { brandUserId } = params;

        const { data: wallet, error } = await supabase
          .from('brand_wallets')
          .select('*')
          .eq('brand_user_id', brandUserId)
          .single();

        if (error || !wallet) {
          return new Response(JSON.stringify({ success: false, error: 'Wallet not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }

        return new Response(JSON.stringify({ success: true, balance: wallet.balance, currency: wallet.currency }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }
  } catch (err) {
    const error = err as Error;
    console.error('[PAYMENTS] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
