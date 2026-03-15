import { supabase } from '../lib/supabase';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripeService = {
  async createCheckoutSession(priceId: string): Promise<{ url: string }> {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { price_id: priceId },
    });

    if (error) throw error;
    return data;
  },

  async createPortalSession(): Promise<{ url: string }> {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {},
    });

    if (error) throw error;
    return data;
  },

  async getSubscriptionStatus(): Promise<{
    tier: string;
    subscriptionId: string | null;
    currentPeriodEnd: string | null;
  }> {
    const { data, error } = await supabase.functions.invoke('get-subscription-status', {
      body: {},
    });

    if (error) throw error;
    return data;
  },

  loadStripe(): Promise<unknown> {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    return import('@stripe/stripe-js').then(({ loadStripe }) => 
      loadStripe(STRIPE_PUBLISHABLE_KEY)
    );
  },
};
