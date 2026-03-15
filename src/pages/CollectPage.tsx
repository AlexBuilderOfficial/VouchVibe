import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { campaignService, testimonialService } from '@/services/api';
import { VideoUploader } from '@/components/VideoUploader';
import type { Campaign, Testimonial } from '@/lib/supabase';

interface Question {
  id: string;
  question: string;
  required: boolean;
}

export function CollectPage(): JSX.Element {
  const { slug } = useParams<{ slug?: string }>();
  
  // Use demo campaign if no slug provided
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorCompany, setAuthorCompany] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [videoAssetId, setVideoAssetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug) {
          // Fetch specific campaign
          const campaignData = await campaignService.getBySlug(slug);
          if (campaignData) {
            setCampaign(campaignData);
            await campaignService.incrementViews(campaignData.id);
            const testimonialsData = await testimonialService.getPublicByCampaign(campaignData.id);
            setTestimonials(testimonialsData);
          }
        } else {
          // Use first demo campaign
          const campaigns = await campaignService.getAll();
          const publicCampaign = campaigns.find(c => c.is_public);
          if (publicCampaign) {
            setCampaign(publicCampaign);
            const testimonialsData = await testimonialService.getPublicByCampaign(publicCampaign.id);
            setTestimonials(testimonialsData);
          }
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setError(null);
    setSaving(true);

    try {
      await testimonialService.create({
        campaign_id: campaign.id,
        author_name: authorName,
        author_email: authorEmail || null,
        author_company: authorCompany || null,
        content,
        rating,
        video_asset_id: videoAssetId,
        status: 'pending',
      });

      setSubmitted(true);

      if (campaign.redirect_url) {
        setTimeout(() => {
          window.location.href = campaign.redirect_url!;
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit testimonial');
    } finally {
      setSaving(false);
    }
  };

  const themeColor = campaign?.theme_color || '#10B981';

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-vibe-mint border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
          <p className="text-gray-400 mb-6">This campaign doesn't exist or is private.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-vibe-mint text-obsidian font-bold rounded-xl"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const questions = campaign.questions as unknown as Question[] || [];

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${themeColor} 0%, transparent 70%)`,
          }}
        />
        
        <div className="relative max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {campaign.logo_url && (
              <img 
                src={campaign.logo_url} 
                alt={campaign.name}
                className="w-16 h-16 mx-auto mb-4 rounded-xl object-contain"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-xl text-gray-400">{campaign.description}</p>
            )}
          </motion.div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'submit'
                  ? 'bg-vibe-mint text-obsidian'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
              style={{ backgroundColor: activeTab === 'submit' ? themeColor : undefined }}
            >
              Share Your Experience
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'view'
                  ? 'bg-vibe-mint text-obsidian'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
              style={{ backgroundColor: activeTab === 'view' ? themeColor : undefined }}
            >
              View Testimonials ({testimonials.length})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'submit' ? (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div 
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}20` }}
                  >
                    <svg className="w-10 h-10" style={{ color: themeColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                  <p className="text-gray-400">Your testimonial has been submitted successfully.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <h3 className="font-semibold mb-4">Your Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-vibe-mint/50"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-vibe-mint/50"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                      <input
                        type="text"
                        value={authorCompany}
                        onChange={(e) => setAuthorCompany(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-vibe-mint/50"
                        placeholder="Your company"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <h3 className="font-semibold mb-4">Your Feedback</h3>

                    {questions.map((q, i) => (
                      <div key={q.id}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {q.question} {q.required && '*'}
                        </label>
                        {i === 0 ? (
                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-vibe-mint/50"
                            placeholder="Share your experience..."
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-vibe-mint/50"
                            placeholder="Your answer..."
                            required={q.required}
                          />
                        )}
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="text-2xl transition-colors"
                            style={{ color: star <= rating ? themeColor : '#4B5563' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <h3 className="font-semibold mb-4">Add a Video (Optional)</h3>
                    <VideoUploader
                      campaignId={campaign.id}
                      onUploadComplete={(assetId) => setVideoAssetId(assetId)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 font-bold rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
                    style={{ 
                      backgroundColor: themeColor,
                      color: '#0F172A',
                    }}
                  >
                    {saving ? 'Submitting...' : 'Submit Testimonial'}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {testimonials.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">No testimonials yet</h3>
                  <p className="text-gray-400">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {testimonials.map((testimonial, i) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                          style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                        >
                          {testimonial.author_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{testimonial.author_name}</span>
                            {testimonial.author_company && (
                              <span className="text-gray-400">• {testimonial.author_company}</span>
                            )}
                          </div>
                          <div className="flex text-sm mb-3" style={{ color: themeColor }}>
                            {'★'.repeat(testimonial.rating || 5)}
                          </div>
                          <p className="text-gray-300 leading-relaxed">{testimonial.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
