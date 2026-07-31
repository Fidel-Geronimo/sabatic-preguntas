import { cookies } from 'next/headers'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export const metadata = {
  title: 'Admin — Preguntas Sabáticas',
}

export default async function AdminPage() {
  const store = await cookies()
  const isAuthenticated = store.get('admin_session')?.value === 'authenticated'

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}
