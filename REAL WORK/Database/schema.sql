-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABEL PROFILES & AUTHENTICATION
-- ==========================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  role text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE auth_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_sessions (
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
CREATE TABLE games (
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

CREATE TABLE game_library (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  status text,
  rating int2,
  is_favorite boolean DEFAULT false,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);

CREATE TABLE game_reviews (
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
CREATE TABLE movies (
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

CREATE TABLE movie_library (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  status text,
  personal_rating int2,
  is_favorite boolean DEFAULT false,
  watched_at timestamptz,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE movie_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  rating int2 NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_movie_review UNIQUE (user_id, movie_id)
);
