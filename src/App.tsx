import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Explorer from './pages/Explorer'
import Integrations from './pages/Integrations'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Pricing from './pages/Pricing'
import Signup from './pages/Signup'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
