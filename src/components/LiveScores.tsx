import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

const mockMatches = [
  {
    id: 1,
    homeTeam: "Manchester United",
    awayTeam: "Arsenal",
    homeScore: 2,
    awayScore: 1,
    status: "LIVE",
    minute: "78'",
    league: "Premier League"
  },
  {
    id: 2,
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    homeScore: 1,
    awayScore: 3,
    status: "FT",
    minute: "90'",
    league: "La Liga"
  },
  {
    id: 3,
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    homeScore: 0,
    awayScore: 0,
    status: "LIVE",
    minute: "23'",
    league: "Bundesliga"
  }
];

const LiveScores = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Scores</h2>
          <p className="text-muted-foreground text-lg">Follow the action as it happens</p>
        </div>

        <div className="grid gap-4">
          {mockMatches.map((match) => (
            <Card key={match.id} className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {match.league}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {match.status === "LIVE" && (
                      <>
                        <Zap className="h-4 w-4 text-victory-gold animate-pulse" />
                        <Badge variant="destructive" className="animate-pulse">
                          LIVE
                        </Badge>
                      </>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{match.minute}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{match.homeTeam}</span>
                      <span className="text-2xl font-bold text-primary">{match.homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{match.awayTeam}</span>
                      <span className="text-2xl font-bold text-primary">{match.awayScore}</span>
                    </div>
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

export default LiveScores;