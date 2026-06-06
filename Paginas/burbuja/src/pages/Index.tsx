import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OfferSection from "@/components/OfferSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <OfferSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
