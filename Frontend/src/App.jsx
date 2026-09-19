import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import ReportsPage from './pages/ReportsPage.jsx';
import CreateReportPage from './pages/CreateReportPage.jsx';
import InspectReportPage from './pages/InspectReportPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WorkerPortalPage from './pages/WorkerPortalPage.jsx';
import WorkerProfilePage from './pages/WorkerProfilePage.jsx';
import AdminPortalPage from './pages/AdminPortalPage.jsx';

export default function App() {
  const { activeModal } = useSelector((s) => s.ui);

  return (
    <div className="app-shell">
      {/* Global Navbar */}
      <Navbar />

      {/* Route Views */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<InspectReportPage />} />
          <Route path="/report" element={<CreateReportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/worker" element={<WorkerPortalPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
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
