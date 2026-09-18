import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DemoBanner from './components/common/DemoBanner.jsx';
import Navbar from './components/common/Navbar.jsx';
import Toast from './components/common/Toast.jsx';

// Modals
import LoginModal from './components/auth/LoginModal.jsx';
import RegisterModal from './components/auth/RegisterModal.jsx';
import OtpVerifyModal from './components/auth/OtpVerifyModal.jsx';
import CreateReportModal from './components/reports/CreateReportModal.jsx';
import ReportDetailModal from './components/reports/ReportDetailModal.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WorkerPortalPage from './pages/WorkerPortalPage.jsx';
import AdminPortalPage from './pages/AdminPortalPage.jsx';

export default function App() {
  const { activeModal } = useSelector((s) => s.ui);

  return (
    <div className="app-shell">
      {/* Sticky Demo/Live Banner */}
      <DemoBanner />

      {/* Global Navbar */}
      <Navbar />

      {/* Route Views */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/worker" element={<WorkerPortalPage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toast />

      {/* Global Modals */}
      {activeModal === 'login' && <LoginModal />}
      {activeModal === 'register' && <RegisterModal />}
      {activeModal === 'otp' && <OtpVerifyModal />}
      {activeModal === 'createReport' && <CreateReportModal />}
      {activeModal === 'reportDetail' && <ReportDetailModal />}
    </div>
  );
}
