import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CampaignList from './pages/CampaignList'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaigns/new" element={<div>캠페인 등록</div>} />
          <Route path="/campaigns/:campaignId" element={<div>캠페인 상세</div>} />
          <Route path="/account" element={<div>내 정보</div>} />
        </Route>
        <Route path="/login" element={<div>로그인</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
