import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { POPULAR_LEAGUES, SEASONS, DEFAULT_LEAGUE, DEFAULT_SEASON } from '@/constants/leagues';
import { cn } from '@/lib/utils';

interface LeagueSelectorProps {
  selectedLeague: string;
  selectedSeason: string;
  onLeagueChange: (leagueId: string) => void;
  onSeasonChange: (season: string) => void;
  className?: string;
  disabled?: boolean;
}

export const LeagueSelector = ({
  selectedLeague,
  selectedSeason,
  onLeagueChange,
  onSeasonChange,
  className,
  disabled = false
}: LeagueSelectorProps) => {
  const currentLeague = POPULAR_LEAGUES.find(league => league.id === selectedLeague) || POPULAR_LEAGUES[0];
  const currentSeason = SEASONS.find(season => season.value === selectedSeason) || SEASONS[0];

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      {/* League Selector */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-foreground mb-2">
          League
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                {currentLeague.logo && (
                  <img 
                    src={currentLeague.logo} 
                    alt={currentLeague.name}
                    className="w-5 h-5 object-contain"
                  />
                )}
                <span>{currentLeague.flag}</span>
                <span className="truncate">{currentLeague.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[300px]">
            {POPULAR_LEAGUES.map((league) => (
              <DropdownMenuItem
                key={league.id}
                onClick={() => onLeagueChange(league.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1">
                  {league.logo && (
                    <img 
                      src={league.logo} 
                      alt={league.name}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span>{league.flag}</span>
                  <span className="flex-1">{league.name}</span>
                  <span className="text-sm text-muted-foreground">{league.country}</span>
                </div>
                {selectedLeague === league.id && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Season Selector */}
      <div className="sm:min-w-[150px]">
        <label className="block text-sm font-medium text-foreground mb-2">
          Season
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={disabled}
            >
              <span>{currentSeason.label}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SEASONS.map((season) => (
              <DropdownMenuItem
                key={season.value}
                onClick={() => onSeasonChange(season.value)}
                className="cursor-pointer"
              >
                <span className="flex-1">{season.label}</span>
                {selectedSeason === season.value && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};