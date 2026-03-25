import fs from 'fs';
import path from 'path';
import type { Program } from './programTypes';

const DATA_FILE = path.join(process.cwd(), '.programme-data.json');

const DEFAULT_PROGRAM: Program = {
  id: 'bloc1-hybride',
  name: 'Bloc 1 — Hybride Force / Cardio / Callisthénie',
  frequency: '7j/7',
  focus: 'Force + Sèche',
  weeks: 4,
  currentWeek: 1,
  days: [
    {
      id: 'd1',
      day: 'Lundi',
      shortDay: 'Lun',
      type: 'push',
      label: 'Upper A — Force',
      color: '#4C9FFF',
      exercises: [
        { id: 'e1', name: 'Bench haltères FORCE', sets: '2×4 → 2×2 | RPE 7-8 → 8.5', rest: '3-5min' },
        { id: 'e2', name: 'Bench halt levier back-off', sets: '1×6-8 ou 2×3 | RPE 6-7', rest: 'enchaîné' },
        { id: 'e3', name: 'Band pull-apart (activation)', sets: '3×15 | bande légère', rest: '45s' },
        { id: 'e4', name: 'Scapular pull-ups (activation)', sets: '2×10 | PDC', rest: '45s' },
        { id: 'e5', name: 'Tractions pronation FORCE — TEMPO 2-1-X-0', sets: '2×4-5 → 2×2-3 | RPE 7 → 8.5', rest: '3-5min | Coudes → hanches, charge réduite' },
        { id: 'e6', name: 'Trac levier back-off', sets: '1×6-8 | RPE 6-7', rest: 'enchaîné' },
        { id: 'e7', name: 'Forearms dégressif rack', sets: '15→10→5 kg | jusqu\'à échec', rest: 'fin séance' },
        { id: 'e8', name: 'Extension poignet poulie', sets: '2×15 | léger', rest: '60s' },
      ],
    },
    {
      id: 'd2',
      day: 'Mardi',
      shortDay: 'Mar',
      type: 'cardio',
      label: 'Run Z2',
      color: '#EF4444',
      exercises: [
        { id: 'e9', name: 'Course Z2', sets: '25-40 min', rest: 'matin à jeun ou soir' },
        { id: 'e10', name: 'Allure cible', sets: '6:00-6:30 → 5:40-5:50 /km', rest: 'Z2 — conversation possible' },
      ],
    },
    {
      id: 'd3',
      day: 'Mercredi',
      shortDay: 'Mer',
      type: 'legs',
      label: 'Lower — Technique',
      color: '#F59E0B',
      exercises: [
        { id: 'e11', name: 'Mobilité chevilles (échauff.)', sets: '2×10/côté | wall ankle stretch + goblet squat pause', rest: 'échauffement' },
        { id: 'e12', name: 'Back Squat TECHNIQUE', sets: '2×4-5 → 2×3 | RPE 7 → 8.5', rest: '3-5min | TALONS PLANTÉS, charge réduite exprès' },
        { id: 'e13', name: 'Squat levier back-off', sets: '1×6-8 | RPE 6-7', rest: 'enchaîné' },
        { id: 'e14', name: 'Pendulum squat', sets: '2-3×10-12 | RPE 7-8', rest: '2min' },
        { id: 'e15', name: 'RDL belt squat', sets: '2×5-6 | RPE 7-8', rest: '2-3min' },
        { id: 'e16', name: 'Leg curl', sets: '2-3×10-12 | RPE 7-8', rest: '90s' },
      ],
    },
    {
      id: 'd4',
      day: 'Jeudi',
      shortDay: 'Jeu',
      type: 'full',
      label: 'Upper B — Volume',
      color: '#1DB954',
      exercises: [
        { id: 'e17', name: 'Dips VOLUME', sets: '2×8 → 2×5 | RPE 7-8 → 8', rest: '2-3min' },
        { id: 'e18', name: 'Dips levier dégressif', sets: '1×15-20 → 1×3 tempo', rest: 'enchaîné' },
        { id: 'e19', name: 'Bench barre VOLUME', sets: '2×6 | RPE 7-8 → 8', rest: '2-3min' },
        { id: 'e20', name: 'Trac supination anneaux VOLUME — TEMPO 2-1-X-0', sets: '4×6-8 | RPE 7-8', rest: '2-3min' },
        { id: 'e21', name: 'OHP haltères VOLUME', sets: '2-3×8-10 | RPE 7-8', rest: '2min' },
        { id: 'e22', name: 'Forearms moto', sets: '2-3× | 10-11 kg', rest: '90s' },
      ],
    },
    {
      id: 'd5',
      day: 'Vendredi',
      shortDay: 'Ven',
      type: 'cardio',
      label: 'Run Fractionné',
      color: '#EF4444',
      exercises: [
        { id: 'e23', name: 'Fractionné Z4-Z5', sets: '6×1\' → 8×1\'30 effort / 1\' récup', rest: 'PAS à jeun — collation avant' },
        { id: 'e24', name: 'Allure effort', sets: '4:30-4:50 /km | récup marche/jogging', rest: 'S4 : Z2 léger 25-30min' },
      ],
    },
    {
      id: 'd6',
      day: 'Samedi',
      shortDay: 'Sam',
      type: 'push',
      label: 'Upper C — Force + Cali',
      color: '#9C27B0',
      exercises: [
        { id: 'e25', name: 'Dips FORCE', sets: '2×3 → 2×2-3 | RPE 7-8 → 8.5', rest: '3-5min' },
        { id: 'e26', name: 'Dips levier back-off / top single', sets: '1×5 → 1×1', rest: 'enchaîné' },
        { id: 'e27', name: 'OHP barre FORCE', sets: '2×5 → 2×3 | RPE 7-8 → 8.5', rest: '3-4min' },
        { id: 'e28', name: 'OHP levier back-off', sets: '1×6-8', rest: 'enchaîné' },
        { id: 'e29', name: 'HSP pompes mur', sets: '3×8-10 → 3×12-15', rest: '2min' },
        { id: 'e30', name: 'Handstand libre', sets: '8-12 essais', rest: '1min' },
        { id: 'e31', name: 'Planche tuck (RÉTRO BASSIN)', sets: '4×5-8s → 4×8-12s', rest: '90s' },
        { id: 'e32', name: 'Front lever tuck hold', sets: '3×10-15s → 4×15-20s', rest: '90s' },
        { id: 'e33', name: 'L-sit parallettes', sets: '3×15-20s → 4×20-25s', rest: '60s' },
      ],
    },
    {
      id: 'd7',
      day: 'Dimanche',
      shortDay: 'Dim',
      type: 'full',
      label: 'Renfo + Conditioning',
      color: '#FF6B35',
      exercises: [
        { id: 'e34', name: 'Curl barre strict', sets: '2×8+dég → 3×5-6+dég | RPE 7-8', rest: '2min' },
        { id: 'e35', name: 'Curl marteau', sets: '2×10+dég → 3×8-10+dég', rest: '90s' },
        { id: 'e36', name: 'Triceps OH', sets: '2×10+dég → 3×8-12+dég', rest: '90s' },
        { id: 'e37', name: 'Row unilatéral', sets: '3×10 | RPE 7-8', rest: '2min' },
        { id: 'e38', name: 'Pompes lestées', sets: '3×10-12 → 3×12-15 | +10→+15 kg', rest: '2min' },
        { id: 'e39', name: 'EMOM 16-24 min (4-6 tours)', sets: 'Thrusters ×8-10 / Tractions PDC ×5-7 / KB Swing ×12-15', rest: '4-6 tours' },
        { id: 'e40', name: 'Gainage + abdos', sets: 'Bug 3×8/c + Gainage lat. 2-3×30s/c', rest: 'fin séance' },
      ],
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
