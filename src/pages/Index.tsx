import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveScores from "@/components/LiveScores";
import Fixtures from "@/components/Fixtures";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <section id="home">
          <Hero />
        </section>
        <section id="scores">
          <LiveScores />
        </section>
        <section id="fixtures">
          <Fixtures />
        </section>
      </main>
    </div>
  );
};

export default Index;
