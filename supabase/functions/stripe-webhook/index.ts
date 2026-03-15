import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUOTA_BY_TIER: Record<string, { videos: number; storage: number }> = {
  free: { videos: 3, storage: 1 * 1024 * 1024 * 1024 }, // 1GB
  starter: { videos: 10, storage: 5 * 1024 * 1024 * 1024 }, // 5GB
  pro: { videos: -1, storage: 50 * 1024 * 1024 * 1024 }, // 50GB (unlimited videos)
  enterprise: { videos: -1, storage: 500 * 1024 * 1024 * 1024 }, // 500GB
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    const signature = req.headers.get('stripe-signature')!;
    const body = await req.text();

    // Verify webhook signature (simplified - in production use stripe library)
    // For now, we'll process the event directly

    const event = JSON.parse(body);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook
    await supabase.from('webhook_logs').insert({
      source: 'stripe',
      event_type: event.type,
      payload: event,
      processed: false,
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.tier;
        const subscriptionId = session.subscription;

        if (userId && tier) {
          const quota = QUOTA_BY_TIER[tier];
          
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_id: subscriptionId,
              monthly_video_limit: quota.videos,
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find profile by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const status = subscription.status;
          let tier = profile.subscription_tier;

          if (status === 'active' || status === 'trialing') {
            // Keep current tier
          } else if (status === 'canceled' || status === 'unpaid') {
            tier = 'free';
          }

          const quota = QUOTA_BY_TIER[tier];

          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              monthly_video_limit: quota.videos,
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_id: null,
              monthly_video_limit: 3,
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Could send email notification here
        console.log(`Payment failed for customer ${customerId}`);
        break;
      }
    }

    // Mark as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('source', 'stripe')
      .eq('event_type', event.type);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
