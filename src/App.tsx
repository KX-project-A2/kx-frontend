import { Routes, Route } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import Home from '@/pages/Home';
import ImageGenerationPage from '@/pages/ImageGenerationPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/image" element={<ImageGenerationPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
