
import Header from "../components/Header";
import HeroBanner from "../components/HeroBanner";
import PromotionsSection from "../components/PromotionsSection";
import ProductsGrid from "../components/ProductsGrid";
import WhyChooseUs from "../components/WhyChooseUs";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <PromotionsSection />
        <ProductsGrid />
        <WhyChooseUs />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
