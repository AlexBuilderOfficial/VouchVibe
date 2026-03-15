import type { Campaign, Testimonial, VideoAsset } from '../lib/supabase';

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'demo-campaign-1',
    user_id: 'demo-user-123',
    name: 'Customer Success Stories',
    slug: 'customer-success-stories',
    description: 'Collect powerful testimonials from your happy customers',
    questions: [
      { id: '1', question: 'What did you like most about our product?', required: true },
      { id: '2', question: 'Would you recommend us to a friend?', required: true },
      { id: '3', question: 'What could we improve?', required: false },
    ],
    theme_color: '#10B981',
    logo_url: null,
    is_public: true,
    allow_anonymous: false,
    notify_on_submit: true,
    redirect_url: null,
    total_views: 1247,
    total_submissions: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-campaign-2',
    user_id: 'demo-user-123',
    name: 'Product Feedback',
    slug: 'product-feedback',
    description: 'Help us improve our product with your feedback',
    questions: [
      { id: '1', question: 'How easy was our product to use?', required: true },
      { id: '2', question: 'What features do you like most?', required: false },
    ],
    theme_color: '#8B5CF6',
    logo_url: null,
    is_public: true,
    allow_anonymous: true,
    notify_on_submit: true,
    redirect_url: null,
    total_views: 523,
    total_submissions: 34,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-campaign-3',
    user_id: 'demo-user-123',
    name: 'Event Experience',
    slug: 'event-experience-2024',
    description: 'Share your experience from our recent event',
    questions: [
      { id: '1', question: 'What was your favorite part of the event?', required: true },
      { id: '2', question: 'Would you attend again?', required: true },
    ],
    theme_color: '#F59E0B',
    logo_url: null,
    is_public: false,
    allow_anonymous: false,
    notify_on_submit: true,
    redirect_url: null,
    total_views: 0,
    total_submissions: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    id: 'demo-testimonial-1',
    campaign_id: 'demo-campaign-1',
    author_name: 'Sarah Johnson',
    author_email: 'sarah@techcorp.com',
    author_company: 'TechCorp',
    author_role: 'CEO',
    author_avatar_url: null,
    content: 'VouchVibe completely transformed how we collect feedback. Our response rate increased by 340% in just two months! The video testimonials have been game-changing for our marketing.',
    rating: 5,
    video_asset_id: null,
    status: 'published',
    is_featured: true,
    ip_address: null,
    user_agent: null,
    referrer: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-testimonial-2',
    campaign_id: 'demo-campaign-1',
    author_name: 'Michael Chen',
    author_email: 'michael@startup.io',
    author_company: 'Startup.io',
    author_role: 'Product Manager',
    author_avatar_url: null,
    content: 'The embed functionality is brilliant. We added the widget to our website and started collecting testimonials within minutes. Highly recommend!',
    rating: 5,
    video_asset_id: null,
    status: 'published',
    is_featured: false,
    ip_address: null,
    user_agent: null,
    referrer: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-testimonial-3',
    campaign_id: 'demo-campaign-1',
    author_name: 'Emma Williams',
    author_email: 'emma@design.co',
    author_company: 'Design Co',
    author_role: 'Founder',
    author_avatar_url: null,
    content: 'Finally, a tool that makes it easy for customers to share their experiences. The video feature is fantastic and the analytics help us understand what resonates with prospects.',
    rating: 5,
    video_asset_id: null,
    status: 'published',
    is_featured: false,
    ip_address: null,
    user_agent: null,
    referrer: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const campaignService = {
  async getAll(): Promise<Campaign[]> {
    return DEMO_CAMPAIGNS;
  },

  async getById(id: string): Promise<Campaign | null> {
    return DEMO_CAMPAIGNS.find(c => c.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Campaign | null> {
    const campaign = DEMO_CAMPAIGNS.find(c => c.slug === slug && c.is_public);
    if (campaign) {
      return {
        ...campaign,
        total_views: campaign.total_views + 1,
      };
    }
    return null;
  },

  async create(campaign: Partial<Campaign>): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: `demo-campaign-${Date.now()}`,
      user_id: 'demo-user-123',
      name: campaign.name || 'New Campaign',
      slug: campaign.slug || `campaign-${Date.now()}`,
      description: campaign.description || null,
      questions: campaign.questions || [],
      theme_color: campaign.theme_color || '#10B981',
      logo_url: campaign.logo_url || null,
      is_public: campaign.is_public || false,
      allow_anonymous: campaign.allow_anonymous || false,
      notify_on_submit: campaign.notify_on_submit ?? true,
      redirect_url: campaign.redirect_url || null,
      total_views: 0,
      total_submissions: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_CAMPAIGNS.push(newCampaign);
    return newCampaign;
  },

  async update(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const index = DEMO_CAMPAIGNS.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    DEMO_CAMPAIGNS[index] = {
      ...DEMO_CAMPAIGNS[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return DEMO_CAMPAIGNS[index];
  },

  async delete(id: string): Promise<void> {
    const index = DEMO_CAMPAIGNS.findIndex(c => c.id === id);
    if (index !== -1) {
      DEMO_CAMPAIGNS.splice(index, 1);
    }
  },

  async incrementViews(id: string): Promise<void> {
    const campaign = DEMO_CAMPAIGNS.find(c => c.id === id);
    if (campaign) {
      campaign.total_views++;
    }
  },
};

export const testimonialService = {
  async getByCampaign(campaignId: string): Promise<Testimonial[]> {
    return DEMO_TESTIMONIALS.filter(t => t.campaign_id === campaignId);
  },

  async getPublicByCampaign(campaignId: string): Promise<Testimonial[]> {
    return DEMO_TESTIMONIALS.filter(t => t.campaign_id === campaignId && t.status === 'published');
  },

  async create(testimonial: Partial<Testimonial>): Promise<Testimonial> {
    const newTestimonial: Testimonial = {
      id: `demo-testimonial-${Date.now()}`,
      campaign_id: testimonial.campaign_id || '',
      author_name: testimonial.author_name || 'Anonymous',
      author_email: testimonial.author_email || null,
      author_company: testimonial.author_company || null,
      author_role: testimonial.author_role || null,
      author_avatar_url: null,
      content: testimonial.content || '',
      rating: testimonial.rating || 5,
      video_asset_id: testimonial.video_asset_id || null,
      status: 'pending',
      is_featured: false,
      ip_address: null,
      user_agent: null,
      referrer: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_TESTIMONIALS.push(newTestimonial);
    
    // Update campaign counter
    const campaign = DEMO_CAMPAIGNS.find(c => c.id === testimonial.campaign_id);
    if (campaign) {
      campaign.total_submissions++;
    }
    
    return newTestimonial;
  },

  async updateStatus(id: string, status: Testimonial['status']): Promise<Testimonial> {
    const index = DEMO_TESTIMONIALS.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Testimonial not found');
    
    DEMO_TESTIMONIALS[index] = {
      ...DEMO_TESTIMONIALS[index],
      status,
      updated_at: new Date().toISOString(),
    };
    return DEMO_TESTIMONIALS[index];
  },

  async delete(id: string): Promise<void> {
    const index = DEMO_TESTIMONIALS.findIndex(t => t.id === id);
    if (index !== -1) {
      DEMO_TESTIMONIALS.splice(index, 1);
    }
  },
};

export const videoService = {
  async getSignedUploadUrl(
    campaignId: string,
    fileName: string,
    _mimeType: string
  ): Promise<{ signedUrl: string; storagePath: string; assetId: string }> {
    const assetId = crypto.randomUUID();
    const storagePath = `${campaignId}/${assetId}/${fileName}`;
    
    return {
      signedUrl: `https://demo.vouchvibe.com/upload/${storagePath}`,
      storagePath,
      assetId,
    };
  },

  async create(_asset: Partial<VideoAsset>): Promise<VideoAsset> {
    const asset: VideoAsset = {
      id: `demo-video-${Date.now()}`,
      user_id: 'demo-user-123',
      campaign_id: _asset.campaign_id || null,
      bucket_id: 'testimonials-media',
      storage_path: _asset.storage_path || '',
      original_name: _asset.original_name || 'video.mp4',
      file_size: _asset.file_size || 0,
      mime_type: _asset.mime_type || 'video/mp4',
      status: 'ready',
      duration_seconds: 30,
      width: 1920,
      height: 1080,
      thumbnail_url: `https://picsum.photos/seed/${Date.now()}/640/360`,
      signed_url_expires_at: null,
      transcript: null,
      thumbnail_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return asset;
  },

  async updateStatus(id: string, status: VideoAsset['status'], updates?: Partial<VideoAsset>): Promise<VideoAsset> {
    return {
      id,
      user_id: 'demo-user-123',
      campaign_id: null,
      bucket_id: 'testimonials-media',
      storage_path: '',
      original_name: '',
      file_size: 0,
      mime_type: 'video/mp4',
      status,
      duration_seconds: 30,
      width: 1920,
      height: 1080,
      thumbnail_url: null,
      signed_url_expires_at: null,
      transcript: null,
      thumbnail_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates,
    };
  },

  async getSignedDownloadUrl(_assetId: string): Promise<string> {
    return 'https://demo.vouchvibe.com/video.mp4';
  },

  async delete(_assetId: string): Promise<void> {
    // Demo - no deletion
  },
};
