import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Cookie, Settings, BarChart3, Shield, ToggleRight } from "lucide-react";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Cookie className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Política de Cookies</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Política de <span className="gradient-text">Cookies</span>
            </h1>
            <p className="text-muted-foreground">Última actualización: Diciembre 2024</p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">¿Qué son las Cookies?</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
                  Nos ayudan a mejorar tu experiencia recordando tus preferencias y proporcionando funcionalidades esenciales.
                </p>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Cookies que Utilizamos</h2>
              </div>
              <div className="text-muted-foreground space-y-6">
                <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies Esenciales</h3>
                  <p>Necesarias para el funcionamiento básico del dashboard. Incluyen cookies de sesión y autenticación JWT.</p>
                </div>
                <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies de Preferencias</h3>
                  <p>Guardan tus preferencias de tema (oscuro/claro), idioma y configuración del panel.</p>
                </div>
                <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies Analíticas</h3>
                  <p>Nos ayudan a entender cómo usas el dashboard para mejorar la experiencia.</p>
                </div>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Cookies de Terceros</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>Utilizamos servicios de terceros que pueden establecer sus propias cookies:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Google Analytics:</strong> Para analizar el tráfico y comportamiento de usuarios</li>
                  <li><strong>Stripe:</strong> Para procesar pagos de forma segura</li>
                  <li><strong>Intercom:</strong> Para proporcionar soporte al cliente</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Duración de las Cookies</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <h3 className="font-semibold text-foreground mb-2">Cookies de Sesión</h3>
                    <p>Se eliminan al cerrar el navegador</p>
                  </div>
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <h3 className="font-semibold text-foreground mb-2">Cookies Persistentes</h3>
                    <p>Permanecen hasta 1 año o hasta que las elimines</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ToggleRight className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Gestionar tus Cookies</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>Puedes controlar y eliminar las cookies de varias formas:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Configuración del navegador: la mayoría de navegadores permiten bloquear o eliminar cookies</li>
                  <li>Panel de configuración: dentro de Localix puedes ajustar tus preferencias de cookies</li>
                  <li>Herramientas de terceros: extensiones de navegador para gestión de privacidad</li>
                </ul>
                <p className="text-sm mt-4">
                  Nota: Deshabilitar ciertas cookies puede afectar la funcionalidad del dashboard.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
