import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const systemPrompt = `Tu es FitTrack AI, un coach expert en musculation et nutrition.
  Tu analyses les données d'entraînement et fournis des conseils personnalisés.
  Réponds toujours en français.

  Contexte utilisateur (données mockées pour la démo):
  - Utilisateur: Dimitri, 25 ans, 82kg, objectif: prise de masse
  - Programme actuel: PPL (Push/Pull/Legs)
  - Semaine actuelle: 4 séances réalisées, volume total: 12,450 kg
  - PR: Bench 120kg, Squat 140kg, Deadlift 160kg
  - Macros moy: 2180 kcal, 142g prot, 210g glucides, 52g lipides
  `;

  const messages = [
    ...history,
    { role: 'user' as const, content: message }
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  return NextResponse.json({
    response: response.content[0].type === 'text' ? response.content[0].text : ''
  });
}
