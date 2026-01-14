import TemplatesManager from "@/components/dashboard/TemplatesManager";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Templates = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <TemplatesManager />
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
