
import { Heart, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Header = () => {
  const [favCount] = useState(8);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/75dac5ce-4165-41c3-bd69-781b48f71cd0.png" 
                alt="CG by Caro González Logo" 
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="text-xl md:text-2xl font-heading font-bold text-gradient">
                CG by Caro González
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Inicio
            </Link>
            <Link to="/catalog" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Catálogo
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Quiénes Somos
            </Link>
            <Link to="/specialties" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Especialidades
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Contacto
            </Link>
          </nav>

          {/* Icons and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-accent rounded-full transition-colors duration-200 group">
              <Heart className="w-6 h-6 text-foreground group-hover:text-primary transition-colors duration-200" />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {favCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate("/cart")}
              className="relative p-2 hover:bg-accent rounded-full transition-colors duration-200 group"
            >
              <ShoppingCart className="w-6 h-6 text-foreground group-hover:text-primary transition-colors duration-200" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden p-2 hover:bg-accent rounded-full transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-96 opacity-100 mt-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="bg-card rounded-lg shadow-lg border border-border p-4 space-y-4">
            <Link 
              to="/" 
              onClick={closeMobileMenu}
              className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-accent"
            >
              Inicio
            </Link>
            <Link 
              to="/catalog" 
              onClick={closeMobileMenu}
              className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-accent"
            >
              Catálogo
            </Link>
            <Link 
              to="/about" 
              onClick={closeMobileMenu}
              className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-accent"
            >
              Quiénes Somos
            </Link>
            <Link 
              to="/specialties" 
              onClick={closeMobileMenu}
              className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-accent"
            >
              Especialidades
            </Link>
            <Link 
              to="/contact" 
              onClick={closeMobileMenu}
              className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-accent"
            >
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
