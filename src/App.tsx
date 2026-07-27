import { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Home from '@/pages/Home';
import ImageGenerationPage from '@/pages/ImageGenerationPage';
import VideoGenerationPage from '@/pages/VideoGenerationPage';
import ReversePromptPage from '@/pages/ReversePromptPage';
import Library from '@/pages/Library';
import ProfilePage from '@/pages/ProfilePage';
import Login from '@/pages/Login';
import SignupEmail from '@/pages/SignupEmail';
import SignupNickname from '@/pages/SignupNickname';
import SignupPassword from '@/pages/SignupPassword';
import OAuthCallback from '@/pages/OAuthCallback';
import { fetchMe } from '@/services/auth';
import { useAuthStore } from '@/hooks/useAuthStore';

function App() {
  const setChecking = useAuthStore((state) => state.setChecking);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  useEffect(() => {
    setChecking();
    fetchMe()
      .then((profile) => setAuthenticated(profile))
      .catch(() => setUnauthenticated());
  }, [setChecking, setAuthenticated, setUnauthenticated]);

  return (
    <>
      <div className="app-backdrop" />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
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
          <Route path="/reverse-prompt" element={<ReversePromptPage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
