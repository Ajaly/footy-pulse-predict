import { Button } from "@/components/ui/button";
import { Menu, Home, BarChart3, Calendar, Trophy, Bell, Users, TrendingUp, Target, Globe, Settings } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: BarChart3, label: "Live Scores", href: "/scores" },
    { icon: Calendar, label: "Fixtures", href: "/fixtures" },
    { icon: Trophy, label: "Leagues", href: "/leagues" },
    { icon: Users, label: "Teams & Players", href: "/teams" },
    { icon: TrendingUp, label: "Transfers", href: "/transfers" },
    { icon: Target, label: "Predictions", href: "/predictions" },
    { icon: Globe, label: "News", href: "/news" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              YobraPulse
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top-1">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="justify-start gap-2 hover:bg-primary/10 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;