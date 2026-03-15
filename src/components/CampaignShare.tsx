import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import type { Campaign } from '@/lib/supabase';

interface CampaignShareProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'link' | 'qrcode' | 'embed' | 'email';

export function CampaignShare({ campaign, isOpen, onClose }: CampaignShareProps): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<TabType>('link');
  const [copied, setCopied] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Share your experience with us!');
  const [emailBody, setEmailBody] = useState('');

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/c/${campaign.slug}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareUrl]);

  const generateEmbedCode = useCallback(() => {
    return `<div id="vouchvibe-widget-${campaign.id}" data-campaign="${campaign.slug}"></div>
<script src="${baseUrl}/embed.js" async defer></script>
<style>
  #vouchvibe-widget-${campaign.id} {
    min-height: 200px;
    background: #0F172A;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>`;
  }, [campaign.id, campaign.slug, baseUrl]);

  const generateEmailTemplate = useCallback(() => {
    const template = `Hi,

We'd love to hear about your experience working with us! Your feedback helps us improve and helps other customers make informed decisions.

It only takes 60 seconds and you can even record a quick video message.

Share your experience here: ${shareUrl}

Thank you for being a part of our community!

Best regards,
The Team`;
    return template;
  }, [shareUrl]);

  const handleCopyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateEmbedCode]);

  const handleCopyEmail = useCallback(async () => {
    try {
      const mailto = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody || generateEmailTemplate())}`;
      window.location.href = mailto;
    } catch (err) {
      console.error('Failed to open email:', err);
    }
  }, [emailSubject, emailBody, generateEmailTemplate]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div 
          className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-obsidian-light border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold">Share Campaign</h2>
              <p className="text-sm text-gray-400">{campaign.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'link', label: 'Link', icon: '🔗' },
              { id: 'qrcode', label: 'QR Code', icon: '📱' },
              { id: 'embed', label: 'Embed', icon: '📝' },
              { id: 'email', label: 'Email', icon: '✉️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-vibe-mint border-b-2 border-vibe-mint'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'link' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campaign Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-vibe-mint text-obsidian hover:bg-vibe-mintLight'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Share your experience with us!')}&url=${encodeURIComponent(shareUrl)}`;
                      window.open(twitterUrl, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 rounded-xl text-[#1DA1F2] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => {
                      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                      window.open(linkedinUrl, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/30 rounded-xl text-[#0A66C2] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                </div>

                <div className="p-4 bg-vibe-mint/10 border border-vibe-mint/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-vibe-mint/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-vibe-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-vibe-mint">Analytics Tracked</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Every link click is tracked. Visit your dashboard to see conversion rates.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'qrcode' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center"
              >
                <div className="p-8 bg-white rounded-2xl mb-6">
                  <QRCodeSVG
                    value={shareUrl}
                    size={200}
                    level="H"
                    includeMargin
                    fgColor="#0F172A"
                  />
                </div>
                <p className="text-center text-gray-400 text-sm mb-4">
                  Scan this QR code to open the campaign on mobile
                </p>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Download QR
                </button>
              </motion.div>
            )}

            {activeTab === 'embed' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Embed Code
                  </label>
                  <textarea
                    value={generateEmbedCode()}
                    readOnly
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono"
                  />
                </div>
                <button
                  onClick={handleCopyEmbed}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-vibe-mint text-obsidian hover:bg-vibe-mintLight'
                  }`}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Embed Code'}
                </button>
                <p className="text-xs text-gray-400">
                  Paste this code anywhere on your website to display the testimonial collection widget.
                </p>
              </motion.div>
            )}

            {activeTab === 'email' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    placeholder="Share your experience with us!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message (preview)
                  </label>
                  <textarea
                    value={emailBody || generateEmailTemplate()}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                    placeholder="Write your custom message..."
                  />
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="w-full py-3 bg-vibe-mint text-obsidian font-medium rounded-xl hover:bg-vibe-mintLight transition-all"
                >
                  Open in Email Client
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Opens your default email app with the template. Perfect for personal outreach.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="px-6 py-4 bg-obsidian/50 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-vibe-mint">{campaign.total_views}</div>
                <div className="text-gray-500 text-xs">Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-vibe-mint">{campaign.total_submissions}</div>
                <div className="text-gray-500 text-xs">Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-vibe-mint">
                  {campaign.total_views > 0 
                    ? Math.round((campaign.total_submissions / campaign.total_views) * 100)
                    : 0}%
                </div>
                <div className="text-gray-500 text-xs">Conversion</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
