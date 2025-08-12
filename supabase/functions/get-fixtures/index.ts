import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const league = url.searchParams.get('league') || '4328' // Default to Premier League (Free API ID)
    
    // Use free football API - no key required
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${league}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('API Response:', JSON.stringify(data, null, 2))
    console.log('Data keys:', Object.keys(data || {}))
    
    // Log specific properties to understand the structure
    if (data) {
      console.log('Has events:', !!data.events)
      console.log('Has response:', !!data.response)
      console.log('Has results:', !!data.results)
      if (data.events) {
        console.log('Events length:', data.events.length)
        console.log('First event keys:', data.events[0] ? Object.keys(data.events[0]) : 'No events')
      }
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})