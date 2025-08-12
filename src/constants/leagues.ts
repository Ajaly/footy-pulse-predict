export interface League {
  id: string;
  name: string;
  country: string;
  flag: string;
  logo?: string;
}

export const POPULAR_LEAGUES: League[] = [
  { 
    id: '39', 
    name: 'Premier League', 
    country: 'England', 
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    logo: 'https://media.api-sports.io/football/leagues/39.png'
  },
  { 
    id: '140', 
    name: 'La Liga', 
    country: 'Spain', 
    flag: '🇪🇸',
    logo: 'https://media.api-sports.io/football/leagues/140.png'
  },
  { 
    id: '78', 
    name: 'Bundesliga', 
    country: 'Germany', 
    flag: '🇩🇪',
    logo: 'https://media.api-sports.io/football/leagues/78.png'
  },
  { 
    id: '135', 
    name: 'Serie A', 
    country: 'Italy', 
    flag: '🇮🇹',
    logo: 'https://media.api-sports.io/football/leagues/135.png'
  },
  { 
    id: '61', 
    name: 'Ligue 1', 
    country: 'France', 
    flag: '🇫🇷',
    logo: 'https://media.api-sports.io/football/leagues/61.png'
  },
  { 
    id: '2', 
    name: 'Champions League', 
    country: 'Europe', 
    flag: '🇪🇺',
    logo: 'https://media.api-sports.io/football/leagues/2.png'
  },
  { 
    id: '3', 
    name: 'Europa League', 
    country: 'Europe', 
    flag: '🇪🇺',
    logo: 'https://media.api-sports.io/football/leagues/3.png'
  }
];

export const SEASONS = [
  { value: '2023', label: '2023/24' },
  { value: '2022', label: '2022/23' },
  { value: '2021', label: '2021/22' }
];

export const DEFAULT_LEAGUE = '39'; // Premier League
export const DEFAULT_SEASON = '2023'; // Free plan: seasons 2021-2023 only