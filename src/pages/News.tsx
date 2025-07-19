import { useEffect, useState } from "react";
import supabase from "@/integrations/utils/supabase.ts";

type Standing = {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: any[];
  };
};

const News = () => {
  const [standing, setStanding] = useState<Standing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke("football-standings", {
          method: "GET",
        });
        if (error) throw error;
        if (!data || !data.response || !Array.isArray(data.response) || !data.response[0]) {
          setStanding(null);
        } else {
          setStanding(data.response[0]);
        }
      } catch (err) {
        setError("Failed to load standings");
        setStanding(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 pt-24">
      {/* Added pt-24 for spacing below the fixed Navigation */}
      {/* Upper part: League info */}
      {loading ? (
        <div className="p-8 text-center">Loading league info...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : !standing || !standing.league ? (
        <div className="p-8 text-center text-gray-500">Standings data could not be fetched.</div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-white/80 dark:bg-gray-900/60 rounded-lg shadow p-4">
          <img
            src={standing.league.logo || ""}
            alt={standing.league.name || "League"}
            className="h-16 w-16 rounded bg-white p-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold">{standing.league.name || "Unknown League"}</span>
              {standing.league.flag && (
                <img
                  src={standing.league.flag}
                  alt={standing.league.country || "Country"}
                  className="h-5 w-8 rounded"
                />
              )}
              <span className="text-base text-gray-600 dark:text-gray-300">
                {standing.league.country || ""}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Season: <span className="font-semibold">{standing.league.season || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lower part: News content placeholder */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Football News</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Latest football news and updates will appear here.
        </p>
      </div>
    </div>
  );
};

export default News;