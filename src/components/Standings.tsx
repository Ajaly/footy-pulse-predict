import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useStandings } from "@/hooks/useFootballApi";

interface StandingsProps {
  league?: string;
  season?: string;
}

const Standings = ({ league = '39', season = '2024' }: StandingsProps) => {
  const { standings, loading, error } = useStandings({ league, season });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </Card>
    );
  }

  if (!standings.length) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No standings data available</p>
        </div>
      </Card>
    );
  }

  const getFormIcon = (form: string, index: number) => {
    const result = form[index];
    if (result === 'W') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (result === 'L') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-yellow-500" />;
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-6">League Table</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">P</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">Pts</TableHead>
                <TableHead className="text-center">Form</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team) => (
                <TableRow key={team.team.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{team.rank}</span>
                      {team.rank <= 4 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          UCL
                        </Badge>
                      )}
                      {team.rank >= standings.length - 2 && (
                        <Badge variant="destructive" className="text-xs">
                          REL
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img 
                        src={team.team.logo} 
                        alt={team.team.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="font-medium">{team.team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{team.all.played}</TableCell>
                  <TableCell className="text-center">{team.all.win}</TableCell>
                  <TableCell className="text-center">{team.all.draw}</TableCell>
                  <TableCell className="text-center">{team.all.lose}</TableCell>
                  <TableCell className="text-center">{team.all.goals.for}</TableCell>
                  <TableCell className="text-center">{team.all.goals.against}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${team.goalsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-primary">{team.points}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {team.form.split('').slice(-5).map((result, index) => (
                        <div key={index} className="flex items-center justify-center w-5 h-5 rounded-full bg-muted">
                          {getFormIcon(team.form, team.form.length - 5 + index)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default Standings;