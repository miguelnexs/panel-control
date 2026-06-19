import { Plane, Globe, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ocean">
            <Globe className="h-5 w-5 text-ocean-foreground" />
            <Plane className="absolute -right-1 -top-1 h-4 w-4 text-gold animate-float" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold leading-tight text-foreground">
              GlobeTrek
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Travel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Destinos
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Experiencias
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Inspiración
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Galería
          </a>
        </nav>

        {/* Mobile menu button */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
