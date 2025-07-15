import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    if (!API_KEY) {
      throw new Error('FOOTBALL_API_KEY not found in secrets')
    }

    const url = new URL(req.url)
    const league = url.searchParams.get('league') || '39' // Default to Premier League
    const season = url.searchParams.get('season') || '2024'

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}&live=all`,
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})