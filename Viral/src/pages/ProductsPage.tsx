import Header from "@/components/landing/Header";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import Footer from "@/components/landing/Footer";

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
