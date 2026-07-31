import './globals.css'

export const metadata = {
  title: 'Preguntas Anónimas',
  description: 'Envía tus preguntas y comentarios de forma completamente anónima.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-amber-50 antialiased">
        {children}
      </body>
    </html>
  )
}
