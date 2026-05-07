import Header from "@/components/landing/Header";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
