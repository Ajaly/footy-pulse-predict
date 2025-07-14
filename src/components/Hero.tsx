import { Button } from "@/components/ui/button";
import { PlayCircle, BarChart3, Trophy } from "lucide-react";
import heroStadium from "@/assets/hero-stadium.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroStadium})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-primary bg-clip-text text-transparent">
            FootyPulse
          </h1>
          <div className="text-xl md:text-2xl text-muted-foreground font-medium">
            Live Scores • Predictions • Stats
          </div>
        </div>

        <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          Experience football like never before with real-time scores, AI-powered predictions, 
          and comprehensive match analytics all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button variant="hero" size="lg" className="w-full sm:w-auto">
            <PlayCircle className="mr-2 h-5 w-5" />
            Watch Live Scores
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <BarChart3 className="mr-2 h-5 w-5" />
            View Predictions
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-card p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
            <PlayCircle className="h-8 w-8 text-primary mb-3 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Live Scores</h3>
            <p className="text-muted-foreground text-sm">Real-time match updates and commentary</p>
          </div>
          
          <div className="bg-gradient-card p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
            <BarChart3 className="h-8 w-8 text-primary mb-3 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">AI Predictions</h3>
            <p className="text-muted-foreground text-sm">Smart match outcome forecasts</p>
          </div>
          
          <div className="bg-gradient-card p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-match-card">
            <Trophy className="h-8 w-8 text-primary mb-3 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Team Stats</h3>
            <p className="text-muted-foreground text-sm">Comprehensive player and team analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;