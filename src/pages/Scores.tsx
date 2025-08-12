import LiveScores from "@/components/LiveScores";
import Standings from "@/components/Standings";

const Scores = () => (
  <div className="min-h-screen bg-background">
    <LiveScores />
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Standings />
      </div>
    </div>
  </div>
);

export default Scores;