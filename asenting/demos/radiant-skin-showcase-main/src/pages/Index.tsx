import Header from "@/components/lovalbe/Header";
import Hero from "@/components/lovalbe/Hero";
import Products from "@/components/lovalbe/Products";
import Benefits from "@/components/lovalbe/Benefits";
import Testimonials from "@/components/lovalbe/Testimonials";
import About from "@/components/lovalbe/About";
import Contact from "@/components/lovalbe/Contact";
import Footer from "@/components/lovalbe/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Products />
        <Benefits />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
