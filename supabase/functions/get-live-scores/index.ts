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
    console.log('API_KEY exists:', !!API_KEY)
    if (!API_KEY) {
      // Return mock data when API key is not available
      console.warn('FOOTBALL_API_KEY not found, returning mock data')
      return new Response(
        JSON.stringify({
          response: [],
          results: 0,
          paging: { current: 1, total: 1 }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Handle both URL params and body params
    const url = new URL(req.url)
    let league, season;
    
    // Try to get parameters from request body first
    try {
      const body = await req.json()
      league = body.league || url.searchParams.get('league') || '39'
      season = body.season || url.searchParams.get('season') || '2023'
    } catch {
      // If body parsing fails, use URL params
      league = url.searchParams.get('league') || '39'
      season = url.searchParams.get('season') || '2023'
    }

    // Free plan doesn't support &live=all parameter
    // Use basic fixtures endpoint and filter on frontend
    const response = await fetch(
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
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})