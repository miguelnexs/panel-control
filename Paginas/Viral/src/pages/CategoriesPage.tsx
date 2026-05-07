import Header from "@/components/landing/Header";
import Categories from "@/components/landing/Categories";
import Footer from "@/components/landing/Footer";

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
