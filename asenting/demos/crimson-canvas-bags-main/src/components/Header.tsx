import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Cangureras", href: "#cangureras" },
    { name: "Mochilas", href: "#mochilas" },
    { name: "Cruzados", href: "#cruzados" },
    { name: "Accesorios", href: "#accesorios" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="font-display text-3xl md:text-4xl tracking-wider text-foreground">
              4<span className="text-accent">C</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-300 uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-foreground hover:text-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-foreground hover:text-accent transition-colors hidden md:block">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 text-foreground hover:text-accent transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs flex items-center justify-center">
                0
              </span>
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-3 text-sm font-medium text-foreground hover:text-accent transition-colors uppercase tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
