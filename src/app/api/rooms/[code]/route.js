import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/rooms/[code] — obtener info de una sala por código (público, para la página de preguntas)
export async function GET(request, { params }) {
  const { code } = await params

  const { data, error } = await supabaseAdmin
    .from('rooms')
    .select('id, name, code, message_count, is_active')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  return NextResponse.json(data)
}
