import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeagues } from "@/hooks/useFootballApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Globe, Trophy } from "lucide-react";
import Standings from "@/components/Standings";

const Leagues = () => {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const { leagues, loading, error } = useLeagues({ country: 'England' });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading leagues..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading leagues: {error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Football Leagues</h1>
            <p className="text-muted-foreground text-lg">Explore leagues and standings</p>
          </div>

          {selectedLeague ? (
            <div>
              <button 
                onClick={() => setSelectedLeague(null)}
                className="mb-6 text-primary hover:underline"
              >
                ← Back to Leagues
              </button>
              <Standings league={selectedLeague} season="2023" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leagues?.map((league) => (
                <Card 
                  key={league.league.id} 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedLeague(league.league.id.toString())}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={league.league.logo} 
                      alt={league.league.name}
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{league.league.name}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>{league.country.name}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Trophy className="h-3 w-3 mr-1" />
                    {league.league.type}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Leagues;