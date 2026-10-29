import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CampaignList from './pages/CampaignList'
import CampaignCreate from './pages/CampaignCreate'
import CampaignDetail from './pages/CampaignDetail'
import Account from './pages/Account'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/new" element={<CampaignCreate />} />
            <Route path="/campaigns/:campaignId/edit" element={<CampaignCreate />} />
            <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
