function Home() {
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
          {[
            { name: 'Corte clasico', price: '15EUR', duration: '30 min', desc: 'Corte tradicional a tijera o maquina.' },
            { name: 'Corte y barba', price: '25EUR', duration: '45 min', desc: 'Corte de cabello y arreglo de barba completo.' },
            { name: 'Arreglo de barba', price: '12EUR', duration: '20 min', desc: 'Perfilado y arreglo de barba con navaja.' },
            { name: 'Corte infantil', price: '10EUR', duration: '25 min', desc: 'Corte para ninos hasta 12 anos.' },
          ].map((service) => (
            <div key={service.name} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3 hover:bg-gray-700 transition">
              <h3 className="text-lg font-semibold text-amber-400">{service.name}</h3>
              <p className="text-gray-400 text-sm flex-1">{service.desc}</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-white font-bold">{service.price}</span>
                <span className="text-gray-500">{service.duration}</span>
              </div>
              <a href="/booking" className="mt-2 text-center bg-amber-400 text-gray-900 font-semibold py-2 rounded-full hover:bg-amber-300 transition text-sm">
                Reservar
              </a>
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
