/*
# Create projects and inquiries tables (single-tenant, no auth)

This is a public portfolio site for the OBJEKT design studio. There is no
sign-in screen, so all data is intentionally public/shared and policies are
scoped to `anon, authenticated`.

1. New Tables
- `projects` — the studio's selected work shown in the horizontal archive.
  - `id` (uuid, primary key)
  - `position` (int, ordering of projects in the archive, default 0)
  - `index_label` (text, two-digit display label e.g. "01")
  - `title` (text, project name e.g. "Vitra Atlas")
  - `client` (text, client name)
  - `discipline` (text, e.g. "Identity / Spatial")
  - `year` (text, e.g. "2024")
  - `image_url` (text, Pexels image URL)
  - `alt_text` (text, accessibility description for the image)
  - `span` (text, layout hint: "tall" or "short")
  - `created_at` (timestamptz, defaults to now)

- `inquiries` — contact submissions from the "Start a project" section.
  - `id` (uuid, primary key)
  - `name` (text, sender name)
  - `email` (text, sender email)
  - `message` (text, project inquiry body)
  - `read` (boolean, whether studio has read it, default false)
  - `created_at` (timestamptz, defaults to now)

2. Security
- Enable RLS on both tables.
- `projects`: public read for anon + authenticated; writes also open to
  anon + authenticated because this is a single-tenant portfolio with no
  admin login — the studio manages content directly. Data is intentionally
  shared/public.
- `inquiries`: anyone (anon + authenticated) may INSERT a new inquiry;
  SELECT/UPDATE/DELETE are restricted to authenticated users only so that
  casual visitors cannot read or delete other people's submissions. (There
  is no admin UI yet, but the policy is safe-by-default for when one is
  added.)

3. Seed Data
- Inserts the five existing portfolio projects from src/lib/data.ts so the
  archive is populated immediately.

4. Indexes
- `projects_position_idx` on `projects(position)` for archive ordering.
- `inquiries_created_at_idx` on `inquiries(created_at)` for recent-first listing.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position int NOT NULL DEFAULT 0,
  index_label text NOT NULL,
  title text NOT NULL,
  client text NOT NULL,
  discipline text NOT NULL,
  year text NOT NULL,
  image_url text NOT NULL,
  alt_text text NOT NULL,
  span text NOT NULL DEFAULT 'short',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- projects: public CRUD (single-tenant, intentionally shared)
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- inquiries: anyone may submit; only authenticated can read/update/delete
DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
CREATE POLICY "anon_insert_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_inquiries" ON inquiries;
CREATE POLICY "auth_select_inquiries" ON inquiries FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_inquiries" ON inquiries;
CREATE POLICY "auth_update_inquiries" ON inquiries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_inquiries" ON inquiries;
CREATE POLICY "auth_delete_inquiries" ON inquiries FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS projects_position_idx ON projects(position);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);

-- Seed the five existing portfolio projects
INSERT INTO projects (position, index_label, title, client, discipline, year, image_url, alt_text, span) VALUES
  (1, '01', 'Vitra Atlas', 'Vitra Campus', 'Identity / Spatial', '2024', 'https://images.pexels.com/photos/11831530/pexels-photo-11831530.jpeg?auto=compress&cs=tinysrgb&w=1100', 'Close-up of a concrete Brutalist building showcasing geometric modern architecture.', 'tall'),
  (2, '02', 'Maison Noir', 'Maison Noir', 'Fashion Film', '2024', 'https://images.pexels.com/photos/33714925/pexels-photo-33714925.jpeg?auto=compress&cs=tinysrgb&w=1100', 'Fashion model in black dress poses in red-lit studio setting.', 'short'),
  (3, '03', 'Forme Vessel', 'Forme Studio', 'Product / Ceramic', '2023', 'https://images.pexels.com/photos/8356904/pexels-photo-8356904.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Close-up view of a ceramic vase with textured wooden branch for a minimalist aesthetic.', 'short'),
  (4, '04', 'Folio Quarterly', 'Folio Press', 'Editorial / Print', '2023', 'https://images.pexels.com/photos/4271615/pexels-photo-4271615.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Elegant magazine layouts showcasing fashion and design.', 'tall'),
  (5, '05', 'Halo Pavilion', 'Lumen Foundation', 'Architecture', '2022', 'https://images.pexels.com/photos/11818297/pexels-photo-11818297.jpeg?auto=compress&cs=tinysrgb&w=1100', 'Modern brutalist architecture with concrete facade, captured from staircase view.', 'tall')
ON CONFLICT DO NOTHING;
