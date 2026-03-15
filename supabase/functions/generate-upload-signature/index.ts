import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  campaign_id: string;
  file_name: string;
  mime_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    // Get request body
    const { campaign_id, file_name, mime_type }: UploadRequest = await req.json();

    if (!campaign_id || !file_name || !mime_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('user_id')
      .eq('id', campaign_id)
      .single();

    if (campaignError || campaign.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Campaign not found or unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check quota
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, videos_used_this_month, monthly_video_limit')
      .eq('id', user.id)
      .single();

    const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise';
    const canUpload = isPro || (profile?.videos_used_this_month ?? 0) < (profile?.monthly_video_limit ?? 3);

    if (!canUpload) {
      return new Response(JSON.stringify({ error: 'Monthly quota exceeded' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique storage path: /{user_id}/{campaign_id}/{uuid}.{ext}
    const uuid = crypto.randomUUID();
    const ext = file_name.split('.').pop();
    const storagePath = `${user.id}/${campaign_id}/${uuid}.${ext}`;

    // Create video asset record
    const { data: asset, error: assetError } = await supabase
      .from('video_assets')
      .insert({
        user_id: user.id,
        campaign_id,
        storage_path: storagePath,
        original_name: file_name,
        mime_type,
        status: 'processing',
      })
      .select()
      .single();

    if (assetError) throw assetError;

    // Generate signed URL (expires in 15 minutes)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from('testimonials-media')
      .createSignedUploadUrl(storagePath);

    if (signedError) throw signedError;

    return new Response(JSON.stringify({
      signedUrl: signedUrlData.signedUrl,
      storagePath,
      assetId: asset.id,
      expiresAt: signedUrlData.expiresAt,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
