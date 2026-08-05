/*
# FOHG — Products, Orders, and Order Items

Creates the core e-commerce schema for the FOHG clothing brand. This is a
single-tenant storefront with an admin login, so products are public-read
but orders are protected.

1. New Tables
- `products`
  - `id` (uuid, PK)
  - `name` (text, product name)
  - `description` (text, product description)
  - `price_cents` (int, price in cents — e.g. 4500 = $45.00)
  - `currency` (text, ISO code, default 'usd')
  - `image_url` (text, product image URL)
  - `category` (text, e.g. 'Tops', 'Bottoms', 'Outerwear', 'Accessories')
  - `status` (text, 'available' | 'upcoming' | 'lab' — controls which page it appears on)
  - `size_options` (text[], available sizes, e.g. ['S','M','L','XL'])
  - `drop_date` (date, nullable — set for 'upcoming' items)
  - `position` (int, display order, default 0)
  - `created_at` (timestamptz)

- `orders`
  - `id` (uuid, PK)
  - `order_number` (text, human-readable order number, e.g. 'FOHG-0001')
  - `customer_name` (text)
  - `customer_email` (text)
  - `customer_phone` (text, nullable)
  - `location` (text, shipping address / location)
  - `city` (text)
  - `country` (text)
  - `total_cents` (int, total in cents)
  - `currency` (text, default 'usd')
  - `status` (text, 'pending' | 'paid' | 'shipped' | 'cancelled')
  - `stripe_session_id` (text, nullable — populated after Stripe checkout)
  - `notes` (text, nullable — customer notes)
  - `created_at` (timestamptz)

- `order_items`
  - `id` (uuid, PK)
  - `order_id` (uuid, FK → orders ON DELETE CASCADE)
  - `product_id` (uuid, FK → products ON DELETE SET NULL)
  - `product_name` (text, snapshot at order time)
  - `size` (text, selected size)
  - `quantity` (int)
  - `unit_price_cents` (int, snapshot at order time)

2. Security
- `products`: public SELECT for anon + authenticated (storefront must read
  products without login). INSERT/UPDATE/DELETE restricted to authenticated
  (admin only).
- `orders`: INSERT open to anon + authenticated (customers place orders
  without login). SELECT/UPDATE restricted to authenticated (admin only).
  DELETE disabled entirely — orders are never hard-deleted.
- `order_items`: INSERT open to anon + authenticated (created with the
  order). SELECT restricted to authenticated (admin only). UPDATE/DELETE
  disabled — order items are immutable once placed.

3. Seed Data
- 12 products across available / upcoming / lab statuses with real Pexels
  imagery.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'Apparel',
  status text NOT NULL DEFAULT 'available',
  size_options text[] NOT NULL DEFAULT '{}',
  drop_date date,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_status_check CHECK (status IN ('available', 'upcoming', 'lab'))
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  location text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  total_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  size text NOT NULL DEFAULT '',
  quantity int NOT NULL DEFAULT 1,
  unit_price_cents int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- products: public read, admin write
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- orders: anyone may create; admin may read/update
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_orders" ON orders;
CREATE POLICY "auth_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- order_items: anyone may create with order; admin may read
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_order_items" ON order_items;
CREATE POLICY "auth_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS products_position_idx ON products(position);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- Seed: available products
INSERT INTO products (position, name, description, price_cents, currency, image_url, category, status, size_options) VALUES
  (1, 'Heavyweight Tee — Bone', '320gsm organic cotton. Boxy fit. Garment-dyed in small batches.', 6500, 'usd', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=900', 'Tops', 'available', ARRAY['S','M','L','XL']),
  (2, 'Heavyweight Tee — Clay', '320gsm organic cotton. Boxy fit. Earth-pigment dyed.', 6500, 'usd', 'https://images.pexels.com/photos/8217425/pexels-photo-8217425.jpeg?auto=compress&cs=tinysrgb&w=900', 'Tops', 'available', ARRAY['S','M','L','XL']),
  (3, 'Field Pant — Stone', 'Wide-leg cotton twill. Drawcord waist. Two cargo pockets.', 12000, 'usd', 'https://images.pexels.com/photos/1192315/pexels-photo-1192315.jpeg?auto=compress&cs=tinysrgb&w=900', 'Bottoms', 'available', ARRAY['28','30','32','34','36']),
  (4, 'Field Pant — Ink', 'Wide-leg cotton twill. Drawcord waist. Overdyed black.', 12000, 'usd', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=900', 'Bottoms', 'available', ARRAY['28','30','32','34','36']),
  (5, 'Wax Canvas Tote', 'Hand-waxed 18oz canvas. Leather strap handles. Made to age.', 8500, 'usd', 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=900', 'Accessories', 'available', ARRAY['One Size']),
  (6, 'Ribbed Knit Beanie', 'Merino wool rib knit. Folded cuff. Made in Portugal.', 4500, 'usd', 'https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg?auto=compress&cs=tinysrgb&w=900', 'Accessories', 'available', ARRAY['One Size']),
  (7, 'Oversized Hoodie — Ash', '500gsm brushed-back fleece. Dropped shoulder. Raw hem.', 13500, 'usd', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=900', 'Tops', 'available', ARRAY['S','M','L','XL']),
  (8, 'Oversized Hoodie — Moss', '500gsm brushed-back fleece. Dropped shoulder. Plant-dyed.', 13500, 'usd', 'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=900', 'Tops', 'available', ARRAY['S','M','L','XL'])
ON CONFLICT DO NOTHING;

-- Seed: upcoming products
INSERT INTO products (position, name, description, price_cents, currency, image_url, category, status, size_options, drop_date) VALUES
  (1, 'Suede Field Jacket', 'French lambskin suede. Four-pocket safari silhouette. Lined.', 38000, 'usd', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=900', 'Outerwear', 'upcoming', ARRAY['S','M','L','XL'], '2026-09-15'),
  (2, 'Cashmere Crew — Bone', 'Mongolian cashmere 3-ply. Ribbed cuffs. Slim fit.', 22000, 'usd', 'https://images.pexels.com/photos/8217425/pexels-photo-8217425.jpeg?auto=compress&cs=tinysrgb&w=900', 'Tops', 'upcoming', ARRAY['S','M','L','XL'], '2026-10-01'),
  (3, 'Selvedge Denim — Indigo', '14oz Japanese selvedge. Straight leg. Raw. Will fade beautifully.', 18000, 'usd', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=900', 'Bottoms', 'upcoming', ARRAY['28','30','32','34','36'], '2026-10-20')
ON CONFLICT DO NOTHING;

-- Seed: lab products (ideas in progress)
INSERT INTO products (position, name, description, price_cents, currency, image_url, category, status, size_options) VALUES
  (1, 'Prototype 01 — Felted Wool Vest', 'Boiled wool vest. Prototype stage. Exploring closure systems.', 0, 'usd', 'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=900', 'Outerwear', 'lab', ARRAY['M','L']),
  (2, 'Prototype 02 — Dyed Linen Shirt', 'Hand-dyed Portuguese linen. Testing natural pigment load.', 0, 'usd', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=900', 'Tops', 'lab', ARRAY['S','M','L']),
  (3, 'Prototype 03 — Canvas Crossbody', 'Waxed canvas crossbody. Hardware sourcing in progress.', 0, 'usd', 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=900', 'Accessories', 'lab', ARRAY['One Size'])
ON CONFLICT DO NOTHING;
