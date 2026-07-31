import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function isAdmin() {
  const store = await cookies()
  return store.get('admin_session')?.value === 'authenticated'
}

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

// DELETE /api/rooms/[code] — eliminar una sala y todas sus preguntas (solo admin)
// Las preguntas se borran en cascada por el FOREIGN KEY ON DELETE CASCADE
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { code } = await params

  const { error } = await supabaseAdmin
    .from('rooms')
    .delete()
    .eq('code', code.toUpperCase())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
