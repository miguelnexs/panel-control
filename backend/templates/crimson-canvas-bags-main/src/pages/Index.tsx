import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesBar from "@/components/FeaturesBar";
import ProductGrid from "@/components/ProductGrid";
import CategorySection from "@/components/CategorySection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesBar />
        <ProductGrid />
        <CategorySection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
