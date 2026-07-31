'use client'
import { useState } from 'react'

const MAX_CHARS = 600

export default function QuestionForm({ room }) {
  const [content, setContent] = useState('')
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [count, setCount]     = useState(room.message_count)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || status === 'loading') return

    setStatus('loading')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), roomId: room.id }),
      })

      if (!res.ok) throw new Error()

      setCount(c => c + 1)
      setContent('')
      setStatus('success')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm">
          {/* Círculo con checkmark animado */}
          <div className="animate-scale-in w-28 h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="animate-fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Enviada!</h2>
            <p className="text-gray-500 mb-1">Tu pregunta fue enviada correctamente</p>
            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full mb-8">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Enviada de forma anónima
            </div>

            <button
              onClick={() => setStatus('idle')}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 rounded-2xl text-lg transition"
            >
              Enviar otra pregunta
            </button>

            <p className="text-gray-400 text-sm mt-5">
              <span className="text-amber-500 font-bold text-base">{count}</span>{' '}
              {count === 1 ? 'pregunta enviada' : 'preguntas enviadas'} en esta sala
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulario principal ───────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Encabezado */}
      <div className="pt-10 pb-4 px-5 text-center">
        <p className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-1.5">
          Escuela Sabática
        </p>
        <h1 className="text-2xl font-bold text-gray-800 leading-snug">
          {room.name}
        </h1>
      </div>

      {/* Formulario */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Textarea grande */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Escribe tu pregunta o comentario aquí..."
                maxLength={MAX_CHARS}
                rows={7}
                className="w-full p-5 text-gray-800 text-base resize-none focus:outline-none leading-relaxed"
                autoFocus
              />
              <div className="px-5 pb-3 flex justify-between items-center">
                <span className="text-xs text-gray-300">
                  Completamente anónimo 🔒
                </span>
                <span className={`text-xs ${content.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-300'}`}>
                  {content.length}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {/* Error */}
            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">
                Ocurrió un error. Por favor intenta de nuevo.
              </p>
            )}

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={!content.trim() || status === 'loading'}
              className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-5 rounded-2xl text-xl disabled:opacity-40 transition shadow-sm"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar pregunta'
              )}
            </button>
          </form>

          {/* Contador */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Preguntas enviadas hasta ahora
            </p>
            <p className="text-4xl font-bold text-amber-500 mt-1">{count}</p>
          </div>

          <p className="text-center text-gray-300 text-xs mt-4">
            No se guarda ningún dato personal · Solo el texto de tu pregunta
          </p>
        </div>
      </div>
    </div>
  )
}
