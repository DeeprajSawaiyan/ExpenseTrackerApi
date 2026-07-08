import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomeRedirect from './components/HomeRedirect'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AddExpensePage from './pages/AddExpensePage'
import DashboardPage from './pages/DashboardPage'
import EditExpensePage from './pages/EditExpensePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/expenses/new" element={<AddExpensePage />} />
            <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
