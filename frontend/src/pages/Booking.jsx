import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Booking() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          api.get('/services/'),
          api.get('/barbers/'),
        ])
        setServices(servicesRes.data)
        setBarbers(barbersRes.data)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, navigate])

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
      await api.post('/appointments/', {
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        scheduled_at: scheduledAt,
        notes: notes || null,
      })
      navigate('/profile')
    } catch (err) {
      if (err.response?.status === 409) {
        setError('El barbero ya tiene una cita en ese horario. Elige otro.')
      } else if (err.response?.status === 400) {
        setError('La fecha y hora deben ser futuras.')
      } else {
        setError('Error al reservar la cita. Intentalo de nuevo.')
      }
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-amber-400 text-xl">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Reservar cita</h1>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition ${
                  s <= step ? "bg-amber-400" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {step === 1 && "Paso 1 de 3 - Elige un servicio"}
            {step === 2 && "Paso 2 de 3 - Elige un barbero"}
            {step === 3 && "Paso 3 de 3 - Elige fecha y hora"}
          </p>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => { setSelectedService(service); setStep(2) }}
                className={`bg-gray-800 rounded-2xl p-6 cursor-pointer hover:bg-gray-700 transition border-2 ${
                  selectedService?.id === service.id ? "border-amber-400" : "border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-amber-400">{service.name}</h3>
                  <span className="text-white font-bold">{service.price}EUR</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{service.description}</p>
                <p className="text-gray-500 text-sm mt-1">{service.duration_min} min</p>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                onClick={() => { setSelectedBarber(barber); setStep(3) }}
                className={`bg-gray-800 rounded-2xl p-6 cursor-pointer hover:bg-gray-700 transition border-2 flex items-center gap-4 ${
                  selectedBarber?.id === barber.id ? "border-amber-400" : "border-transparent"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-gray-900 text-xl font-bold flex-shrink-0">
                  {barber.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{barber.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{barber.bio}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white transition text-sm mt-2"
            >
              Volver atras
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Fecha</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Hora</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Alguna indicacion especial..."
                  className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-sm text-gray-400 mb-3">Resumen</h3>
              <p className="text-white"><span className="text-gray-400">Servicio:</span> {selectedService?.name}</p>
              <p className="text-white mt-1"><span className="text-gray-400">Barbero:</span> {selectedBarber?.name}</p>
              <p className="text-white mt-1"><span className="text-gray-400">Precio:</span> {selectedService?.price}EUR</p>
            </div>

            {error && (
              <div className="bg-red-900 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!date || !time || submitting}
              className="bg-amber-400 text-gray-900 font-semibold py-3 rounded-full hover:bg-amber-300 transition disabled:opacity-50"
            >
              {submitting ? "Reservando..." : "Confirmar reserva"}
            </button>

            <button
              onClick={() => setStep(2)}
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Volver atras
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Booking
