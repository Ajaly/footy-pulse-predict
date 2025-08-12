import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Calendar, RefreshCw } from "lucide-react";
import { useFixtures } from "@/hooks/useFootballApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import ErrorBoundary from "@/components/ui/error-boundary";
import { LeagueSelector } from "@/components/LeagueSelector";
import { DEFAULT_LEAGUE, DEFAULT_SEASON } from "@/constants/leagues";

const Fixtures = () => {
  const [selectedLeague, setSelectedLeague] = useState(DEFAULT_LEAGUE);
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASON);
  
  const { fixtures, loading, error } = useFixtures({
    league: selectedLeague,
    season: selectedSeason,
    status: 'finished' // Change to 'finished' to see completed 2023 matches
  });

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner size="lg" text="Loading fixtures..." />;
    }

    if (error) {
      return (
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading fixtures: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      );
    }

    if (!fixtures.length) {
      return (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No Fixtures Found"
          description="There are no fixtures available for the selected league and season."
          action={
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid gap-6">
        {fixtures.map((fixture) => (
          <Card key={fixture.fixture.id} className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {fixture.league.name}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>
                        {new Date(fixture.fixture.date).toLocaleDateString()} at{' '}
                        {new Date(fixture.fixture.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img 
                          src={fixture.teams.home.logo} 
                          alt={fixture.teams.home.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                        />
                        <span className="font-medium text-sm sm:text-base truncate">{fixture.teams.home.name}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground px-2">vs</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="font-medium text-sm sm:text-base truncate text-right">{fixture.teams.away.name}</span>
                        <img 
                          src={fixture.teams.away.logo} 
                          alt={fixture.teams.away.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-secondary/30 rounded-lg p-3 sm:p-4 sm:min-w-[120px]">
                  <div className="text-center">
                    <div className="font-bold text-primary mb-1 text-sm sm:text-base">
                      {fixture.fixture.status.short === 'FT' ? 'Finished' : 
                       fixture.fixture.status.short === 'NS' ? 'Upcoming' : 
                       fixture.fixture.status.long}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {fixture.fixture.status.short === 'FT' ? `${fixture.goals?.home || 0}-${fixture.goals?.away || 0}` : 
                       fixture.fixture.status.long}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="sm:min-w-[120px]">
                  <Button variant="outline" className="w-full text-xs sm:text-sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };
  return (
    <ErrorBoundary>
      <section className="py-8 sm:py-16 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Recent Fixtures</h2>
            <p className="text-muted-foreground text-base sm:text-lg">View completed matches from the season</p>
          </div>
          
          <div className="mb-8">
            <LeagueSelector
              selectedLeague={selectedLeague}
              selectedSeason={selectedSeason}
              onLeagueChange={setSelectedLeague}
              onSeasonChange={setSelectedSeason}
              disabled={loading}
            />
          </div>
          
          {renderContent()}
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Fixtures;