import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Calendar, RefreshCw } from "lucide-react";
import { useLiveScores } from "@/hooks/useFootballApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { LeagueSelector } from "@/components/LeagueSelector";
import { DEFAULT_LEAGUE, DEFAULT_SEASON } from "@/constants/leagues";

const LiveScores = () => {
  const [selectedLeague, setSelectedLeague] = useState(DEFAULT_LEAGUE);
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASON);
  
  const { liveScores, loading, error } = useLiveScores({
    league: selectedLeague,
    season: selectedSeason
  });

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner size="lg" text="Loading live scores..." />;
    }

    if (error) {
      return (
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading live scores: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      );
    }

    if (!liveScores.length) {
      return (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No Live Matches"
          description="There are no live matches at the moment. Check back later for live scores!"
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
      <div className="grid gap-4">
        {liveScores.map((match) => (
          <Card key={match.fixture.id} className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-xs">
                  {match.league.name}
                </Badge>
                <div className="flex items-center gap-2">
                  {match.fixture.status.short === "LIVE" && (
                    <>
                      <Zap className="h-4 w-4 text-victory-gold animate-pulse" />
                      <Badge variant="destructive" className="animate-pulse">
                        LIVE
                      </Badge>
                    </>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{match.fixture.status.long}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img 
                        src={match.teams.home.logo} 
                        alt={match.teams.home.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                      />
                      <span className="font-semibold text-sm sm:text-lg truncate">{match.teams.home.name}</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-primary flex-shrink-0 ml-2">{match.goals.home ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img 
                        src={match.teams.away.logo} 
                        alt={match.teams.away.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                      />
                      <span className="font-semibold text-sm sm:text-lg truncate">{match.teams.away.name}</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-primary flex-shrink-0 ml-2">{match.goals.away ?? 0}</span>
                  </div>
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
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Scores</h2>
            <p className="text-muted-foreground text-lg">Follow the action as it happens</p>
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

export default LiveScores;