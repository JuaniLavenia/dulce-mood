// Single source of truth for DulceMood contact data.
export const business = {
  name: 'DulceMood',
  city: 'San Miguel de Tucumán',
  // TODO: replace with DulceMood's real number before publishing.
  whatsapp: '+5493810000000',
};

// wa.me only accepts digits (no "+", spaces or dashes).
export const whatsappLink = (message?: string) =>
  `https://wa.me/${business.whatsapp.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
