import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, Target } from "lucide-react";

const upcomingMatches = [
  {
    id: 1,
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    date: "2024-01-15",
    time: "16:30",
    league: "Premier League",
    prediction: "Liverpool Win",
    confidence: 72
  },
  {
    id: 2,
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    date: "2024-01-16",
    time: "20:45",
    league: "Serie A",
    prediction: "Draw",
    confidence: 45
  },
  {
    id: 3,
    homeTeam: "PSG",
    awayTeam: "Marseille",
    date: "2024-01-17",
    time: "21:00",
    league: "Ligue 1",
    prediction: "PSG Win",
    confidence: 68
  }
];

const Fixtures = () => {
  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Fixtures</h2>
          <p className="text-muted-foreground text-lg">Get ready for the next big matches</p>
        </div>

        <div className="grid gap-6">
          {upcomingMatches.map((match) => (
            <Card key={match.id} className="bg-gradient-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {match.league}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-sm">{match.date} at {match.time}</span>
                      </div>
                    </div>

                    <div className="text-center lg:text-left">
                      <div className="text-xl font-bold mb-1">
                        {match.homeTeam} <span className="text-muted-foreground">vs</span> {match.awayTeam}
                      </div>
                    </div>
                  </div>

                  {/* AI Prediction */}
                  <div className="bg-secondary/30 rounded-lg p-4 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Prediction</span>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary mb-1">{match.prediction}</div>
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-victory-gold" />
                        <span className="text-sm text-victory-gold font-medium">{match.confidence}% confidence</span>
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