import Header from "@/components/Header";
import Support from "@/components/Support";
import Footer from "@/components/Footer";

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 md:pt-24">
        <Support />
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
