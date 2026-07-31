export default function NotFound() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sala no encontrada</h2>
        <p className="text-gray-500 text-sm">
          El link puede haber expirado o ser incorrecto.
        </p>
      </div>
    </div>
  )
}
