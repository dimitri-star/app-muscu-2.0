export interface ProgramExercise {
  id: string;
  name: string;
  sets: string; // e.g. "4×6"
  rest: string; // e.g. "3min"
}

export type DayType = 'push' | 'pull' | 'legs' | 'rest' | 'cardio' | 'full';

export interface ProgramDay {
  id: string;
  day: string;      // "Lundi"
  shortDay: string; // "Lun"
  type: DayType;
  label: string;    // "Push — Poitrine & Épaules"
  color: string;    // hex
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  frequency: string;   // "6j/7"
  focus: string;       // "Prise de masse"
  weeks: number;
  currentWeek: number;
  days: ProgramDay[];
}
