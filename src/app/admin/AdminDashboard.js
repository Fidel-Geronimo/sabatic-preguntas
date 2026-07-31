'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Vistas posibles: 'rooms' | 'create' | 'detail'
export default function AdminDashboard() {
  const [view, setView]               = useState('rooms')
  const [rooms, setRooms]             = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [roomName, setRoomName]       = useState('')
  const [creating, setCreating]       = useState(false)
  const [createdRoom, setCreatedRoom] = useState(null)
  const [copied, setCopied]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // código de la sala a confirmar
  const [deleting, setDeleting]       = useState(false)
  const router = useRouter()

  const loadRooms = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/rooms')
    const data = await res.json()
    setRooms(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  const loadMessages = useCallback(async (roomId) => {
    setLoading(true)
    const res = await fetch(`/api/messages?roomId=${roomId}`)
    const data = await res.json()
    setMessages(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (view === 'rooms')  loadRooms()
  }, [view, loadRooms])

  useEffect(() => {
    if (view === 'detail' && selectedRoom) loadMessages(selectedRoom.id)
  }, [view, selectedRoom, loadMessages])

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.refresh()
  }

  async function handleCreateRoom(e) {
    e.preventDefault()
    if (!roomName.trim()) return
    setCreating(true)

    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName.trim() }),
    })

    const data = await res.json()
    if (res.ok) {
      setCreatedRoom(data)
      setRoomName('')
    }
    setCreating(false)
  }

  async function handleDeleteMessage(id) {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMessages(prev => prev.filter(m => m.id !== id))
      setSelectedRoom(prev => ({ ...prev, message_count: prev.message_count - 1 }))
    }
  }

  // Elimina la sala y todas sus preguntas (cascada en la base de datos)
  async function handleDeleteRoom(code) {
    setDeleting(true)
    const res = await fetch(`/api/rooms/${code}`, { method: 'DELETE' })
    if (res.ok) {
      setRooms(prev => prev.filter(r => r.code !== code))
      setConfirmDelete(null)
    }
    setDeleting(false)
  }

  function getShareUrl(code) {
    return `${window.location.origin}/r/${code}`
  }

  function copyLink(code) {
    navigator.clipboard.writeText(getShareUrl(code))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function goToRoom(room) {
    setSelectedRoom(room)
    setView('detail')
  }

  // ── Vista: crear sala ───────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => { setView('rooms'); setCreatedRoom(null); setRoomName('') }}
            className="flex items-center gap-1 text-amber-700 font-medium mb-4"
          >
            ← Volver
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-amber-800 mb-5">Nueva Sala de Preguntas</h2>

            {!createdRoom ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">
                    Nombre de la sala
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Clase de Jóvenes — 2 ago"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    autoFocus
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {creating ? 'Creando...' : '✨ Crear Sala'}
                </button>
              </form>
            ) : (
              // ── Sala creada: mostrar link para compartir
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-bold text-lg">¡Sala creada! 🎉</p>
                  <p className="text-green-600 text-sm mt-0.5">
                    Comparte este link con los jóvenes:
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1 break-all">
                    {getShareUrl(createdRoom.code)}
                  </span>
                  <button
                    onClick={() => copyLink(createdRoom.code)}
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-2 rounded-lg font-semibold transition"
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setCreatedRoom(null); loadRooms(); setView('rooms') }}
                    className="flex-1 border border-amber-300 text-amber-700 py-3 rounded-xl font-medium text-sm"
                  >
                    Ver todas las salas
                  </button>
                  <button
                    onClick={() => goToRoom(createdRoom)}
                    className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-medium text-sm"
                  >
                    Ver preguntas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Vista: detalle de sala (lista de mensajes) ──────────────
  if (view === 'detail' && selectedRoom) {
    return (
      <div className="min-h-screen bg-amber-50">
        {/* Header sticky */}
        <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => { setView('rooms'); setSelectedRoom(null) }}
            className="text-amber-700 text-xl font-bold px-1"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 truncate">{selectedRoom.name}</h1>
            <p className="text-xs text-gray-400">
              {selectedRoom.message_count} pregunta{selectedRoom.message_count !== 1 ? 's' : ''} recibida{selectedRoom.message_count !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => copyLink(selectedRoom.code)}
            className="shrink-0 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-medium transition"
          >
            {copied ? '✓ Copiado' : '🔗 Compartir'}
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-3 pb-10">
          {loading ? (
            <p className="text-center text-gray-400 py-10">Cargando preguntas...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-400 font-medium">Aún no hay preguntas</p>
              <p className="text-gray-300 text-sm mt-1">
                Comparte el link con los jóvenes para comenzar
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id}
                className="bg-white rounded-xl shadow-sm p-4 flex gap-3 items-start"
              >
                <span className="text-gray-300 text-sm font-mono mt-0.5 w-6 shrink-0">
                  {messages.length - i}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(msg.created_at).toLocaleString('es', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  title="Eliminar"
                  className="shrink-0 text-gray-200 hover:text-red-400 transition text-xl leading-none"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ── Vista: lista de salas (principal) ───────────────────────
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🙏</span>
          <h1 className="font-bold text-amber-800 text-lg">Preguntas Sabáticas</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 transition"
        >
          Salir
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Botón principal: nueva sala */}
        <button
          onClick={() => setView('create')}
          className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-sm transition mb-6"
        >
          + Crear nueva sala de preguntas
        </button>

        {/* Lista de salas anteriores */}
        {loading ? (
          <p className="text-center text-gray-400 py-8">Cargando...</p>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Aún no has creado ninguna sala.</p>
            <p className="text-sm mt-1">¡Crea la primera para comenzar!</p>
          </div>
        ) : (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Salas anteriores
            </h2>
            <div className="space-y-2">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  {confirmDelete === room.code ? (
                    // ── Confirmación de borrado
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        ¿Borrar «{room.name}»?
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Se eliminarán también sus {room.message_count} pregunta
                        {room.message_count !== 1 ? 's' : ''}. No se puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          disabled={deleting}
                          className="flex-1 text-sm border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.code)}
                          disabled={deleting}
                          className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                        >
                          {deleting ? 'Borrando...' : 'Sí, borrar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ── Fila normal
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => goToRoom(room)}
                      >
                        <p className="font-semibold text-gray-800 truncate">{room.name}</p>
                        <p className="text-sm text-amber-600">
                          {room.message_count} pregunta{room.message_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => copyLink(room.code)}
                        title="Copiar link"
                        className="shrink-0 text-xs border border-gray-200 text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        {copied ? '✓' : '🔗'}
                      </button>
                      <button
                        onClick={() => goToRoom(room)}
                        className="shrink-0 text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition font-medium"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => setConfirmDelete(room.code)}
                        title="Borrar sala"
                        className="shrink-0 text-xs border border-gray-200 text-gray-300 hover:text-red-500 hover:border-red-200 px-2.5 py-2 rounded-lg transition"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
