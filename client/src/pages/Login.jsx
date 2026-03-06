import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../hooks/useAuth'
import { Mic, AlertCircle, Sparkles, Shield } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(adminKey)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid admin key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="container max-w-md mx-auto px-4">
        <Card className="relative overflow-hidden border-0 shadow-2xl">
          {/* Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          
          <CardHeader className="space-y-1 text-center pt-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Mic className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QVox
              </span>
            </CardTitle>
            
            <CardDescription className="text-base">
              Secure API testing platform for transcription services
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="adminKey" className="text-sm font-medium">
                  Admin Access Key
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="adminKey"
                    type="password"
                    placeholder="Enter your admin key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 pl-10 pr-4 bg-gray-50 dark:bg-gray-900 border-2 focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use the admin key from your .env file
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium relative overflow-hidden group"
                disabled={loading}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all" />
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Access Dashboard
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Secure enterprise-grade authentication</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 QVox Technologies. All rights reserved.
        </p>
      </div>
    </div>
  )
}