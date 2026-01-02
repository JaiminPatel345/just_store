import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import RetrievePage from './pages/RetrievePage';
import DownloadPage from './pages/DownloadPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<UploadPage />} />
        <Route path="retrieve" element={<RetrievePage />} />
        <Route path="download" element={<DownloadPage />} />
      </Route>
    </Routes>
  );
}

export default App;
