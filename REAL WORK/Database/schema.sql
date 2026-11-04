-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABEL PROFILES & AUTHENTICATION
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  role text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth_users(id) ON DELETE CASCADE,
  refresh_token text UNIQUE NOT NULL,
  user_agent text,
  ip_address text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. TABEL GAMES & LIBRARY GAME
-- ==========================================
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  developer text,
  publisher text,
  release_date date,
  cover_url text,
  platforms text[],
  genres text[],
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_library (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  status text,
  rating int2,
  is_favorite boolean DEFAULT false,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);

CREATE TABLE IF NOT EXISTS game_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  rating int2 NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_game_review UNIQUE (user_id, game_id)
);

-- ==========================================
-- 4. TABEL MOVIES & LIBRARY FILM
-- ==========================================
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  synopsis text,
  director text,
  cast_members text[],
  release_year int4,
  duration_minutes int4,
  poster_url text,
  genres text[],
  rating_age text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movie_library (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  status text,
  personal_rating int2,
  is_favorite boolean DEFAULT false,
  watched_at timestamptz,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS movie_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  rating int2 NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_movie_review UNIQUE (user_id, movie_id)
);

-- ==========================================
-- 5. APPLICATION API SUPPORT
-- ==========================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS community_rating numeric(3, 1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price numeric(12, 2),
  ADD COLUMN IF NOT EXISTS technical_details jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS community_rating numeric(3, 1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS api_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  user_agent text,
  ip_address inet,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_sessions_user_id_idx ON api_sessions(user_id);
CREATE INDEX IF NOT EXISTS api_sessions_expires_at_idx ON api_sessions(expires_at);
CREATE INDEX IF NOT EXISTS games_published_rating_idx
  ON games(is_published, community_rating DESC);
CREATE INDEX IF NOT EXISTS movies_published_rating_idx
  ON movies(is_published, community_rating DESC);

-- Catalog entries used by the current frontend. Images remain external URLs.
INSERT INTO games (
  title, slug, description, developer, publisher, release_date, cover_url,
  platforms, genres, is_published, community_rating, price, technical_details
) VALUES
  (
    'Persona 3 Reload', 'persona-3-reload',
    'Persona 3 Reload adalah pembuatan ulang modern dari RPG Persona 3.',
    'Atlus', 'Atlus', '2024-02-02',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    ARRAY['PC', 'PlayStation 4', 'PlayStation 5', 'Xbox'], ARRAY['RPG'],
    true, 9.8, 173700,
    '{"engine":"Unreal Engine 4","languages":["Inggris","Indonesia","Jepang"]}'::jsonb
  ),
  (
    'Persona 5 Royal', 'persona-5-royal',
    'Persona 5 Royal adalah RPG dengan cerita dan karakter yang penuh gaya.',
    'Atlus', 'Atlus', '2020-03-31',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&auto=format&fit=crop',
    ARRAY['PC', 'PlayStation 4', 'PlayStation 5', 'Xbox', 'Nintendo Switch'], ARRAY['RPG'],
    true, 9.6, NULL, '{}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  developer = EXCLUDED.developer,
  publisher = EXCLUDED.publisher,
  release_date = EXCLUDED.release_date,
  cover_url = EXCLUDED.cover_url,
  platforms = EXCLUDED.platforms,
  genres = EXCLUDED.genres,
  is_published = EXCLUDED.is_published,
  community_rating = EXCLUDED.community_rating,
  price = EXCLUDED.price,
  technical_details = EXCLUDED.technical_details;

INSERT INTO movies (
  title, slug, synopsis, director, release_year, duration_minutes, poster_url,
  genres, rating_age, is_published, community_rating
) VALUES
  (
    'I Want to Eat Your Pancreas', 'i-want-to-eat-your-pancreas',
    'Kisah persahabatan yang mengubah cara pandang tentang hidup.',
    'Shinichiro Ushijima', 2018, 108,
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop',
    ARRAY['Drama', 'Romance'], 'PG-13', true, 9.4
  ),
  (
    'Avengers: Doomsday', 'avengers-doomsday',
    'Film mendatang dari Marvel Studios.',
    'Russo Brothers', 2026, NULL,
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop',
    ARRAY['Action', 'Adventure'], 'TBA', true, 0
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  synopsis = EXCLUDED.synopsis,
  director = EXCLUDED.director,
  release_year = EXCLUDED.release_year,
  duration_minutes = EXCLUDED.duration_minutes,
  poster_url = EXCLUDED.poster_url,
  genres = EXCLUDED.genres,
  rating_age = EXCLUDED.rating_age,
  is_published = EXCLUDED.is_published,
  community_rating = EXCLUDED.community_rating;