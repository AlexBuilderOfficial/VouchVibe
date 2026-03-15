import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services/api';
import type { Campaign } from '@/lib/supabase';

interface Question {
  id: string;
  question: string;
  required: boolean;
}

export function CampaignForm(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#10B981');
  const [isPublic, setIsPublic] = useState(false);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [notifyOnSubmit, setNotifyOnSubmit] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: 'What did you like most about our product?', required: true },
    { id: '2', question: 'Would you recommend us to a friend?', required: true },
  ]);

  useEffect(() => {
    if (isEditing && id) {
      const fetchCampaign = async () => {
        try {
          const campaign = await campaignService.getById(id);
          if (campaign) {
            setName(campaign.name);
            setSlug(campaign.slug);
            setDescription(campaign.description || '');
            setThemeColor(campaign.theme_color);
            setIsPublic(campaign.is_public);
            setAllowAnonymous(campaign.allow_anonymous);
            setNotifyOnSubmit(campaign.notify_on_submit);
            setRedirectUrl(campaign.redirect_url || '');
            setQuestions((campaign.questions as unknown as Question[]) || []);
          }
        } catch (err) {
          setError('Failed to load campaign');
        } finally {
          setLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [isEditing, id]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), question: '', required: false },
    ]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const campaignData = {
        user_id: user!.id,
        name,
        slug,
        description,
        theme_color: themeColor,
        is_public: isPublic,
        allow_anonymous: allowAnonymous,
        notify_on_submit: notifyOnSubmit,
        redirect_url: redirectUrl || null,
        questions: questions as unknown as Campaign['questions'],
      };

      if (isEditing && id) {
        await campaignService.update(id, campaignData);
      } else {
        await campaignService.create(campaignData);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vibe-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-semibold">
            {isEditing ? 'Edit Campaign' : 'New Campaign'}
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-vibe-mint/50"
                placeholder="Customer Success Stories"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">vouchvibe.com/c/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-vibe-mint/50"
                  placeholder="my-campaign"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-vibe-mint/50"
                placeholder="Describe your campaign..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-white/20 cursor-pointer"
                />
                <span className="text-gray-400">{themeColor}</span>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Questions</h2>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-start gap-4">
                    <span className="text-gray-400 mt-3">{index + 1}.</span>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-vibe-mint/50"
                        placeholder="Enter your question..."
                        required
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                          className="rounded border-white/20 bg-white/5 text-vibe-mint"
                        />
                        Required
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-vibe-mint/50 hover:text-vibe-mint transition-colors"
              >
                + Add Question
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold">Settings</h2>

            <div className="space-y-4">
              {[
                { label: 'Public Campaign', desc: 'Anyone with the link can view and submit', checked: isPublic, onChange: setIsPublic },
                { label: 'Allow Anonymous', desc: 'Users can submit without providing email', checked: allowAnonymous, onChange: setAllowAnonymous },
                { label: 'Notify on Submit', desc: 'Receive email when someone submits a testimonial', checked: notifyOnSubmit, onChange: setNotifyOnSubmit },
              ].map((option, i) => (
                <label key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={option.checked}
                    onChange={(e) => option.onChange(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-vibe-mint"
                  />
                </label>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Redirect URL (optional)</label>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-vibe-mint/50"
                  placeholder="https://yourwebsite.com/thank-you"
                />
              </div>
            </div>
          </motion.section>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-vibe-mint text-obsidian font-bold rounded-xl hover:bg-vibe-mintLight transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
