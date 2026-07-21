import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    // Ensure this is called with the Service Role key
    if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Auto-end active consultations that run out of balance
    const { data: activeCons } = await supabaseClient
      .from('consultations')
      .select('id, started_at, per_minute_rate, owner_id')
      .eq('status', 'ACTIVE');
      
    if (activeCons && activeCons.length > 0) {
      for (const c of activeCons) {
         if (!c.started_at) continue;
         
         const { data: walletData } = await supabaseClient
            .from('wallets')
            .select('balance')
            .eq('user_id', c.owner_id)
            .single();
            
         if (!walletData) continue;
         
         const start = new Date(c.started_at).getTime();
         const now = Date.now();
         const seconds = Math.floor((now - start) / 1000);
         const intervals = Math.ceil(Math.max(seconds, 1) / 60);
         const costSoFar = intervals * c.per_minute_rate;
         
         if (costSoFar > walletData.balance) {
            await supabaseClient.from('consultations').update({
              status: 'COMPLETED',
              ended_at: new Date().toISOString()
            }).eq('id', c.id);
         }
      }
    }
    
    // 2. Bill recently COMPLETED consultations
    const { data: completedCons } = await supabaseClient
      .from('consultations')
      .select('id, started_at, ended_at, per_minute_rate, owner_id')
      .eq('status', 'COMPLETED')
      .not('ended_at', 'is', null)
      .not('started_at', 'is', null)
      .order('ended_at', { ascending: false })
      .limit(20);
      
    if (completedCons && completedCons.length > 0) {
       for (const c of completedCons) {
          const desc = `Consultation Fee - ${c.id}`;
          const start = new Date(c.started_at).getTime();
          const end = new Date(c.ended_at).getTime();
          let seconds = Math.floor((end - start) / 1000);
          if (seconds < 0) seconds = 0;
          
          const intervals = Math.ceil(Math.max(seconds, 0) / 60);
          const fee = intervals * c.per_minute_rate;
          
          if (fee > 0) {
             // Idempotent call, will only deduct once per description
             await supabaseClient.rpc('wallet_deduct', {
               p_user_id: c.owner_id,
               p_amount: fee,
               p_description: desc
             });
          }
       }
    }

    return new Response(JSON.stringify({ success: true, processed: { active: activeCons?.length || 0, completed: completedCons?.length || 0 } }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in billing-cron:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
