import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Categories from "@/components/landing/Categories";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import ValueProposition from "@/components/landing/ValueProposition";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <ValueProposition />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
