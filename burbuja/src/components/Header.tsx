import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Monitor, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/services" },
    { name: "Tienda", href: "/shop" },
    { name: "Soporte", href: "/support" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center shadow-glow">
              <Monitor className="w-6 h-6 text-navy" />
            </div>
            <span className="font-heading font-bold text-xl text-navy-foreground">
              Tech<span className="text-highlight">Store</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-navy-foreground/80 hover:text-highlight transition-colors duration-300 font-medium text-sm uppercase tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <CartSheet />
            <a href="tel:+573001234567" className="flex items-center gap-2 text-highlight font-medium">
              <Phone className="w-4 h-4" />
              <span className="text-sm">+57 300 123 4567</span>
            </a>
            <Button variant="cta" size="sm">
              Cotizar Ahora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <CartSheet />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-navy-foreground p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-secondary/30 animate-slide-up">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-3 text-navy-foreground/80 hover:text-highlight transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-secondary/30">
              <Button variant="cta" className="w-full">
                Cotizar Ahora
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
