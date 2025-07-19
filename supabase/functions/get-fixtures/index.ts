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
    const API_KEY = Deno.env.get('FOOTBALL_API_KEY')

    console.log('API_KEY:', API_KEY)
    if (!API_KEY) {
      throw new Error('FOOTBALL_API_KEY not found in secrets')
    }

    const url = new URL(req.url)
    const league = url.searchParams.get('league') || '39' // Default to Premier League
    const next = url.searchParams.get('next') || '10' // Next 10 fixtures
    const season = url.searchParams.get('season') || '2023'

    const response = await fetch(
      // `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}&next=${next}`,

      //Free versions do not have access to the ne
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const data = await response.json()

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