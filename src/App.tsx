import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Home from '@/pages/Home';
import ImageGenerationPage from '@/pages/ImageGenerationPage';
import VideoGenerationPage from '@/pages/VideoGenerationPage';
import Library from '@/pages/Library';
import Login from '@/pages/Login';
import SignupEmail from '@/pages/SignupEmail';
import SignupNickname from '@/pages/SignupNickname';
import SignupPassword from '@/pages/SignupPassword';
import OAuthCallback from '@/pages/OAuthCallback';

function App() {
  return (
    <>
      <div className="app-backdrop" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupEmail />} />
        <Route path="/signup/nickname" element={<SignupNickname />} />
        <Route path="/signup/password" element={<SignupPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        <Route
          element={
            <ProtectedRoute>
              <AppShell>
                <Outlet />
              </AppShell>
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/image" element={<ImageGenerationPage />} />
          <Route path="/video" element={<VideoGenerationPage />} />
          <Route path="/library" element={<Library />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
