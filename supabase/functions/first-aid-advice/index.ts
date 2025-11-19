import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emergency } = await req.json();
    console.log('Received emergency request:', emergency);

    if (!emergency || emergency.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Emergency description is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompt = `You are an AI Emergency First Aid Advisor. Your role is to provide IMMEDIATE, CLEAR, and LIFE-SAVING first aid guidance.

CRITICAL RULES:
1. Be EXTREMELY CLEAR and CONCISE - people are panicking
2. ALWAYS structure your response in these EXACT sections with these EXACT labels:
   - DO's: (numbered list, 3-5 critical actions)
   - DON'Ts: (numbered list, 3-5 critical warnings)
   - WHEN TO CALL EMERGENCY: (clear criteria, 2-4 points)
   - IMMEDIATE STEPS: (numbered sequence, 3-6 steps)
3. Start each section on a NEW LINE with the label in ALL CAPS followed by a colon
4. Use simple language - no medical jargon
5. Focus on what can be done RIGHT NOW with no equipment
6. Be direct and authoritative

Example format:
DO's:
1. Action one
2. Action two
3. Action three

DON'Ts:
1. Warning one
2. Warning two
3. Warning three

WHEN TO CALL EMERGENCY:
1. Criterion one
2. Criterion two

IMMEDIATE STEPS:
1. First step
2. Second step
3. Third step

Now provide first aid advice for: "${emergency}"`;

    console.log('Calling Lovable AI Gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide first aid guidance for: ${emergency}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content;

    if (!advice) {
      console.error('No advice in response:', data);
      return new Response(
        JSON.stringify({ error: 'No advice generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully generated advice');
    return new Response(
      JSON.stringify({ advice }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in first-aid-advice function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
