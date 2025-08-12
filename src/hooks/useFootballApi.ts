import { useState, useEffect } from 'react';
import { footballApi, Fixture, League, Standing } from '@/services/api';

export function useFixtures(params: {
  league?: string;
  season?: string;
  status?: 'live' | 'upcoming' | 'finished';
} = {}) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await footballApi.getFixtures(params);

      if (apiError) {
        setError(apiError);
      } else {
        setFixtures(data || []);
      }

      setLoading(false);
    };

    fetchFixtures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.league, params.season, params.status]);

  return { fixtures, loading, error, refetch: () => fetchFixtures() };
}

export function useLiveScores(params: {
  league?: string;
  season?: string;
} = {}) {
  const [liveScores, setLiveScores] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveScores = async () => {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await footballApi.getLiveScores(params);

      if (apiError) {
        setError(apiError);
      } else {
        setLiveScores(data || []);
      }

      setLoading(false);
    };

    fetchLiveScores();
    
    // Set up polling for live scores (every 30 seconds)
    const interval = setInterval(fetchLiveScores, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.league, params.season]);

  return { liveScores, loading, error };
}

export function useLeagues(params: {
  country?: string;
  season?: string;
} = {}) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await footballApi.getLeagues(params);

      if (apiError) {
        setError(apiError);
      } else {
        setLeagues(data || []);
      }

      setLoading(false);
    };

    fetchLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.country, params.season]);

  return { leagues, loading, error };
}

export function useStandings(params: {
  league?: string;
  season?: string;
} = {}) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await footballApi.getStandings(params);

      if (apiError) {
        setError(apiError);
      } else {
        // Flatten the standings array (usually comes nested)
        const flatStandings = data?.[0] || [];
        setStandings(flatStandings);
      }

      setLoading(false);
    };

    fetchStandings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.league, params.season]);

  return { standings, loading, error };
}