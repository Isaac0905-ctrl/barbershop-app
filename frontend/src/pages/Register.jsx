import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        email,
        phone,
        password,
      })
      login(res.data)
      navigate('/profile')
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Ya existe una cuenta con ese email')
      } else {
        setError('Error al crear la cuenta. Intentalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
        <p className="text-gray-400 text-sm mb-8">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="text-amber-400 hover:underline">
            Inicia sesion
          </Link>
        </p>

        {error && (
          <div className="bg-red-900 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Juan Garcia"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">Telefono (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="612345678"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-400 text-gray-900 font-semibold py-3 rounded-full hover:bg-amber-300 transition disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
