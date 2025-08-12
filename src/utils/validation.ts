import { Fixture, League, Standing } from '@/services/api';

// Type guards for API response validation
export const isValidFixture = (data: unknown): data is Fixture => {
  if (!data || typeof data !== 'object') return false;
  
  const fixture = data as any;
  
  return (
    fixture.fixture &&
    typeof fixture.fixture.id === 'number' &&
    typeof fixture.fixture.date === 'string' &&
    fixture.teams &&
    fixture.teams.home &&
    fixture.teams.away &&
    typeof fixture.teams.home.name === 'string' &&
    typeof fixture.teams.away.name === 'string' &&
    fixture.league &&
    typeof fixture.league.name === 'string'
  );
};

export const isValidLeague = (data: unknown): data is League => {
  if (!data || typeof data !== 'object') return false;
  
  const league = data as any;
  
  return (
    league.league &&
    typeof league.league.id === 'number' &&
    typeof league.league.name === 'string' &&
    league.country &&
    typeof league.country.name === 'string'
  );
};

export const isValidStanding = (data: unknown): data is Standing => {
  if (!data || typeof data !== 'object') return false;
  
  const standing = data as any;
  
  return (
    typeof standing.rank === 'number' &&
    standing.team &&
    typeof standing.team.name === 'string' &&
    typeof standing.points === 'number' &&
    standing.all &&
    typeof standing.all.played === 'number'
  );
};

// Validation functions for API responses
export const validateFixtures = (data: unknown[]): Fixture[] => {
  if (!Array.isArray(data)) {
    console.warn('Fixtures data is not an array');
    return [];
  }
  
  return data.filter(isValidFixture);
};

export const validateLeagues = (data: unknown[]): League[] => {
  if (!Array.isArray(data)) {
    console.warn('Leagues data is not an array');
    return [];
  }
  
  return data.filter(isValidLeague);
};

export const validateStandings = (data: unknown[]): Standing[] => {
  if (!Array.isArray(data)) {
    console.warn('Standings data is not an array');
    return [];
  }
  
  return data.filter(isValidStanding);
};

// Sanitize and validate user inputs
export const validateLeagueId = (leagueId: string): boolean => {
  return /^\d+$/.test(leagueId) && parseInt(leagueId) > 0;
};

export const validateSeason = (season: string): boolean => {
  return /^\d{4}$/.test(season) && parseInt(season) >= 2000 && parseInt(season) <= new Date().getFullYear() + 1;
};

// Image URL validation
export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol) &&
           /\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(parsedUrl.pathname);
  } catch {
    return false;
  }
};

// Fallback image for broken/invalid images
export const getFallbackTeamLogo = (teamName?: string): string => {
  const firstLetter = teamName?.charAt(0).toUpperCase() || 'T';
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
      <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#6b7280">
        ${firstLetter}
      </text>
    </svg>
  `)}`;
};