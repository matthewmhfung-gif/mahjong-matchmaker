import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Matchmaking from './pages/Matchmaking';
import Sessions from './pages/Sessions';
import PlayerDirectory from './pages/PlayerDirectory';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/players" element={<PlayerDirectory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
