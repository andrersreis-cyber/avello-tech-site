import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Pedidos } from './pages/Pedidos'
import { Clients } from './pages/Clients'
import { Reports } from './pages/Reports'
import { Login } from './pages/Login'
import { LandingPage } from './pages/landing/LandingPage'
import { Cardapio } from './pages/Cardapio'
import { PDV } from './pages/PDV'
import { Mesas } from './pages/Mesas'
import { Garcom } from './pages/Garcom'
import { Comandas } from './pages/Comandas'
import { WhatsApp } from './pages/WhatsApp'
import { supabase } from './lib/supabase'

function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Check current session — timeout so LandingPage never blocks
    const timeout = setTimeout(() => setAuthReady(true), 3000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setUser(session?.user ?? null)
      setAuthReady(true)
    }).catch(() => {
      clearTimeout(timeout)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas sempre públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/garcom" element={<Garcom />} />

        {/* Rotas protegidas do Dashboard */}
        {authReady && user ? (
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="pdv" element={<PDV />} />
            <Route path="mesas" element={<Mesas />} />
            <Route path="comandas" element={<Comandas />} />
            <Route path="whatsapp" element={<WhatsApp />} />
          </Route>
        ) : null}
      </Routes>
    </BrowserRouter>
  )
}

export default App
