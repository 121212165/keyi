import { NextResponse } from 'next/server'
import { THERAPY_MODES } from '@/lib/therapy-modes'

export async function GET() {
  return NextResponse.json({
    modes: THERAPY_MODES.map(({ id, name, shortName, tagline, description, icon, color, gradient, features, welcome }) => ({
      id,
      name,
      shortName,
      tagline,
      description,
      icon,
      color,
      gradient,
      features,
      welcome,
    })),
  })
}
