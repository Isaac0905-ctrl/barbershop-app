import { useState, useEffect } from 'react'
import api from '../api/axios'

function Home() {
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-amber-400 text-xl">Cargando...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-gray-900">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Barberia <span className="text-amber-400">Clasica</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-8">
          Mas de 10 anos dando el mejor servicio en cortes clasicos y modernos.
          Reserva tu cita en minutos.
        </p>
        <a href="/booking" className="bg-amber-400 text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-amber-300 transition">
          Reservar cita
        </a>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Nuestros servicios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3 hover:bg-gray-700 transition">
              <h3 className="text-lg font-semibold text-amber-400">{service.name}</h3>
              <p className="text-gray-400 text-sm flex-1">{service.description}</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-white font-bold">{service.price}EUR</span>
                <span className="text-gray-500">{service.duration_min} min</span>
              </div>
              <a href="/booking" className="mt-2 text-center bg-amber-400 text-gray-900 font-semibold py-2 rounded-full hover:bg-amber-300 transition text-sm">
                Reservar
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Nuestros barberos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {barbers.map((barber) => (
            <div key={barber.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-gray-900 text-2xl font-bold">
                {barber.name.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold">{barber.name}</h3>
              <p className="text-gray-400 text-sm">{barber.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Sobre nosotros</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Somos una barberia tradicional con mas de 10 anos de experiencia.
            Nuestro equipo de barberos especializados combina tecnicas clasicas
            con tendencias modernas para ofrecerte el mejor resultado.
          </p>
        </div>
      </section>

    </main>
  )
}

export default Home
