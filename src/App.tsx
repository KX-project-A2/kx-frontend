import { Routes, Route } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import Home from '@/pages/Home';
import ImageGenerationPage from '@/pages/ImageGenerationPage';
import Library from '@/pages/Library';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/image" element={<ImageGenerationPage />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </AppShell>
  );
}

export default App;
