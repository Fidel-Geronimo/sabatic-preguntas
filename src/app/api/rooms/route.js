import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function isAdmin() {
  const store = await cookies()
  return store.get('admin_session')?.value === 'authenticated'
}

// Genera un código de sala corto (6 chars alfanumérico, sin ambiguos)
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// GET /api/rooms — listar todas las salas (solo admin)
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/rooms — crear nueva sala (solo admin)
export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { name } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  // Intentar hasta 3 veces en caso de colisión de código único
  for (let i = 0; i < 3; i++) {
    const code = generateCode()
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .insert({ name: name.trim(), code })
      .select()
      .single()

    if (!error) return NextResponse.json(data, { status: 201 })
    if (!error.message.includes('unique')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Error generando código único' }, { status: 500 })
}
