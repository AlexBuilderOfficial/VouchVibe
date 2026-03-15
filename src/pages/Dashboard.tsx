import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services/api';
import type { Campaign } from '@/lib/supabase';

const CampaignShare = lazy(() => import('@/components/CampaignShare').then(module => ({ default: module.CampaignShare })));

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </motion.div>
  );
}

export function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [manageLoading, setManageLoading] = useState(false);
  const [shareCampaign, setShareCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchCampaigns = async () => {
      try {
        const data = await campaignService.getAll();
        if (mounted) {
          setCampaigns(data);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchCampaigns();
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageSubscription = async () => {
    setManageLoading(true);
    try {
      const { url } = await import('@/services/stripe').then(m => m.stripeService.createPortalSession());
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      navigate('/pricing');
    } finally {
      setManageLoading(false);
    }
  };

  if (!user || !profile) {
    return <LoadingSpinner />;
  }

  const totalViews = campaigns.reduce((sum, c) => sum + (c.total_views || 0), 0);
  const totalSubmissions = campaigns.reduce((sum, c) => sum + (c.total_submissions || 0), 0);

  return (
    <div className="min-h-screen bg-obsidian">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center">
              <span className="text-obsidian font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold">Vouch<span className="text-emerald-500">Vibe</span></span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400">{profile?.email || 'demo@vouchvibe.com'}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your testimonial campaigns</p>
          </div>

          <button
            onClick={() => navigate('/dashboard/campaigns/new')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-obsidian font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            + New Campaign
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatsCard label="Total Campaigns" value={campaigns.length} icon="📋" />
          <StatsCard label="Total Views" value={totalViews} icon="👁️" />
          <StatsCard label="Total Submissions" value={totalSubmissions} icon="💬" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/5 border border-emerald-500/30"
          >
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-2xl font-bold capitalize">{profile?.subscription_tier || 'free'}</div>
            <div className="text-gray-400 text-sm">Subscription</div>
            <button
              onClick={handleManageSubscription}
              disabled={manageLoading}
              className="mt-3 text-xs text-emerald-500 hover:underline disabled:opacity-50"
            >
              {manageLoading ? 'Loading...' : 'Manage subscription'}
            </button>
          </motion.div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-400 mb-6">Create your first campaign to start collecting testimonials</p>
            <button
              onClick={() => navigate('/dashboard/campaigns/new')}
              className="px-6 py-3 bg-emerald-500 text-obsidian font-bold rounded-xl"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{campaign.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    campaign.is_public 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {campaign.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                
                {campaign.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>👁️ {campaign.total_views || 0}</span>
                  <span>💬 {campaign.total_submissions || 0}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                    className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    Edit
                  </button>
                  {campaign.is_public && (
                    <button
                      onClick={() => setShareCampaign(campaign)}
                      className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 rounded-lg text-sm transition-colors"
                    >
                      Share
                    </button>
                  )}
                </div>

                {campaign.is_public && campaign.slug && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                      vouchvibe.com/c/{campaign.slug}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Suspense fallback={null}>
        {shareCampaign && (
          <CampaignShare
            campaign={shareCampaign}
            isOpen={!!shareCampaign}
            onClose={() => setShareCampaign(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
