
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Truck, Store, MapPin, User, Mail, Phone, Lock, Calendar, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CheckoutForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('home');
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
  const [errors, setErrors] = useState({
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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { items, getTotalPrice } = useCart();
  
  const subtotal = getTotalPrice();
  const deliveryCost = deliveryMethod === 'home' ? (subtotal >= 300 ? 0 : 15) : 0;
  const total = subtotal + deliveryCost;

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email inválido';
      case 'phone':
        return /^[0-9]{10,}$/.test(value.replace(/\s/g, '')) ? '' : 'Teléfono inválido';
      case 'cardNumber':
        return /^[0-9]{16}$/.test(value.replace(/\s/g, '')) ? '' : 'Número de tarjeta inválido';
      case 'expiryDate':
        return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value) ? '' : 'Formato MM/AA';
      case 'cvv':
        return /^[0-9]{3,4}$/.test(value) ? '' : 'CVV inválido';
      default:
        return value.trim() ? '' : 'Campo requerido';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      alert('¡Pedido procesado con éxito!');
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light text-neutral-900 mb-3">Finalizar Compra</h1>
        <div className="w-24 h-1 bg-neutral-900 mx-auto mb-4"></div>
        <p className="text-neutral-600 text-lg">Completa tu información para procesar el pedido</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Información de Contacto */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-neutral-100 rounded-full">
                    <User className="w-5 h-5 text-neutral-700" />
                  </div>
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input 
                      placeholder="Nombre completo" 
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`pl-10 h-12 ${errors.fullName ? 'border-red-500' : 'border-neutral-200'} focus:border-neutral-900 transition-colors`}
                      required 
                    />
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-4" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div className="relative">
                    <Input 
                      placeholder="Teléfono" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`pl-10 h-12 ${errors.phone ? 'border-red-500' : 'border-neutral-200'} focus:border-neutral-900 transition-colors`}
                      required 
                    />
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-4" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="relative">
                  <Input 
                    placeholder="Correo electrónico" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? 'border-red-500' : 'border-neutral-200'} focus:border-neutral-900 transition-colors`}
                    required 
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-4" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Método de Entrega */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-neutral-100 rounded-full">
                    <Truck className="w-5 h-5 text-neutral-700" />
                  </div>
                  Método de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-4">
                  <div className={`relative flex items-center space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    deliveryMethod === 'home' 
                      ? 'border-neutral-900 bg-neutral-50 shadow-md' 
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-25'
                  }`}>
                    <RadioGroupItem value="home" id="home" className="border-2" />
                    <div className="flex-1">
                      <label htmlFor="home" className="flex items-center gap-4 cursor-pointer">
                        <div className={`p-3 rounded-lg transition-colors ${
                          deliveryMethod === 'home' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Envío a domicilio</p>
                          <p className="text-neutral-600">
                            {subtotal >= 300 ? (
                              <span className="text-green-600 font-medium">Gratis</span>
                            ) : (
                              <span>€15</span>
                            )} - Entrega en 24-48h
                          </p>
                        </div>
                      </label>
                    </div>
                    {deliveryMethod === 'home' && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-neutral-900" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`relative flex items-center space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    deliveryMethod === 'pickup' 
                      ? 'border-neutral-900 bg-neutral-50 shadow-md' 
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-25'
                  }`}>
                    <RadioGroupItem value="pickup" id="pickup" className="border-2" />
                    <div className="flex-1">
                      <label htmlFor="pickup" className="flex items-center gap-4 cursor-pointer">
                        <div className={`p-3 rounded-lg transition-colors ${
                          deliveryMethod === 'pickup' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <Store className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Recogida en tienda</p>
                          <p className="text-green-600 font-medium">Gratis - Pereira, Carrera 7 #17-45</p>
                        </div>
                      </label>
                    </div>
                    {deliveryMethod === 'pickup' && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-neutral-900" />
                      </div>
                    )}
                  </div>
                </RadioGroup>

                {deliveryMethod === 'home' && (
                  <div className="mt-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4 animate-fade-in">
                    <h4 className="font-semibold text-neutral-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Dirección de entrega
                    </h4>
                    <Input 
                      placeholder="Dirección completa" 
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="h-12 border-neutral-200 focus:border-neutral-900"
                      required 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        placeholder="Ciudad" 
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="h-12 border-neutral-200 focus:border-neutral-900"
                        required 
                      />
                      <Input 
                        placeholder="Código postal" 
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="h-12 border-neutral-200 focus:border-neutral-900"
                        required 
                      />
                    </div>
                    <Textarea 
                      placeholder="Instrucciones de entrega (opcional)" 
                      rows={3}
                      value={formData.deliveryNotes}
                      onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                      className="border-neutral-200 focus:border-neutral-900 resize-none"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Método de Pago */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-neutral-100 rounded-full">
                    <CreditCard className="w-5 h-5 text-neutral-700" />
                  </div>
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className={`relative flex items-center space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'card' 
                      ? 'border-neutral-900 bg-neutral-50 shadow-md' 
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-25'
                  }`}>
                    <RadioGroupItem value="card" id="card" className="border-2" />
                    <div className="flex-1">
                      <label htmlFor="card" className="flex items-center gap-4 cursor-pointer">
                        <div className={`p-3 rounded-lg transition-colors ${
                          paymentMethod === 'card' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Tarjeta de crédito/débito</p>
                          <p className="text-neutral-600">Visa, Mastercard, American Express</p>
                        </div>
                      </label>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-neutral-900" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`relative flex items-center space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'cash' 
                      ? 'border-neutral-900 bg-neutral-50 shadow-md' 
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-25'
                  }`}>
                    <RadioGroupItem value="cash" id="cash" className="border-2" />
                    <div className="flex-1">
                      <label htmlFor="cash" className="flex items-center gap-4 cursor-pointer">
                        <div className={`p-3 rounded-lg transition-colors ${
                          paymentMethod === 'cash' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <div className="w-6 h-6 border-2 border-current rounded bg-current/10 flex items-center justify-center">
                            <span className="text-sm font-bold">€</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Pago contra entrega</p>
                          <p className="text-neutral-600">Efectivo al recibir el pedido</p>
                        </div>
                      </label>
                    </div>
                    {paymentMethod === 'cash' && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-neutral-900" />
                      </div>
                    )}
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200 space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Información segura y encriptada</span>
                    </div>
                    
                    <div className="relative">
                      <Input 
                        placeholder="Número de tarjeta" 
                        value={formatCardNumber(formData.cardNumber)}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                        maxLength={19}
                        className={`pl-10 h-12 ${errors.cardNumber ? 'border-red-500' : 'border-neutral-300'} focus:border-neutral-900 transition-colors font-mono tracking-wider`}
                        required 
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-4" />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Input 
                          placeholder="MM/AA" 
                          value={formatExpiryDate(formData.expiryDate)}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          maxLength={5}
                          className={`pl-10 h-12 ${errors.expiryDate ? 'border-red-500' : 'border-neutral-300'} focus:border-neutral-900 transition-colors font-mono`}
                          required 
                        />
                        <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-4" />
                        {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                      </div>
                      
                      <div className="relative">
                        <Input 
                          placeholder="CVV" 
                          type="password"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          maxLength={4}
                          className={`pl-10 h-12 ${errors.cvv ? 'border-red-500' : 'border-neutral-300'} focus:border-neutral-900 transition-colors font-mono`}
                          required 
                        />
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-4" />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                    
                    <Input 
                      placeholder="Nombre en la tarjeta" 
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      className="h-12 border-neutral-300 focus:border-neutral-900 transition-colors"
                      required 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Pedido - Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-t-lg">
                <CardTitle className="text-xl font-light">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-neutral-300">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute -top-2 -right-2 bg-neutral-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-neutral-900 truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500 mb-1">{item.color}</p>
                        <p className="text-sm font-semibold text-neutral-900">€{(item.priceNumber * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-medium">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Envío:</span>
                    <span className={`font-medium ${deliveryCost === 0 ? 'text-green-600' : ''}`}>
                      {deliveryCost === 0 ? 'Gratis' : `€${deliveryCost.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal >= 300 && deliveryMethod === 'home' && (
                    <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 animate-pulse">
                      🎉 ¡Envío gratuito aplicado!
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-3 text-neutral-900">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-14 text-lg font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Procesando...
                    </div>
                  ) : (
                    <>
                      {paymentMethod === 'card' ? '💳 Pagar Ahora' : '✅ Confirmar Pedido'}
                    </>
                  )}
                </Button>

                <div className="text-xs text-neutral-500 text-center space-y-1 mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>Información segura y encriptada</span>
                  </div>
                  <p>Política de devoluciones de 30 días</p>
                  <p>Soporte 24/7 disponible</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
