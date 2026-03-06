import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const adminKey = localStorage.getItem('adminKey')
    if (adminKey) {
      try {
        // Verify admin key by making a test request
        await api.get('/admin/keys')
        setUser({ role: 'admin' })
      } catch (error) {
        localStorage.removeItem('adminKey')
      }
    }
    setLoading(false)
  }

  const login = async (adminKey) => {
    try {
      // Test the admin key
      await api.get('/admin/keys', {
        headers: { 'x-admin-key': adminKey }
      })
      
      localStorage.setItem('adminKey', adminKey)
      setUser({ role: 'admin' })
    } catch (error) {
      throw new Error('Invalid admin key')
    }
  }

  const logout = () => {
    localStorage.removeItem('adminKey')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}