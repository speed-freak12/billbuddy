import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import blink from './blink/client'
import Dashboard from './assets/components/ui/Dashboard'
import AddSubscription from './assets/components/ui/AddSubscription'
import Buddies from './assets/components/ui/Buddies'
import Settings from './assets/components/ui/Settings'
import { Toaster } from "@/components/ui/toaster";
import { CurrencyProvider } from './contexts/CurrencyContext'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Bill Buddy...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Bill Buddy</h1>
            <p className="text-muted-foreground">
              Effortless subscription & bill splitting
            </p>
          </div>
          
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to track your subscriptions and split bills with friends.
            </p>
            
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CurrencyProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/add" element={<AddSubscription user={user} />} />
            <Route path="/buddies" element={<Buddies user={user} />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </CurrencyProvider>
  )
}

export default App