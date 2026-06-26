import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'barber') {
      navigate('/profile')
      return
    }
    fetchAppointments()
  }, [user, navigate])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/barber')
      setAppointments(res.data)
    } catch (error) {
      console.error('Error cargando citas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/appointments/${id}/confirm`)
      fetchAppointments()
    } catch (err) {
      console.error('Error confirmando cita:', err)
    }
  }

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      setError('El motivo de cancelacion es obligatorio')
      return
    }
    try {
      await api.patch(`/appointments/${id}/cancel`, { reason: cancelReason })
      setCancellingId(null)
      setCancelReason('')
      setError(null)
      fetchAppointments()
    } catch (err) {
      console.error('Error cancelando cita:', err)
    }
  }

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

  const pending = appointments.filter(a => a.status === "pending")
  const confirmed = appointments.filter(a => a.status === "confirmed")
  const others = appointments.filter(a => !["pending", "confirmed"].includes(a.status))

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-amber-400 mt-1">{user?.fullName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
            Cerrar sesion
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
            <p className="text-gray-400 text-sm mt-1">Pendientes</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{confirmed.length}</p>
            <p className="text-gray-400 text-sm mt-1">Confirmadas</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{appointments.length}</p>
            <p className="text-gray-400 text-sm mt-1">Total</p>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Pendientes de confirmacion</h2>
            <div className="flex flex-col gap-4">
              {pending.map((apt) => (
                <div key={apt.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {new Date(apt.scheduled_at).toLocaleDateString("es-ES", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                      {" - "}
                      {new Date(apt.scheduled_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusLabel[apt.status].color}`}>
                      {statusLabel[apt.status].text}
                    </span>
                  </div>
                  {apt.notes && <p className="text-gray-400 text-sm">{apt.notes}</p>}

                  {cancellingId === apt.id ? (
                    <div className="flex flex-col gap-3">
                      {error && <p className="text-red-400 text-sm">{error}</p>}
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Motivo de cancelacion (obligatorio)"
                        rows={3}
                        className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="flex-1 bg-red-500 text-white font-semibold py-2 rounded-full hover:bg-red-400 transition text-sm"
                        >
                          Confirmar cancelacion
                        </button>
                        <button
                          onClick={() => { setCancellingId(null); setCancelReason(''); setError(null) }}
                          className="flex-1 bg-gray-700 text-white font-semibold py-2 rounded-full hover:bg-gray-600 transition text-sm"
                        >
                          Volver
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirm(apt.id)}
                        className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-full hover:bg-green-400 transition text-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setCancellingId(apt.id)}
                        className="flex-1 bg-gray-700 text-white font-semibold py-2 rounded-full hover:bg-gray-600 transition text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {confirmed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Confirmadas</h2>
            <div className="flex flex-col gap-4">
              {confirmed.map((apt) => (
                <div key={apt.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {new Date(apt.scheduled_at).toLocaleDateString("es-ES", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                      {" - "}
                      {new Date(apt.scheduled_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusLabel[apt.status].color}`}>
                      {statusLabel[apt.status].text}
                    </span>
                  </div>
                  {apt.notes && <p className="text-gray-400 text-sm">{apt.notes}</p>}
                  <button
                    onClick={() => setCancellingId(apt.id)}
                    className="bg-gray-700 text-white font-semibold py-2 rounded-full hover:bg-gray-600 transition text-sm"
                  >
                    Cancelar cita
                  </button>
                  {cancellingId === apt.id && (
                    <div className="flex flex-col gap-3">
                      {error && <p className="text-red-400 text-sm">{error}</p>}
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Motivo de cancelacion (obligatorio)"
                        rows={3}
                        className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="flex-1 bg-red-500 text-white font-semibold py-2 rounded-full hover:bg-red-400 transition text-sm"
                        >
                          Confirmar cancelacion
                        </button>
                        <button
                          onClick={() => { setCancellingId(null); setCancelReason(''); setError(null) }}
                          className="flex-1 bg-gray-700 text-white font-semibold py-2 rounded-full hover:bg-gray-600 transition text-sm"
                        >
                          Volver
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-400">Historial</h2>
            <div className="flex flex-col gap-4">
              {others.map((apt) => (
                <div key={apt.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-2 opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {new Date(apt.scheduled_at).toLocaleDateString("es-ES", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusLabel[apt.status].color}`}>
                      {statusLabel[apt.status].text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard
