import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const fullName = localStorage.getItem('full_name')
    if (token && role) return { token, role, fullName }
    return null
  })

  const login = (data) => {
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('full_name', data.full_name)
    setUser({
      token: data.access_token,
      role: data.role,
      fullName: data.full_name,
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('full_name')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
