import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PRICING_PLANS, type PricingPlan } from '@/lib/pricing';
import { stripeService } from '@/services/stripe';
import { useAuth } from '@/context/AuthContext';

export function PricingPage(): JSX.Element {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      navigate('/', { state: { showAuth: true } });
      return;
    }

    if (!plan.priceId) {
      // Free plan - just update locally
      return;
    }

    setLoading(plan.id);

    try {
      const { url } = await stripeService.createCheckoutSession(plan.priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(null);
    }
  };

  const currentTier = profile?.subscription_tier || 'free';

  return (
    <div className="min-h-screen bg-obsidian py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent <span className="text-vibe-mint">Pricing</span>
          </h1>
          <p className="text-xl text-gray-400">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative p-6 rounded-2xl border transition-all
                ${plan.highlighted 
                  ? 'bg-vibe-mint/10 border-vibe-mint/50 transform scale-105' 
                  : 'bg-white/5 border-white/10 hover:border-white/30'
                }
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vibe-mint text-obsidian text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              {currentTier === plan.tier && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  Current Plan
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-vibe-mint shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id || currentTier === plan.tier}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50
                  ${plan.highlighted 
                    ? 'bg-vibe-mint text-obsidian hover:bg-vibe-mintLight hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }
                  ${currentTier === plan.tier ? 'cursor-default' : ''}
                `}
              >
                {loading === plan.id 
                  ? 'Loading...' 
                  : currentTier === plan.tier 
                    ? 'Current Plan' 
                    : plan.price === 0 
                      ? 'Get Started' 
                      : 'Subscribe'
                }
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 text-gray-400"
        >
          <p>All plans include a 14-day free trial. Cancel anytime.</p>
          <p className="mt-2">Need a custom plan? <a href="#" className="text-vibe-mint hover:underline">Contact us</a></p>
        </motion.div>
      </div>
    </div>
  );
}
