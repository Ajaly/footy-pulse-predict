import { Calendar, MapPin, Clock, Trophy, User, ChevronLeft, ChevronRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// League options
const LEAGUES = [
  { id: '39', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '140', name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: '78', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { id: '135', name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: '61', name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
  { id: '94', name: 'Primeira Liga', country: 'Portugal', flag: '🇵🇹' },
  { id: '88', name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱' },
  { id: '203', name: 'Süper Lig', country: 'Turkey', flag: '🇹🇷' }
];

// Season options (last 5 years)
const SEASONS = [
  { value: '2024', label: '2024/25' },
  { value: '2023', label: '2023/24' },
  { value: '2022', label: '2022/23' },
  { value: '2021', label: '2021/22' },
  { value: '2020', label: '2020/21' }
];

// TypeScript interfaces for the API data
interface Fixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
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
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FixturesResponse {
  get: string;
  parameters: {
    league: string;
    season: string;
    page?: number;
  };
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: Fixture[];
}

interface GroupedFixtures {
  [date: string]: Fixture[];
}

interface FixturesTimelineProps {
  edgeFunctionName?: string;
  defaultLeague?: string;
  defaultSeason?: string;
  pageSize?: number;
  className?: string;
}

const FixturesTimeline: React.FC<FixturesTimelineProps> = ({
  edgeFunctionName = 'get-fixtures',
  defaultLeague = '39',
  defaultSeason = '2023',
  pageSize = 50,
  className = ''
}) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedRound, setSelectedRound] = useState<string>('all');
  
  // State for league and season selection
  const [selectedLeague, setSelectedLeague] = useState(defaultLeague);
  const [selectedSeason, setSelectedSeason] = useState(defaultSeason);

  // Get current league info
  const currentLeague = useMemo(() => 
    LEAGUES.find(league => league.id === selectedLeague) || LEAGUES[0], 
    [selectedLeague]
  );

  const currentSeasonLabel = useMemo(() => 
    SEASONS.find(season => season.value === selectedSeason)?.label || selectedSeason,
    [selectedSeason]
  );

  // Fetch fixtures from Supabase edge function
  const fetchFixtures = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: edgeError } = await supabase.functions.invoke(edgeFunctionName, {
        body: {
          league: selectedLeague,
          season: selectedSeason,
          page: page,
          pageSize: pageSize
        }
      });

      if (edgeError) {
        throw new Error(`Edge function error: ${edgeError.message}`);
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      if (data.errors && data.errors.length > 0) {
        throw new Error(`API errors: ${data.errors.join(', ')}`);
      }

      const response: FixturesResponse = data;
      
      // Validate response structure
      if (!response.response || !Array.isArray(response.response)) {
        throw new Error('Invalid response structure: missing or invalid fixtures array');
      }

      if (page === 1) {
        // First page - replace fixtures
        setFixtures(response.response);
      } else {
        // Subsequent pages - append fixtures
        setFixtures(prev => [...prev, ...response.response]);
      }

      setCurrentPage(response.paging?.current || page);
      setTotalPages(response.paging?.total || 1);
      setTotalResults(response.results || 0);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fixtures';
      setError(errorMessage);
      console.error('Error fetching fixtures:', err);
      
      // If this is not the first page and we have existing data, don't clear it
      if (page === 1) {
        setFixtures([]);
        setTotalResults(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } finally {
      setLoading(false);
    }
  }, [edgeFunctionName, selectedLeague, selectedSeason, pageSize]);

  // Reset data when league or season changes
  useEffect(() => {
    setFixtures([]);
    setCurrentPage(1);
    setSelectedRound('all');
    setError(null);
    fetchFixtures(1);
  }, [selectedLeague, selectedSeason, fetchFixtures]);

  // Load more fixtures (for pagination)
  const loadMoreFixtures = useCallback(() => {
    if (currentPage < totalPages && !loading) {
      fetchFixtures(currentPage + 1);
    }
  }, [currentPage, totalPages, loading, fetchFixtures]);

  // Refresh fixtures
  const refreshFixtures = useCallback(() => {
    setCurrentPage(1);
    setError(null);
    fetchFixtures(1);
  }, [fetchFixtures]);

  // Handle league change
  const handleLeagueChange = (leagueId: string) => {
    if (leagueId !== selectedLeague) {
      setSelectedLeague(leagueId);
    }
  };

  // Handle season change
  const handleSeasonChange = (season: string) => {
    if (season !== selectedSeason) {
      setSelectedSeason(season);
    }
  };

  // Group fixtures by date with filtering
  const groupedFixtures = useMemo<GroupedFixtures>(() => {
    const filtered = selectedRound === 'all' 
      ? fixtures 
      : fixtures.filter(f => f.league.round === selectedRound);
      
    return filtered.reduce((groups: GroupedFixtures, fixture) => {
      const date = new Date(fixture.fixture.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(fixture);
      return groups;
    }, {});
  }, [fixtures, selectedRound]);

  // Get unique rounds for filter
  const rounds = useMemo(() => {
    const uniqueRounds = [...new Set(fixtures.map(f => f.league.round))];
    return uniqueRounds.sort((a, b) => {
      // Sort numerically if possible
      const aMatch = a.match(/(\d+)/);
      const bMatch = b.match(/(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.localeCompare(b);
    });
  }, [fixtures]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LIVE':
      case '1H':
      case '2H':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'NS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PST':
      case 'CANC':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get default team logo on error
  const getDefaultLogo = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeD0iOCIgeT0iOCI+CjxwYXRoIGQ9Ik04IDNMMTIgN0w4IDExTDQgN0w4IDNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4K';
  };

  // Error state
  if (error && fixtures.length === 0) {
    return (
      <div className={`max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load fixtures</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">{error}</p>
          <button
            onClick={refreshFixtures}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen ${className}`}>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-blue-600 flex-shrink-0" />
            <span className="flex items-center gap-2 flex-wrap">
              <span>{currentLeague.flag}</span>
              <span>{currentLeague.name}</span>
              <span className="text-xl text-gray-500 font-normal">({currentSeasonLabel})</span>
            </span>
          </h1>
          <button
            onClick={refreshFixtures}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* League and Season Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div>
            <label htmlFor="league-select" className="block text-sm font-medium text-gray-700 mb-2">
              League
            </label>
            <select
              id="league-select"
              value={selectedLeague}
              onChange={(e) => handleLeagueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {LEAGUES.map(league => (
                <option key={league.id} value={league.id}>
                  {league.flag} {league.name} ({league.country})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="season-select" className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {SEASONS.map(season => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats and filters */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div className="text-sm text-gray-600">
            Showing {fixtures.length} of {totalResults} fixtures
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          
          {rounds.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="round-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by Round:
              </label>
              <select
                id="round-filter"
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 min-w-0 text-gray-700"
              >
                <option value="all">All Rounds ({fixtures.length})</option>
                {rounds.map(round => {
                  const count = fixtures.filter(f => f.league.round === round).length;
                  return (
                    <option key={round} value={round}>
                      {round} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading state for initial load */}
      {loading && fixtures.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
          <span className="text-gray-600">Loading fixtures...</span>
        </div>
      )}

      {/* Timeline */}
      {Object.keys(groupedFixtures).length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200" aria-hidden="true"></div>

          {Object.entries(groupedFixtures)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayFixtures]) => (
            <div key={date} className="relative mb-8">
              {/* Date header */}
              <div className="flex items-center mb-4">
                <div className="relative z-10 bg-blue-600 text-white p-2 rounded-full mr-4 flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formatDate(date)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {dayFixtures.length} {dayFixtures.length === 1 ? 'match' : 'matches'}
                  </p>
                </div>
              </div>

              {/* Fixtures for this date */}
              <div className="ml-16 space-y-4">
                {dayFixtures
                  .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
                  .map((fixture) => (
                  <div key={fixture.fixture.id} 
                       className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    
                    {/* Match header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="flex-shrink-0" />
                        <span>{formatTime(fixture.fixture.date)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(fixture.fixture.status.short)}`}>
                          {fixture.fixture.status.short}
                          {fixture.fixture.status.elapsed && fixture.fixture.status.short !== 'FT' && (
                            <span className="ml-1">{fixture.fixture.status.elapsed}'</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                        {fixture.league.round}
                      </span>
                    </div>

                    {/* Teams and score */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Home team */}
                      <div className={`flex items-center gap-3 flex-1 min-w-0 ${fixture.teams.home.winner ? 'font-semibold' : ''}`}>
                        <img 
                          src={fixture.teams.home.logo} 
                          alt={`${fixture.teams.home.name} logo`}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getDefaultLogo();
                          }}
                        />
                        <span className="text-gray-900 truncate">{fixture.teams.home.name}</span>
                      </div>

                      {/* Score */}
                      <div className="mx-6 text-center flex-shrink-0">
                        {fixture.goals.home !== null && fixture.goals.away !== null ? (
                          <div className="text-2xl font-bold text-gray-900">
                            {fixture.goals.home} - {fixture.goals.away}
                          </div>
                        ) : (
                          <div className="text-lg text-gray-400">
                            vs
                          </div>
                        )}
                        {fixture.score.halftime.home !== null && fixture.score.halftime.away !== null && (
                          <div className="text-xs text-gray-500">
                            HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
                          </div>
                        )}
                      </div>

                      {/* Away team */}
                      <div className={`flex items-center gap-3 flex-1 justify-end min-w-0 ${fixture.teams.away.winner ? 'font-semibold' : ''}`}>
                        <span className="text-gray-900 truncate text-right">{fixture.teams.away.name}</span>
                        <img 
                          src={fixture.teams.away.logo} 
                          alt={`${fixture.teams.away.name} logo`}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getDefaultLogo();
                          }}
                        />
                      </div>
                    </div>

                    {/* Match details */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span className="truncate">{fixture.fixture.venue.name}, {fixture.fixture.venue.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={16} className="flex-shrink-0" />
                        <span className="truncate">{fixture.fixture.referee || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreFixtures}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading...
              </>
            ) : (
              <>
                <ChevronRight className="mr-2" size={16} />
                Load More Fixtures ({totalResults - fixtures.length} remaining)
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(groupedFixtures).length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fixtures found</h3>
          <p className="text-gray-600">No matches found for the selected criteria.</p>
        </div>
      )}

      {/* Error banner for subsequent page loads */}
      {error && fixtures.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to load additional fixtures: {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixturesTimeline;