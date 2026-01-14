import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { toast } from 'sonner';
import { Check, ShieldCheck, Lock, CreditCard } from "lucide-react";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Hook for navigation
  const planCode = searchParams.get('plan') || '';
  const planPrice = parseInt(searchParams.get('price') || '0');
  const planName = searchParams.get('name') || '';

  // Handle Mercado Pago redirect return
  const collectionStatus = searchParams.get('collection_status');
  const status = searchParams.get('status');

  useEffect(() => {
    if (collectionStatus === 'approved' || status === 'approved') {
        toast.success("Pago exitoso. Redirigiendo al dashboard...");
        setTimeout(() => {
            navigate('/download');
        }, 2000);
    } else if (collectionStatus === 'rejected' || status === 'rejected') {
        toast.error("El pago fue rechazado. Por favor intenta nuevamente.");
    } else if (collectionStatus === 'pending' || status === 'pending') {
        toast.info("El pago está en proceso.");
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        toast.error("Debes iniciar sesión para realizar el pago");
        navigate('/auth');
    }

    // Use hardcoded key to force update if env var is stuck
    // VITE_MERCADOPAGO_PUBLIC_KEY=TEST-5256646b-e09e-4b4b-81aa-861357c6453f
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "TEST-5256646b-e09e-4b4b-81aa-861357c6453f";
    
    initMercadoPago(publicKey, {
        locale: 'es-CO'
    });
    console.log("MP Public Key cargada:", publicKey);
  }, []);

  const initialization = {
    amount: planPrice,
  };

  const customization = {
    paymentMethods: {
      ticket: ['efecty'],
      bankTransfer: ['pse'],
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
      maxInstallments: 12,
      minInstallments: 1
    },
    visual: {
        style: {
            theme: 'dark', // Changed back to dark for better UI integration
        }
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise((resolve, reject) => {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No se encontró sesión activa");
        navigate('/auth');
        reject();
        return;
      }

      fetch(`${API_BASE}/users/api/payments/process-payment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            ...formData,
            plan_code: planCode
        }),
      })
        .then((response) => {
            if (response.status === 401) {
                toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate('/auth');
                // @ts-ignore
                reject();
                return null;
            }
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Error en el procesamiento');
                });
            }
            return response.json();
        })
        .then((data) => {
            if (!data) return; // Handled above (401)

            if (data.status === 'approved') {
                 toast.success("Pago aprobado exitosamente");
                 // @ts-ignore
                 resolve();
                 setTimeout(() => {
                     window.location.href = "/download";
                 }, 1500);
             } else if (data.status === 'pending' || data.status === 'in_process') {
                 if (data.redirect_url) {
                     toast.success("Redirigiendo a su banco para completar el pago...");
                     // @ts-ignore
                     resolve();
                     // Redirigir en la misma ventana para mejor compatibilidad móvil con apps bancarias
                     window.location.href = data.redirect_url;
                 } else if (data.ticket_url) {
                     toast.success("Ticket de pago generado. Abriendo...");
                     // @ts-ignore
                     resolve();
                     // Abrir el ticket en una nueva pestaña
                     window.open(data.ticket_url, '_blank');
                 } else {
                     toast.success("Pago en proceso. Recibirás un correo con los detalles.");
                     // @ts-ignore
                     resolve();
                 }
             } else {
                 toast.error("Pago rechazado o no completado");
                 // @ts-ignore
                 reject();
             }
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.message || "Error procesando el pago");
          // @ts-ignore
          reject();
        });
    });
  };

  if (!planCode || planPrice === 0) {
      return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <p className="mb-4">Plan inválido o no seleccionado.</p>
                <a href="/precios" className="text-primary hover:underline">Volver a precios</a>
            </div>
            <Footer />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 container px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Plan Details & Branding */}
            <div className="space-y-8 animate-fade-right">
                <div className="glass-card p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            Suscripción Mensual
                        </span>
                        <h1 className="text-3xl font-bold mb-2">Plan {planName}</h1>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold gradient-text">${planPrice.toLocaleString('es-CO')}</span>
                            <span className="text-muted-foreground">/mes</span>
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-border/50 pt-6">
                        <h3 className="font-semibold text-lg">Lo que estás adquiriendo:</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <div className="bg-primary/20 p-1 rounded-full text-primary">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span>Acceso inmediato al Dashboard</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <div className="bg-primary/20 p-1 rounded-full text-primary">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span>Soporte prioritario incluido</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <div className="bg-primary/20 p-1 rounded-full text-primary">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span>Cancelación en cualquier momento</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <div className="bg-primary/20 p-1 rounded-full text-primary">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span>Actualizaciones automáticas</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 text-muted-foreground text-sm px-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Pago 100% Seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <span>Encriptación SSL</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span>Mercado Pago</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="animate-fade-left">
                <div className="glass-card p-6 sm:p-8 rounded-2xl border border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Datos de Pago
                    </h2>
                    
                    <Payment
                        initialization={initialization}
                        customization={customization}
                        onSubmit={onSubmit}
                    />
                    
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Al completar la compra, aceptas nuestros términos y condiciones.
                    </p>
                </div>
            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPage;
