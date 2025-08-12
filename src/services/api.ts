import supabase from '@/integrations/utils/supabase';
import { apiCache, cacheKeys } from '@/utils/cache';
import { validateFixtures, validateLeagues, validateStandings } from '@/utils/validation';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
    venue: {
      name: string;
      city: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
  };
}

export interface League {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

export interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export class FootballApiService {
  private static instance: FootballApiService;

  public static getInstance(): FootballApiService {
    if (!FootballApiService.instance) {
      FootballApiService.instance = new FootballApiService();
    }
    return FootballApiService.instance;
  }

  private requestQueue = new Map<string, Promise<any>>();
  
  private async callSupabaseFunction<T>(
    functionName: string,
    params: Record<string, unknown> = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      // Create a unique key for this request
      const requestKey = `${functionName}:${JSON.stringify(params)}`;
      
      // If the same request is already in progress, return the existing promise
      if (this.requestQueue.has(requestKey)) {
        console.log(`Request already in progress for ${functionName}, waiting...`);
        return await this.requestQueue.get(requestKey);
      }
      
      console.log(`Calling ${functionName} with params:`, params);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Create the request promise and add it to the queue
      const requestPromise = supabase.functions.invoke(functionName, {
        body: params
      });
      
      this.requestQueue.set(requestKey, requestPromise);
      
      const result = await requestPromise;
      console.log(`Raw response from ${functionName}:`, result);
      
      const { data, error } = result;
      
      // Remove from queue after completion
      this.requestQueue.delete(requestKey);

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        
        // Check if it's a specific error we can handle
        if (error.message?.includes('FOOTBALL_API_KEY not found')) {
          return { 
            data: null, 
            error: 'API service is not configured. Please contact the administrator.' 
          };
        }
        
        return { data: null, error: error.message || 'Service temporarily unavailable' };
      }

      // Handle edge function errors (400 responses with error in body)
      if (data && typeof data === 'object' && 'error' in data) {
        console.error(`Edge function returned error:`, data);
        return { 
          data: null, 
          error: (data as any).error || 'Service error occurred'
        };
      }

      console.log(`${functionName} response:`, data);
      
      // Debug: Check if we're getting empty results from the API
      if (data && typeof data === 'object' && 'results' in data && data.results === 0) {
        console.warn(`${functionName} returned 0 results. This might indicate:
        - Invalid league/season combination
        - API rate limiting
        - No data available for the requested parameters`);
        
        if ('errors' in data && data.errors && Object.keys(data.errors).length > 0) {
          console.error(`API Errors:`, data.errors);
        }
      }
      
      return { data, error: null };
    } catch (err) {
      // Clean up the request queue on error
      const requestKey = `${functionName}:${JSON.stringify(params)}`;
      this.requestQueue.delete(requestKey);
      
      console.error(`Exception calling ${functionName}:`, err);
      
      // Handle network errors
      if (err instanceof Error && err.message.includes('fetch')) {
        return {
          data: null,
          error: 'Unable to connect to service. Please check your internet connection.'
        };
      }
      
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
  }

  async getFixtures(params: {
    league?: string;
    season?: string;
    date?: string;
    status?: 'live' | 'upcoming' | 'finished';
  } = {}): Promise<{ data: Fixture[] | null; error: string | null }> {
    const cacheKey = cacheKeys.fixtures(
      params.league || '39',
      params.season || '2024',
      params.status
    );

    // Check cache first (except for live scores)
    if (params.status !== 'live') {
      const cachedData = apiCache.get<Fixture[]>(cacheKey);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
    }

    const { data, error } = await this.callSupabaseFunction<{
      response: Fixture[];
      results: number;
    }>('get-fixtures', params);

    if (error) return { data: null, error };

    const rawFixtures = data?.response || [];
    let fixtures = validateFixtures(rawFixtures);
    
    if (rawFixtures.length > 0 && fixtures.length === 0) {
      console.warn('All fixture data failed validation');
      return { data: null, error: 'Invalid data received from API' };
    }
    
    // Filter fixtures based on status (since free plan doesn't support API filtering)
    const now = new Date();
    
    if (params.status === 'live') {
      fixtures = fixtures.filter(fixture => 
        fixture.fixture.status.short === 'LIVE' || 
        fixture.fixture.status.short === '1H' || 
        fixture.fixture.status.short === '2H' ||
        fixture.fixture.status.short === 'HT'
      );
    } else if (params.status === 'upcoming') {
      fixtures = fixtures.filter(fixture => {
        const fixtureDate = new Date(fixture.fixture.date);
        return fixture.fixture.status.short === 'NS' && fixtureDate > now;
      }).slice(0, 10); // Limit to 10 upcoming fixtures
    } else if (params.status === 'finished') {
      fixtures = fixtures.filter(fixture => 
        fixture.fixture.status.short === 'FT' ||
        fixture.fixture.status.short === 'AET' ||
        fixture.fixture.status.short === 'PEN'
      ).slice(-10); // Get last 10 finished fixtures
    }
    
    // Cache the validated and filtered data
    const ttl = params.status === 'live' ? 30 * 1000 : 5 * 60 * 1000; // 30s for live, 5min for others
    apiCache.set(cacheKey, fixtures, ttl);

    return {
      data: fixtures,
      error: null
    };
  }

  async getLiveScores(params: {
    league?: string;
    season?: string;
  } = {}): Promise<{ data: Fixture[] | null; error: string | null }> {
    // Get all fixtures and filter for live ones
    return this.getFixtures({ ...params, status: 'live' });
  }

  async getLeagues(params: {
    country?: string;
    season?: string;
  } = {}): Promise<{ data: League[] | null; error: string | null }> {
    const { data, error } = await this.callSupabaseFunction<{
      response: League[];
      results: number;
    }>('get-leagues', params);

    if (error) return { data: null, error };

    return {
      data: data?.response || [],
      error: null
    };
  }

  async getStandings(params: {
    league?: string;
    season?: string;
  } = {}): Promise<{ data: Standing[][] | null; error: string | null }> {
    const { data, error } = await this.callSupabaseFunction<{
      response: Array<{
        league: {
          id: number;
          name: string;
          country: string;
          logo: string;
          flag: string;
          season: number;
          standings: Standing[][];
        };
      }>;
      results: number;
    }>('get-standings', params);

    if (error) return { data: null, error };

    const standings = data?.response?.[0]?.league?.standings || [];
    return {
      data: standings,
      error: null
    };
  }
}

export const footballApi = FootballApiService.getInstance();