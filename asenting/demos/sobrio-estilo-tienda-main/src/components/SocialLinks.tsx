
import React from 'react';
import { Instagram, Facebook, Phone, Mail, MessageCircle } from 'lucide-react';

interface SocialLinksProps {
  variant?: 'header' | 'footer' | 'contact';
  className?: string;
}

const SocialLinks = ({ variant = 'header', className = '' }: SocialLinksProps) => {
  const socialData = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/cgcarogonzalez',
      color: 'hover:text-pink-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/cgcarogonzalez',
      color: 'hover:text-blue-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/573001234567',
      color: 'hover:text-green-500'
    },
    {
      name: 'Teléfono',
      icon: Phone,
      url: 'tel:+573001234567',
      color: 'hover:text-blue-500'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:contacto@cgcarogonzalez.com',
      color: 'hover:text-red-500'
    }
  ];

  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return 'flex space-x-4';
      case 'contact':
        return 'grid grid-cols-5 gap-4';
      default:
        return 'flex space-x-3';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'contact':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {socialData.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 ${social.color} transition-all duration-200 hover:scale-110`}
          aria-label={social.name}
        >
          <social.icon className={getIconSize()} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
