import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, Target, Loader2 } from "lucide-react";
import supabase from "@/integrations/utils/supabase";
import { useState, useEffect } from "react";

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
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
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
  };
}

const Fixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('get-fixtures', {
          body: { 
            league: '39', // Premier League
            season: '2024'
          }
        });

        if (error) throw error;
        
        if (data?.events) {
          // Map TheSportsDB format to our format
          const mappedFixtures = data.events.slice(0, 10).map((event: any) => ({
            fixture: {
              id: event.idEvent,
              date: event.dateEvent + 'T' + (event.strTime || '15:00:00'),
              status: {
                short: 'NS'
              }
            },
            teams: {
              home: {
                id: event.idHomeTeam,
                name: event.strHomeTeam,
                logo: event.strHomeTeamBadge || event.strTeamBadge
              },
              away: {
                id: event.idAwayTeam,
                name: event.strAwayTeam,
                logo: event.strAwayTeamBadge || event.strSquare
              }
            },
            league: {
              id: event.idLeague,
              name: event.strLeague,
              country: event.strCountry || 'England',
              logo: event.strLeagueBadge || ''
            }
          }));
          
          setFixtures(mappedFixtures);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fixtures');
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading fixtures...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Fixtures</h2>
          <p className="text-muted-foreground text-lg">Get ready for the next big matches</p>
        </div>

        <div className="grid gap-6">
          {fixtures.map((fixture) => (
            <Card key={fixture.fixture.id} className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {fixture.league.name}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(fixture.fixture.date).toLocaleDateString()} at{' '}
                          {new Date(fixture.fixture.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-center lg:text-left">
                      <div className="text-xl font-bold mb-1 flex items-center justify-center lg:justify-start gap-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={fixture.teams.home.logo} 
                            alt={fixture.teams.home.name}
                            className="w-6 h-6 object-contain"
                          />
                          <span>{fixture.teams.home.name}</span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          <span>{fixture.teams.away.name}</span>
                          <img 
                            src={fixture.teams.away.logo} 
                            alt={fixture.teams.away.name}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-secondary/30 rounded-lg p-4 min-w-[120px]">
                    <div className="text-center">
                      <div className="font-bold text-primary mb-1">Upcoming</div>
                      <div className="text-sm text-muted-foreground">
                        Not Started
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="lg:min-w-[120px]">
                    <Button variant="score" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Fixtures;