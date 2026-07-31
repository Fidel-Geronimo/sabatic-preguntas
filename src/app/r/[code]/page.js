import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import QuestionForm from './QuestionForm'

export async function generateMetadata({ params }) {
  const { code } = await params
  const { data } = await supabaseAdmin
    .from('rooms')
    .select('name')
    .eq('code', code.toUpperCase())
    .single()

  return {
    title: data?.name ?? 'Preguntas Anónimas',
  }
}

export default async function RoomPage({ params }) {
  const { code } = await params

  const { data: room, error } = await supabaseAdmin
    .from('rooms')
    .select('id, name, code, message_count, is_active')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !room) notFound()

  if (!room.is_active) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Sala cerrada</h2>
          <p className="text-gray-400 text-sm">Esta sala ya no está aceptando preguntas.</p>
        </div>
      </div>
    )
  }

  return <QuestionForm room={room} />
}
