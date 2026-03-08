import fs from 'fs';
import path from 'path';
import type { Program } from './programTypes';

const DATA_FILE = path.join(process.cwd(), '.programme-data.json');

const DEFAULT_PROGRAM: Program = {
  id: 'ppl-1',
  name: 'PPL — Force & Hypertrophie',
  frequency: '6j/7',
  focus: 'Prise de masse',
  weeks: 8,
  currentWeek: 5,
  days: [
    {
      id: 'd1',
      day: 'Lundi',
      shortDay: 'Lun',
      type: 'push',
      label: 'Push — Poitrine & Épaules',
      color: '#4C9FFF',
      exercises: [
        { id: 'de1', name: 'Développé couché', sets: '4×5', rest: '3min' },
        { id: 'de2', name: 'Press épaules', sets: '3×8', rest: '2min' },
        { id: 'de3', name: 'Développé incliné', sets: '3×10', rest: '2min' },
        { id: 'de4', name: 'Écarté câble', sets: '3×12', rest: '90s' },
        { id: 'de5', name: 'Pushdown', sets: '3×15', rest: '60s' },
      ],
    },
    {
      id: 'd2',
      day: 'Mardi',
      shortDay: 'Mar',
      type: 'pull',
      label: 'Pull — Dos & Biceps',
      color: '#1DB954',
      exercises: [
        { id: 'de6', name: 'Tractions lestées', sets: '4×6', rest: '3min' },
        { id: 'de7', name: 'Rowing barre', sets: '4×6', rest: '2min30' },
        { id: 'de8', name: 'Lat pulldown', sets: '3×10', rest: '2min' },
        { id: 'de9', name: 'Rowing câble', sets: '3×12', rest: '90s' },
        { id: 'de10', name: 'Curl barre', sets: '3×10', rest: '90s' },
      ],
    },
    {
      id: 'd3',
      day: 'Mercredi',
      shortDay: 'Mer',
      type: 'legs',
      label: 'Legs — Quadriceps',
      color: '#F59E0B',
      exercises: [
        { id: 'de11', name: 'Squat', sets: '4×5', rest: '4min' },
        { id: 'de12', name: 'Leg press', sets: '3×10', rest: '3min' },
        { id: 'de13', name: 'Romanian DL', sets: '3×8', rest: '2min30' },
        { id: 'de14', name: 'Leg curl', sets: '3×12', rest: '90s' },
        { id: 'de15', name: 'Calf raise', sets: '4×15', rest: '60s' },
      ],
    },
    {
      id: 'd4',
      day: 'Jeudi',
      shortDay: 'Jeu',
      type: 'push',
      label: 'Push — Épaules & Triceps',
      color: '#4C9FFF',
      exercises: [
        { id: 'de16', name: 'Press incliné', sets: '4×8', rest: '2min30' },
        { id: 'de17', name: 'Développé haltères', sets: '3×10', rest: '2min' },
        { id: 'de18', name: 'Élévations lat', sets: '4×15', rest: '60s' },
        { id: 'de19', name: 'Écarté haltères', sets: '3×12', rest: '90s' },
        { id: 'de20', name: 'Extension triceps', sets: '3×12', rest: '60s' },
      ],
    },
    {
      id: 'd5',
      day: 'Vendredi',
      shortDay: 'Ven',
      type: 'pull',
      label: 'Pull — Dos & Biceps',
      color: '#1DB954',
      exercises: [
        { id: 'de21', name: 'Deadlift', sets: '4×4', rest: '4min' },
        { id: 'de22', name: 'Rowing unilatéral', sets: '3×10', rest: '2min' },
        { id: 'de23', name: 'Face pulls', sets: '3×15', rest: '60s' },
        { id: 'de24', name: 'Curl marteau', sets: '3×12', rest: '90s' },
        { id: 'de25', name: 'Curl concentré', sets: '2×15', rest: '60s' },
      ],
    },
    {
      id: 'd6',
      day: 'Samedi',
      shortDay: 'Sam',
      type: 'legs',
      label: 'Legs — Ischio & Mollets',
      color: '#F59E0B',
      exercises: [
        { id: 'de26', name: 'Front squat', sets: '4×6', rest: '3min' },
        { id: 'de27', name: 'Fentes marchées', sets: '3×10', rest: '2min' },
        { id: 'de28', name: 'Good morning', sets: '3×10', rest: '2min' },
        { id: 'de29', name: 'Leg extension', sets: '3×15', rest: '60s' },
        { id: 'de30', name: 'Abdos', sets: '3×20', rest: '45s' },
      ],
    },
    {
      id: 'd7',
      day: 'Dimanche',
      shortDay: 'Dim',
      type: 'rest',
      label: 'Repos complet',
      color: '#6B7280',
      exercises: [],
    },
  ],
};

export function getProgram(): Program {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as Program;
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROGRAM;
}

export function saveProgram(program: Program): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(program, null, 2), 'utf-8');
}
