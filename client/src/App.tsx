import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import KnowledgePage from './pages/KnowledgePage'
import ProjectDetailPage from './pages/ProjectDetailPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="knowledge/projects/:id" element={<ProjectDetailPage />} />
          <Route path="documents" element={<Navigate to="/knowledge" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
