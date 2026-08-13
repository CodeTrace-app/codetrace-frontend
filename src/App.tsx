import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import CreateOrganization from './pages/CreateOrganization'
import Dashboard from './pages/Dashboard'
import Explorer from './pages/Explorer'
import Integrations from './pages/Integrations'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Pricing from './pages/Pricing'
import PrWarnings from './pages/PrWarnings'
import Signup from './pages/Signup'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 헤더는 모든 화면에 있다. 로그인 전에는 공개 메뉴만 보인다 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 가입은 했지만 조직이 없는 상태에서만 들어오는 화면 */}
            <Route element={<RequireAuth requireOrganization={false} />}>
              <Route path="/signup/organization" element={<CreateOrganization />} />
            </Route>

            {/* 로그인·조직이 있어야 하는 화면. 데모 세션도 여기 들어온다 (읽기 전용) */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/pr-warnings" element={<PrWarnings />} />
              <Route path="/settings/integrations" element={<Integrations />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          {/* 없는 주소로 들어와도 에러 화면을 띄우지 않는다 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
