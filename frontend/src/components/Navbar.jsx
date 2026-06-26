import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        <Link to="/" className="text-xl font-bold text-white">
          Barberia <span className="text-amber-400">Clasica</span>
        </Link>

        <div className="flex items-center gap-6">
          {!user && (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white transition text-sm">
                Iniciar sesion
              </Link>
              <Link to="/register" className="bg-amber-400 text-gray-900 font-semibold px-5 py-2 rounded-full hover:bg-amber-300 transition text-sm">
                Registrarse
              </Link>
            </>
          )}

          {user?.role === 'client' && (
            <>
              <Link to="/booking" className="text-gray-400 hover:text-white transition text-sm">
                Reservar
              </Link>
              <Link to="/profile" className="text-gray-400 hover:text-white transition text-sm">
                Mi perfil
              </Link>
              <span className="text-amber-400 text-sm font-semibold">
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition text-sm"
              >
                Cerrar sesion
              </button>
            </>
          )}

          {user?.role === 'barber' && (
            <>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
                Dashboard
              </Link>
              <span className="text-amber-400 text-sm font-semibold">
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition text-sm"
              >
                Cerrar sesion
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar
