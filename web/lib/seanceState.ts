import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".seances-data.json");

export interface SavedSeanceExercise {
  name: string;
  sets: { reps: number; weight: number; done: boolean }[];
  notes?: string;
}

export interface SavedSeance {
  id: string;
  name: string;
  date: string; // ISO "2026-03-25"
  duration: number; // minutes
  totalVolume: number; // kg
  totalSets: number;
  source: "mobile" | "web" | "programme";
  rpeMax?: number | null;
  notes?: string;
  sessionMeta?: {
    tags?: string[];
    effortRating?: number;
    energyRating?: number;
    moodRating?: number;
    sleepHours?: string;
    sleepQuality?: number;
    morningEnergy?: number;
    soreness?: number;
    visibility?: "Tout le monde" | "Amis" | "Prive";
  } | null;
  exercises: SavedSeanceExercise[];
}

export function getSeances(): SavedSeance[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveSeance(seance: SavedSeance): void {
  const existing = getSeances();
  // Deduplicate by id
  const filtered = existing.filter((s) => s.id !== seance.id);
  const updated = [seance, ...filtered]; // newest first
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
}
