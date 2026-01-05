import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { FileText, AlertTriangle, Scale, Clock, Ban, CreditCard } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Términos y Condiciones</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Términos de <span className="gradient-text">Servicio</span>
            </h1>
            <p className="text-muted-foreground">Última actualización: Diciembre 2024</p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Aceptación de Términos</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Al acceder y utilizar Localix Dashboard, aceptas estar legalmente vinculado por estos términos y condiciones. 
                  Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
                </p>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación.
                </p>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Descripción del Servicio</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>Localix proporciona una plataforma de dashboard administrativo que incluye:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gestión de productos, categorías y clientes</li>
                  <li>Seguimiento de ventas y pedidos en tiempo real</li>
                  <li>Métricas y estadísticas de negocio</li>
                  <li>Sistema de notificaciones automáticas</li>
                  <li>Integración con sistemas backend</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Planes y Pagos</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Localix ofrece diferentes planes de suscripción. Al suscribirte a un plan de pago:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los pagos se procesan de forma segura a través de proveedores certificados</li>
                  <li>Las suscripciones se renuevan automáticamente al final de cada período</li>
                  <li>Puedes cancelar tu suscripción en cualquier momento desde tu cuenta</li>
                  <li>No se realizan reembolsos por períodos parciales</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Uso Prohibido</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>No está permitido utilizar Localix para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Actividades ilegales o fraudulentas</li>
                  <li>Violar derechos de propiedad intelectual de terceros</li>
                  <li>Distribuir malware o código malicioso</li>
                  <li>Intentar acceder a cuentas de otros usuarios</li>
                  <li>Sobrecargar o interferir con nuestros servidores</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Limitación de Responsabilidad</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Localix se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>El servicio estará disponible de forma ininterrumpida</li>
                  <li>El servicio estará libre de errores o defectos</li>
                  <li>Los resultados obtenidos serán precisos o confiables</li>
                </ul>
                <p>
                  En ningún caso seremos responsables por daños indirectos, incidentales o consecuentes 
                  derivados del uso del servicio.
                </p>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Terminación</h2>
              </div>
              <p className="text-muted-foreground">
                Podemos suspender o terminar tu acceso al servicio en cualquier momento si violas estos términos. 
                También puedes cancelar tu cuenta en cualquier momento contactándonos en{" "}
                <a href="mailto:soporte@localix.app" className="text-primary hover:underline">soporte@localix.app</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
