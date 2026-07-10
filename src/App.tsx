import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import Home from '@/pages/Home';
import ImageGenerationPage from '@/pages/ImageGenerationPage';
import VideoGenerationPage from '@/pages/VideoGenerationPage';
import Library from '@/pages/Library';
import Login from '@/pages/Login';
import SignupEmail from '@/pages/SignupEmail';
import SignupPassword from '@/pages/SignupPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupEmail />} />
      <Route path="/signup/password" element={<SignupPassword />} />

      <Route
        element={
          <AppShell>
            <Outlet />
          </AppShell>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/image" element={<ImageGenerationPage />} />
        <Route path="/video" element={<VideoGenerationPage />} />
        <Route path="/library" element={<Library />} />
      </Route>
    </Routes>
  );
}

export default App;
