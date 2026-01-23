import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, Store, MapPin, User, Lock } from 'lucide-react';
import { useCart } from "@/contexts/CartContext";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { buildApiUrl, getPublicParams } from "@/lib/api";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('home');
  const [mpPublicKey, setMpPublicKey] = useState('TEST-5256646b-e09e-4b4b-81aa-861357c6453f');
  const [shippingCostVal, setShippingCostVal] = useState(15000);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(300000);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryNotes: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { items, totalPrice } = useCart();
  
  const subtotal = totalPrice;
  const deliveryCost = deliveryMethod === 'home' ? ((freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) ? 0 : shippingCostVal) : 0;
  const total = subtotal + deliveryCost;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = getPublicParams();
        const [payRes, setRes] = await Promise.all([
          fetch(buildApiUrl('webconfig/public/payments/') + params),
          fetch(buildApiUrl('webconfig/public/settings/') + params)
        ]);

        if (payRes.ok) {
          const data = await payRes.json();
          const mp = data.find((p: any) => p.provider === 'mercadopago' && p.active);
          if (mp && mp.extra_config && mp.extra_config.public_key) {
            setMpPublicKey(mp.extra_config.public_key);
          }
        }

        if (setRes.ok) {
          const settings = await setRes.json();
          if (settings.shipping_cost !== undefined) setShippingCostVal(Number(settings.shipping_cost));
          if (settings.free_shipping_threshold !== undefined) setFreeShippingThreshold(Number(settings.free_shipping_threshold));
          if (settings.pickup_enabled !== undefined) {
             setPickupEnabled(!!settings.pickup_enabled);
             if (!settings.pickup_enabled && deliveryMethod === 'pickup') {
               setDeliveryMethod('home');
             }
          }
        }
      } catch (error) {
        console.error('Error fetching configuration:', error);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (mpPublicKey) {
      initMercadoPago(mpPublicKey, { locale: 'es-CO' });
    }
  }, [mpPublicKey]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email inválido';
      case 'phone':
        return /^[0-9]{10,}$/.test(value.replace(/\s/g, '')) ? '' : 'Teléfono inválido';
      default:
        return value.trim() ? '' : 'Campo requerido';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // El envío se maneja a través del componente Payment de Mercado Pago
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Completa tu información para procesar el pedido</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Principal - Formulario */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Método de Pago - Diseño claro */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Medios de pago
                  </h2>
                  
                  {mpPublicKey ? (
                    <div className="mercadopago-container">
                      <Payment
                        initialization={{ amount: total }}
                        onSubmit={async (param) => {
                          // Validar que los datos de contacto estén completos antes de procesar
                          const requiredFields = ['fullName', 'phone', 'email'];
                          if (deliveryMethod === 'home') {
                            requiredFields.push('address', 'city', 'postalCode');
                          }
                          
                          const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
                          
                          if (missingFields.length > 0) {
                             // Scroll to contact form
                             const contactForm = document.getElementById('contact-info');
                             if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
                             
                             alert('Por favor completa tu información de contacto y entrega antes de realizar el pago.');
                             return Promise.reject(); // Detener proceso de pago
                          }

                          try {
                            setIsProcessing(true);
                            // Construir URL con parámetros públicos (site/aid)
                            const queryParams = getPublicParams().replace('?', '&');
                            const url = buildApiUrl('sales/public/payment/') + '?' + queryParams;
                            
                            const payload = {
                                items: items.map(i => ({
                                    name: i.title, // Note: Burbuja uses 'title' in products but 'name' in cart items? Check CartItem interface
                                    quantity: i.quantity,
                                    price: i.price
                                })),
                                total_amount: total,
                                customer: formData,
                                payment_data: param,
                                site: getPublicParams().includes('site=') ? getPublicParams().split('site=')[1].split('&')[0] : undefined
                            };
                            
                            const response = await fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(payload)
                            });
                            
                            const data = await response.json();
                            
                            if (response.ok && (data.status === 'approved' || data.status === 'in_process')) {
                                alert(`¡Pago ${data.status === 'approved' ? 'aprobado' : 'en proceso'}! ID: ${data.id}`);
                                // Aquí se podría redirigir a una página de éxito
                            } else {
                                alert('Error en el pago: ' + (data.detail || data.error || 'Desconocido'));
                                console.error('Payment Error:', data);
                            }
                          } catch (error) {
                              console.error('Connection Error:', error);
                              alert('Error de conexión al procesar el pago');
                          } finally {
                              setIsProcessing(false);
                          }
                        }}
                        customization={{
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
                                  theme: 'default', // Tema claro
                              }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">Cargando pasarela de pagos...</div>
                  )}
                  
                  <p className="text-center text-xs text-gray-500 mt-6">
                      Al completar la compra, aceptas nuestros términos y condiciones.
                  </p>
              </div>

              {/* Información de Contacto */}
              <Card id="contact-info">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Nombre completo" 
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={errors.fullName ? 'border-red-500' : ''}
                        required 
                      />
                      {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Input 
                        placeholder="Teléfono" 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                        required 
                      />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Input 
                      placeholder="Correo electrónico" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                      required 
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Método de Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Método de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-4">
                    <div className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${deliveryMethod === 'home' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                      <RadioGroupItem value="home" id="home" className="text-blue-600 border-blue-600" />
                      <label htmlFor="home" className="flex-1 cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className={`w-5 h-5 ${deliveryMethod === 'home' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <p className={`font-medium ${deliveryMethod === 'home' ? 'text-blue-900' : 'text-gray-700'}`}>Envío a domicilio</p>
                            <p className="text-sm text-gray-500">Entrega en 24-48h</p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? <span className="text-green-600">Gratis</span> : formatPrice(shippingCostVal)}
                        </span>
                      </label>
                    </div>
                    
                    {pickupEnabled && (
                    <div className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                      <RadioGroupItem value="pickup" id="pickup" className="text-blue-600 border-blue-600" />
                      <label htmlFor="pickup" className="flex-1 cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Store className={`w-5 h-5 ${deliveryMethod === 'pickup' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <p className={`font-medium ${deliveryMethod === 'pickup' ? 'text-blue-900' : 'text-gray-700'}`}>Recogida en tienda</p>
                            <p className="text-sm text-gray-500">Gratis</p>
                          </div>
                        </div>
                        <span className="text-green-600 font-medium">Gratis</span>
                      </label>
                    </div>
                    )}
                  </RadioGroup>

                  {deliveryMethod === 'home' && (
                    <div className="mt-6 space-y-4 pl-8 border-l-2 border-blue-100 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <MapPin className="w-4 h-4" />
                        Dirección de entrega
                      </div>
                      <Input 
                        placeholder="Dirección completa" 
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required 
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          placeholder="Ciudad" 
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required 
                        />
                        <Input 
                          placeholder="Código postal" 
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          required 
                        />
                      </div>
                      <Textarea 
                        placeholder="Instrucciones de entrega (opcional)" 
                        value={formData.deliveryNotes}
                        onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumen del Pedido - Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24 border-gray-200 shadow-sm">
                <CardHeader className="bg-white border-b border-gray-100">
                  <CardTitle className="text-gray-900">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.color}`} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                           <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                        </div>
                        <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío:</span>
                      <span className={deliveryCost === 0 ? 'text-green-600' : ''}>
                        {deliveryCost === 0 ? 'Gratis' : formatPrice(deliveryCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between font-bold text-lg border-t pt-3 mt-2">
                      <span>Total:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-md flex items-center gap-2 mt-4">
                    <Lock className="w-3 h-3" />
                    Pago seguro y encriptado
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
