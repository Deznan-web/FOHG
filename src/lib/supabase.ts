import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProductStatus = 'available' | 'upcoming' | 'lab';

export type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string;
  category: string;
  status: ProductStatus;
  size_options: string[];
  drop_date: string | null;
  position: number;
  created_at: string;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  location: string;
  city: string;
  country: string;
  total_cents: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
  created_at: string;
};
export function normalizeImageUrl(url: string | null | undefined): string {
  const placeholder = import.meta.env.BASE_URL + 'images/WhatsApp_Image_2026-08-05_at_12.32.10.jpeg';
  if (!url) return placeholder;

  const base = import.meta.env.BASE_URL || '/';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith(base)) {
    return url;
  }

  if (url.startsWith('/')) {
    return base + url.slice(1);
  }

  return base + url;
}
export function formatPrice(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
