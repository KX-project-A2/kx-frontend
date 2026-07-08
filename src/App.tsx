import { Routes, Route } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import ImageGenerationPage from '@/pages/ImageGenerationPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ImageGenerationPage />} />
        <Route path="/image" element={<ImageGenerationPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
