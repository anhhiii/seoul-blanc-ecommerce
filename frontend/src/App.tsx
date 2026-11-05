import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes.js';
import { ScrollToTop } from './components/common/ScrollToTop.js';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
