import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { ModalProvider } from './components/Modal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import WorkDetailPage from './pages/WorkDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const location = useLocation();
  const path = location.pathname;
  const page = path === '/about' ? 'about' : path.startsWith('/work/') ? 'work' : 'home';

  return (
    <ModalProvider>
      <ScrollToTop />
      <a href="#main-content" className="sr-only">Skip to main content</a>
      <div
        className="flex flex-col min-h-screen gap-[var(--gap-after-nav)]"
        data-page={page}
      >
        <header>
          <Navbar />
        </header>

        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/work/:slug" element={<WorkDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </ModalProvider>
  );
}

export default App;