-- FitTrack Pro Supabase setup
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL DEFAULT 'Dimitri',
  age INT DEFAULT 22,
  taille_cm INT DEFAULT 163,
  poids_kg DECIMAL(5,1) DEFAULT 66.5,
  poids_objectif DECIMAL(5,1) DEFAULT 66.0,
  bf_estime TEXT DEFAULT '12-13%',
  calories_cible INT DEFAULT 2200,
  proteines_cible INT DEFAULT 140,
  lipides_cible INT DEFAULT 60,
  glucides_cible INT DEFAULT 275,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  duree_min INT,
  volume_total DECIMAL(10,1),
  rpe_max DECIMAL(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercice TEXT NOT NULL,
  format TEXT,
  charge_cible TEXT,
  charge_reelle TEXT,
  reps_reelles TEXT,
  rpe_reel DECIMAL(3,1),
  notes TEXT,
  ordre INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercice TEXT NOT NULL,
  groupe TEXT NOT NULL,
  poids DECIMAL(6,1) NOT NULL,
  reps INT NOT NULL DEFAULT 1,
  rpe DECIMAL(3,1),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  semaine INT NOT NULL,
  jour TEXT NOT NULL,
  date DATE NOT NULL,
  poids DECIMAL(5,1),
  calories INT,
  proteines INT,
  eau DECIMAL(3,1),
  sommeil DECIMAL(3,1),
  energie INT,
  training_ok BOOLEAN,
  run_km DECIMAL(4,1),
  rpe_max DECIMAL(3,1),
  douleurs INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(semaine, jour)
);

CREATE TABLE IF NOT EXISTS grocery_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categorie TEXT NOT NULL,
  article TEXT NOT NULL,
  quantite TEXT,
  checked BOOLEAN DEFAULT FALSE,
  ordre INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programmes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programme_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_key TEXT NOT NULL UNIQUE,
  note_value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes_custom (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
