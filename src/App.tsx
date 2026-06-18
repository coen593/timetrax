import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { TimeTracker } from './pages/TimeTracker'
import { Clients } from './pages/Clients'
import { Reports } from './pages/Reports'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="track" element={<TimeTracker />} />
          <Route path="clients" element={<Clients />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
