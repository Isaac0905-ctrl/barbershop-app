import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/my')
        setAppointments(res.data)
      } catch (error) {
        console.error('Error cargando citas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const statusLabel = {
    pending: { text: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10' },
    confirmed: { text: 'Confirmada', color: 'text-green-400 bg-green-400/10' },
    cancelled: { text: 'Cancelada', color: 'text-red-400 bg-red-400/10' },
    completed: { text: 'Completada', color: 'text-gray-400 bg-gray-400/10' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-amber-400 text-xl">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Hola, {user?.fullName}</h1>
            <p className="text-gray-400 mt-1">Aqui puedes ver tus citas</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
            Cerrar sesion
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mis citas</h2>
          <a href="/booking" className="bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-amber-300 transition text-sm">
            Nueva cita
          </a>
        </div>
        {appointments.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-400 mb-4">No tienes citas todavia</p>
            <a href="/booking" className="bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-amber-300 transition text-sm">
              Reservar primera cita
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    {new Date(apt.scheduled_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' - '}
                    {new Date(apt.scheduled_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusLabel[apt.status].color}`}>
                    {statusLabel[apt.status].text}
                  </span>
                </div>
                {apt.notes && (
                  <p className="text-gray-400 text-sm">{apt.notes}</p>
                )}
                {apt.cancellation_reason && (
                  <div className="bg-red-900/30 text-red-300 text-sm px-4 py-3 rounded-xl">
                    Motivo de cancelacion: {apt.cancellation_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
