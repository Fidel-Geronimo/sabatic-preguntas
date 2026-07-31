import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function isAdmin() {
  const store = await cookies()
  return store.get('admin_session')?.value === 'authenticated'
}

// GET /api/messages?roomId=xxx — listar mensajes de una sala (solo admin)
export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: 'roomId es requerido' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('id, content, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/messages — enviar una pregunta anónima (público)
export async function POST(request) {
  const { content, roomId } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 })
  }

  if (!roomId) {
    return NextResponse.json({ error: 'roomId es requerido' }, { status: 400 })
  }

  // Verificar que la sala existe y está activa
  const { data: room, error: roomError } = await supabaseAdmin
    .from('rooms')
    .select('id, is_active')
    .eq('id', roomId)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  if (!room.is_active) {
    return NextResponse.json({ error: 'Esta sala ya no está activa' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({ content: content.trim(), room_id: roomId })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
