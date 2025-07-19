import { useEffect, useState } from "react";
import supabase from "@/integrations/utils/supabase.ts";

type League = {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    flag: string;
  };
  seasons: {
    year: number;
    start: string;
    end: string;
    current: boolean;
  }[];
};

const Leagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke("football-leagues", {
          method: "GET",
        });
        if (error) throw error;
        setLeagues(data?.response || []);
      } catch (err) {
        setError("Failed to load leagues");
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading leagues...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!leagues || leagues.length === 0) {
    return <div className="p-8 text-center text-gray-500">Could not load leagues.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Leagues in England (2023)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {leagues
          .filter(
            (l) =>
              l &&
              l.league &&
              l.league.id &&
              l.league.name &&
              l.league.logo &&
              l.country &&
              l.country.name &&
              l.country.flag &&
              Array.isArray(l.seasons)
          )
          .map((l) => (
            <div
              key={l.league.id}
              className="bg-white/80 dark:bg-gray-900/60 rounded-lg shadow flex items-center gap-4 p-4"
            >
              <img src={l.league.logo} alt={l.league.name} className="h-12 w-12 rounded bg-white p-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold">{l.league.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{l.league.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <img src={l.country.flag} alt={l.country.name} className="h-4 w-6 rounded" />
                  <span>{l.country.name}</span>
                  <span className="mx-2">|</span>
                  <span>
                    Season:{" "}
                    {l.seasons.length > 0
                      ? `${l.seasons[0].year} (${l.seasons[0].start} to ${l.seasons[0].end})`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Leagues;