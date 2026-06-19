import { Button } from "@/components/ui/button";

const NewsletterSection = () => {
  return (
    <section className="py-20 bg-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-background/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-background/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-background/20 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-accent text-sm uppercase tracking-widest font-semibold">
            Newsletter
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-background mt-4">
            ÚNETE A LA <span className="text-accent">COMUNIDAD</span>
          </h2>
          <p className="text-background/70 mt-4 mb-8">
            Suscríbete y recibe ofertas exclusivas, lanzamientos anticipados 
            y un 15% de descuento en tu primera compra.
          </p>

          {/* Form */}
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-6 py-4 bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:border-accent transition-colors"
            />
            <Button variant="accent" size="xl" type="submit">
              Suscribir
            </Button>
          </form>

          <p className="text-background/50 text-xs mt-4">
            Al suscribirte aceptas nuestra política de privacidad
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
