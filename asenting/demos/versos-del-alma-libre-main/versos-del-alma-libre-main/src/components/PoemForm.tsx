
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PenLine, FileImage } from 'lucide-react';

// Esquema de validación para el formulario
const formSchema = z.object({
  title: z.string().min(3, {
    message: 'El título debe tener al menos 3 caracteres.',
  }),
  author: z.string().min(2, {
    message: 'El nombre del autor debe tener al menos 2 caracteres.',
  }),
  content: z.string().min(20, {
    message: 'El poema debe tener al menos 20 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor ingresa un email válido.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const PoemForm = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      content: '',
      email: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    console.log('Datos del formulario:', data);
    
    // Aquí podrías enviar los datos a una API o base de datos
    // Por ahora, simplemente mostraremos un mensaje de éxito
    toast.success('¡Tu poema ha sido enviado con éxito!', {
      description: 'Gracias por compartir tu creatividad.',
    });
    
    form.reset();
    setPreviewImage(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-700 font-lora">Título del Poema</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ingresa el título de tu poema" 
                  className="border-amber-200 focus-visible:ring-amber-500 font-lora" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-700 font-lora">Autor</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Tu nombre o seudónimo" 
                  className="border-amber-200 focus-visible:ring-amber-500 font-lora" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-700 font-lora">Contenido del Poema</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Escribe aquí tu poema..." 
                  className="min-h-[200px] border-amber-200 focus-visible:ring-amber-500 font-lora" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-amber-600 font-lora">
                Puedes usar saltos de línea para dar formato a tu poema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel className="text-amber-700 font-lora">Imagen para tu poema</FormLabel>
          <div className="border-2 border-dashed border-amber-200 rounded-md p-4 text-center hover:bg-amber-50 transition cursor-pointer">
            <input 
              type="file" 
              id="image" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
              <FileImage className="h-8 w-8 text-amber-500 mb-2" />
              <span className="font-lora text-amber-700">
                {previewImage ? 'Cambiar imagen' : 'Selecciona una imagen'}
              </span>
            </label>
          </div>
          {previewImage && (
            <div className="mt-3 rounded-md overflow-hidden">
              <img src={previewImage} alt="Vista previa" className="max-h-40 mx-auto" />
            </div>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-700 font-lora">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="tu@email.com" 
                  className="border-amber-200 focus-visible:ring-amber-500 font-lora" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-amber-600 font-lora">
                Solo se usará para contactarte si tu poema es seleccionado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-amber-600 hover:bg-amber-700 transition-colors"
        >
          <PenLine className="h-4 w-4 mr-2" />
          Publicar Poema
        </Button>
      </form>
    </Form>
  );
};

export default PoemForm;
