import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  FileText, 
  AlertTriangle, 
  Scale, 
  Clock, 
  Ban, 
  CreditCard, 
  ShieldCheck, 
  Eye, 
  Gavel,
  ChevronRight,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections = [
  { id: "aceptacion", title: "Aceptación de Términos", icon: Scale, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "descripcion", title: "Descripción del Servicio", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "propiedad", title: "Propiedad Intelectual", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "privacidad", title: "Privacidad y Datos", icon: Eye, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "planes", title: "Planes y Suscripciones", icon: CreditCard, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "prohibido", title: "Usos Prohibidos", icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "responsabilidad", title: "Limitación de Responsabilidad", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "terminacion", title: "Terminación y Modificaciones", icon: Clock, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: "ley", title: "Ley Aplicable", icon: Gavel, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

const Terms = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Documentación Legal</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight"
            >
              Términos de <span className="gradient-text">Servicio</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Última actualización: 26 de Abril, 2024. Estos términos regulan el uso de nuestra plataforma y servicios.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-32 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-4">Contenido</p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
                  >
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                    <span className="flex-1 text-left">{section.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:col-span-9 space-y-16">
              <section id="aceptacion" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-bold">1. Aceptación de Términos</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p className="text-lg leading-relaxed">
                    Al acceder y utilizar <span className="text-foreground font-semibold text-primary">Asenting Dashboard</span>, usted acepta estar legalmente vinculado por estos términos y condiciones. Este es un contrato vinculante entre usted y Asenting.
                  </p>
                  <p>
                    Si está utilizando el Servicio en nombre de una organización, usted acepta estos Términos para esa organización y declara que tiene la autoridad para vincular a esa organización a estos términos. En tal caso, "usted" y "su" se referirán a esa organización.
                  </p>
                  <div className="bg-muted/50 border-l-4 border-primary p-4 rounded-r-xl mt-6">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm italic">
                        Nos reservamos el derecho de actualizar estos términos en cualquier momento. El uso continuado de la plataforma después de dichos cambios constituye su aceptación de los nuevos Términos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="descripcion" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-500" />
                  </div>
                  <h2 className="text-3xl font-bold">2. Descripción del Servicio</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>Asenting proporciona una plataforma de gestión empresarial integral que incluye, de manera no limitativa:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 mt-6">
                    {[
                      "Gestión avanzada de inventario y almacenes",
                      "Seguimiento de ventas y métricas en tiempo real",
                      "Herramientas de CRM y gestión de clientes",
                      "Sistema de facturación y pagos integrados",
                      "Dashboard analítico con IA",
                      "API para desarrolladores e integraciones"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="propiedad" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold">3. Propiedad Intelectual</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>
                    Todo el contenido, características y funcionalidad (incluyendo pero no limitado a toda la información, software, texto, pantallas, imágenes, video y audio, y el diseño, selección y disposición de los mismos) son propiedad de Asenting, sus licenciantes u otros proveedores de dicho material.
                  </p>
                  <p>
                    Usted no debe reproducir, distribuir, modificar, crear trabajos derivados, mostrar públicamente, ejecutar públicamente, republicar, descargar, almacenar o transmitir cualquier material de nuestro Servicio, excepto según lo permitido expresamente por estos Términos.
                  </p>
                </div>
              </section>

              <section id="privacidad" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-3xl font-bold">4. Privacidad y Datos</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>
                    Su privacidad es extremadamente importante para nosotros. El uso de Asenting también se rige por nuestra <a href="/privacidad" className="text-primary underline font-medium">Política de Privacidad</a>.
                  </p>
                  <p>
                    Usted conserva todos los derechos de propiedad sobre los datos que carga en el Servicio. Sin embargo, al cargarlos, nos otorga una licencia mundial, no exclusiva y libre de regalías para usar, alojar, almacenar, reproducir y modificar dichos datos con el único propósito de proporcionarle el Servicio.
                  </p>
                </div>
              </section>

              <section id="planes" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-pink-500" />
                  </div>
                  <h2 className="text-3xl font-bold">5. Planes y Suscripciones</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>
                    Ofrecemos diversos planes de suscripción (Mensual, Anual y Enterprise). Los precios están sujetos a cambios con previo aviso de 30 días.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="glass-card p-6 rounded-2xl border-border/50">
                      <h4 className="font-bold text-foreground mb-2">Facturación</h4>
                      <p className="text-sm">Se le facturará por adelantado de forma recurrente y periódica. Su suscripción se renovará automáticamente a menos que la cancele.</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-border/50">
                      <h4 className="font-bold text-foreground mb-2">Cancelaciones</h4>
                      <p className="text-sm">Puede cancelar su suscripción en cualquier momento. La cancelación entrará en vigor al final del periodo de facturación actual.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="prohibido" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <Ban className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold">6. Usos Prohibidos</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>Usted se compromete a no utilizar el Servicio para:</p>
                  <ul className="space-y-3 mt-4">
                    {[
                      "Cualquier propósito ilegal o que infrinja leyes locales o internacionales",
                      "Explotar, dañar o intentar explotar o dañar a menores de cualquier manera",
                      "Transmitir cualquier material publicitario o promocional, incluyendo 'spam' o 'correo basura'",
                      "Suplantar o intentar suplantar a Asenting, a un empleado o a cualquier otro usuario",
                      "Participar en cualquier conducta que restrinja o inhiba el uso o disfrute del Servicio"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="responsabilidad" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-bold">7. Limitación de Responsabilidad</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>
                    EL SERVICIO SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD". ASENTING RENUNCIA A TODAS LAS GARANTÍAS, EXPRESAS O IMPLÍCITAS, INCLUYENDO LAS GARANTÍAS DE COMERCIABILIDAD E IDONEIDAD PARA UN PROPÓSITO PARTICULAR.
                  </p>
                  <p>
                    En ningún caso Asenting será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos o uso.
                  </p>
                </div>
              </section>

              <section id="ley" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Gavel className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h2 className="text-3xl font-bold">8. Ley Aplicable</h2>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
                  <p>
                    Estos Términos se regirán e interpretarán de acuerdo con las leyes vigentes, sin tener en cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa que surja bajo estos Términos se resolverá exclusivamente en los tribunales competentes.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;

