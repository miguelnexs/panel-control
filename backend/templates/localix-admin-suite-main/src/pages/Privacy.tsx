import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Política de Privacidad</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Tu <span className="gradient-text">privacidad</span> es importante
            </h1>
            <p className="text-muted-foreground">Última actualización: Diciembre 2024</p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Información que Recopilamos</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>En Localix, recopilamos la siguiente información para proporcionar nuestros servicios:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Información de cuenta: nombre, correo electrónico y contraseña encriptada</li>
                  <li>Datos de uso: métricas de navegación y uso del dashboard</li>
                  <li>Información del negocio: datos de productos, clientes y ventas que gestiones</li>
                  <li>Datos técnicos: dirección IP, tipo de navegador y dispositivo</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Cómo Usamos tu Información</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>Utilizamos la información recopilada para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                  <li>Personalizar tu experiencia en el dashboard</li>
                  <li>Enviar notificaciones importantes sobre tu cuenta</li>
                  <li>Generar estadísticas y métricas de tu negocio</li>
                  <li>Detectar y prevenir actividades fraudulentas</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Protección de Datos</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>Implementamos medidas de seguridad robustas:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                  <li>Autenticación JWT con tokens seguros</li>
                  <li>Almacenamiento encriptado de contraseñas</li>
                  <li>Copias de seguridad regulares de datos</li>
                  <li>Acceso restringido a información sensible</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold">Tus Derechos</h2>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>Como usuario, tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceder a tus datos personales en cualquier momento</li>
                  <li>Solicitar la corrección de información incorrecta</li>
                  <li>Eliminar tu cuenta y todos los datos asociados</li>
                  <li>Exportar tus datos en formato legible</li>
                  <li>Revocar el consentimiento para el procesamiento de datos</li>
                </ul>
              </div>
            </section>

            <section className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Contacto</h2>
              </div>
              <p className="text-muted-foreground">
                Si tienes preguntas sobre nuestra política de privacidad o deseas ejercer tus derechos, 
                contáctanos en <a href="mailto:privacidad@localix.app" className="text-primary hover:underline">privacidad@localix.app</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
