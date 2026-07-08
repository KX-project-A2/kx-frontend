import { Routes, Route } from 'react-router-dom';
import ImageGenerationPage from '@/pages/ImageGenerationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ImageGenerationPage />} />
      <Route path="/image" element={<ImageGenerationPage />} />
    </Routes>
  );
}

export default App;
