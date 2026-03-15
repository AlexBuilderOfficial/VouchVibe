export interface PricingPlan {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  price: number;
  priceId?: string; // Stripe price ID
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    features: [
      '3 videos/month',
      'Basic templates',
      'Email support',
      '720p video quality',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 'starter',
    price: 9,
    priceId: 'price_starter_xxx',
    features: [
      '10 videos/month',
      'Custom branding',
      'Priority support',
      '1080p video quality',
      'Basic analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 29,
    priceId: 'price_pro_xxx',
    features: [
      'Unlimited videos',
      'Custom branding',
      'Priority support',
      '4K video quality',
      'Advanced analytics',
      'API access',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 99,
    priceId: 'price_enterprise_xxx',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom contracts',
    ],
  },
];

export function getPlanByTier(tier: string): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.tier === tier);
}
