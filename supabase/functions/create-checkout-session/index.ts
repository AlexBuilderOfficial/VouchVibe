import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createCheckoutSession as createStripeCheckoutSession } from 'https://esm.sh/@stripe/stripe-server@1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICES: Record<string, string> = {
  'price_starter_xxx': 'price_starter_xxx',
  'price_pro_xxx': 'price_pro_xxx',
  'price_enterprise_xxx': 'price_enterprise_xxx',
};

const TIER_BY_PRICE: Record<string, 'starter' | 'pro' | 'enterprise'> = {
  'price_starter_xxx': 'starter',
  'price_pro_xxx': 'pro',
  'price_enterprise_xxx': 'enterprise',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { price_id } = await req.json();

    if (!price_id || !PRICES[price_id]) {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const stripeRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email!,
          metadata: { supabase_user_id: user.id },
        }),
      });

      const customer = await stripeRes.json();
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const checkoutUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/dashboard`;
    const cancelUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/dashboard`;

    const sessionParams = new URLSearchParams({
      'customer': customerId,
      'mode': 'subscription',
      'success_url': `${checkoutUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      'cancel_url': `${cancelUrl}?canceled=true`,
      'line_items[0][price]': price_id,
      'line_items[0][quantity]': '1',
      'metadata[user_id]': user.id,
      'metadata[tier]': TIER_BY_PRICE[price_id],
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sessionParams,
    });

    const session = await stripeRes.json();

    if (session.error) {
      throw new Error(session.error.message);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
